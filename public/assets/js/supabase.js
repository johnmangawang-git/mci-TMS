// Check if supabaseClientInstance is already defined to prevent duplicate identifier errors
if (typeof window.supabaseClientInstance !== 'undefined') {
    console.log('⚠️ supabaseClientInstance already defined, skipping definition');
} else {
    /**
     * Supabase Client and Authentication Module
     * Handles all Supabase operations with fallback to localStorage
     */

    console.log('🔧 Loading Supabase integration...');

    // Global Supabase client - prevent multiple instances
    let supabaseClientInstance;

    // Check if already initialized to prevent GoTrueClient warnings
    if (window.supabaseClientInitialized) {
        console.log('🛡️ Supabase client already initialized, using existing instance');
        supabaseClientInstance = window.globalSupabaseClient;
    } else {
        supabaseClientInstance = null;
    }

    let isOnline = true;
    let connectionRetries = 0;
    const MAX_RETRIES = 3;

    /**
     * Initialize Supabase client
     */
    function initSupabase() {
        try {
            // Check if Supabase library is available
            if (typeof window.supabase === 'undefined') {
                console.warn('Supabase library not loaded, using localStorage fallback');
                return null;
            }

            // Get configuration from window variables
            const supabaseUrl = window.SUPABASE_URL;
            const supabaseKey = window.SUPABASE_ANON_KEY;

            console.log('🔍 Supabase configuration:', {
                url: supabaseUrl ? '***' + supabaseUrl.substring(supabaseUrl.length - 10) : 'MISSING',
                key: supabaseKey ? '***' + supabaseKey.substring(supabaseKey.length - 10) : 'MISSING'
            });

            if (!supabaseUrl || !supabaseKey) {
                console.error('Supabase configuration missing');
                return null;
            }

            // Create Supabase client only if not already created
            if (!window.supabaseClientInitialized) {
                supabaseClientInstance = window.supabase.createClient(supabaseUrl, supabaseKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });

            console.log('✅ Supabase client initialized successfully');
            
            // Test connection
            testConnection();
            
            // Set up auth state listener
                setupAuthStateListener();
                
                // Mark as initialized and store globally
                window.supabaseClientInitialized = true;
                window.globalSupabaseClient = supabaseClientInstance;
                console.log('✅ Supabase client created and marked as initialized');
            } else {
                console.log('✅ Using existing Supabase client instance');
            }
            
            return supabaseClientInstance;
            
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            return null;
        }
    }

    /**
     * Test Supabase connection
     */
    async function testConnection() {
        if (!supabaseClientInstance) {
            isOnline = false;
            return false;
        }

        try {
            // Simple query to test connection
            const { data, error } = await supabaseClientInstance
                .from('deliveries')
                .select('count', { count: 'exact', head: true });
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
                throw error;
            }
            
            isOnline = true;
            connectionRetries = 0;
            console.log('✅ Supabase connection test successful');
            return true;
            
        } catch (error) {
            console.warn('⚠️ Supabase connection test failed:', error.message);
            isOnline = false;
            
            // Retry connection
            if (connectionRetries < MAX_RETRIES) {
                connectionRetries++;
                setTimeout(() => testConnection(), 2000 * connectionRetries);
            }
            
            return false;
        }
    }

    /**
     * Setup authentication state listener
     */
    function setupAuthStateListener() {
        if (!supabaseClientInstance) return;

        supabaseClientInstance.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            switch (event) {
                case 'SIGNED_IN':
                    handleSignIn(session.user);
                    break;
                case 'SIGNED_OUT':
                    handleSignOut();
                    break;
                case 'TOKEN_REFRESHED':
                    console.log('Token refreshed successfully');
                    break;
            }
        });
    }

    /**
     * Handle user sign in
     */
    function handleSignIn(user) {
        const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            role: 'Logistics Manager',
            avatar_url: user.user_metadata?.avatar_url
        };

        localStorage.setItem('mci-user', JSON.stringify(userData));
        updateUserInterface(userData);
        console.log('✅ User signed in:', userData.email);
    }

    /**
     * Handle user sign out
     */
    function handleSignOut() {
        localStorage.removeItem('mci-user');
        updateUserInterface(null);
        console.log('✅ User signed out');
    }

    /**
     * Update user interface elements
     */
    function updateUserInterface(userData) {
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        const userAvatarEl = document.getElementById('userAvatar');

        if (userData) {
            if (userNameEl) userNameEl.textContent = userData.name;
            if (userRoleEl) userRoleEl.textContent = userData.role;
            if (userAvatarEl) {
                const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();
                userAvatarEl.textContent = initials;
            }
        } else {
            if (userNameEl) userNameEl.textContent = 'Guest User';
            if (userRoleEl) userRoleEl.textContent = 'Not Authenticated';
            if (userAvatarEl) userAvatarEl.textContent = 'GU';
        }
    }

    /**
     * Authentication Functions
     */

    // Sign up new user
    async function signUp(email, password, fullName) {
        if (!supabaseClientInstance) {
            throw new Error('Supabase not available');
        }

        // Define allowed email addresses
        const allowedEmails = [
            'pat.opena@smegphilippines.com',
            'marie.pineda@smegphilippines.com',
            'mariagresusa.vega@smegphilippines.com',
            'john.mangawang@smegphilippines.com'
        ];

        // Check if email is in the allowed list
        if (!allowedEmails.includes(email.toLowerCase())) {
            throw new Error('Registration Denied! Please contact your IT admin.');
        }

        try {
            const { data, error } = await supabaseClientInstance.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            console.log('✅ User signed up successfully');
            return data;
            
        } catch (error) {
            console.error('❌ Sign up failed:', error);
            throw error;
        }
    }

    // Sign in existing user
    async function signIn(email, password) {
        if (!supabaseClientInstance) {
            throw new Error('Supabase not available');
        }

        try {
            const { data, error } = await supabaseClientInstance.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('✅ User signed in successfully');
            return data;
            
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            throw error;
        }
    }

    // Sign out user
    async function signOut() {
        if (!supabaseClientInstance) {
            handleSignOut();
            return;
        }

        try {
            const { error } = await supabaseClientInstance.auth.signOut();
            if (error) throw error;
            
            console.log('✅ User signed out successfully');
            
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            // Still clear local session
            handleSignOut();
        }
    }

    // Get current user
    function getCurrentUser() {
        if (!supabaseClientInstance) {
            const savedUser = localStorage.getItem('mci-user');
            return savedUser ? JSON.parse(savedUser) : null;
        }

        return supabaseClientInstance.auth.getUser();
    }

    // Check if user is authenticated
    async function isAuthenticated() {
        if (!supabaseClientInstance) {
            return !!localStorage.getItem('mci-user');
        }

        try {
            const { data: { user } } = await supabaseClientInstance.auth.getUser();
            return !!user;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    /**
     * Database Operations with Fallback
     */

    // Generic database operation with fallback
    async function executeWithFallback(operation, fallbackOperation) {
        if (!isOnline || !supabaseClientInstance) {
            console.log('Using localStorage fallback');
            return await fallbackOperation();
        }

        try {
            const result = await operation();
            return result;
        } catch (error) {
            console.warn('Supabase operation failed, using fallback:', error);
            isOnline = false;
            return await fallbackOperation();
        }
    }

    // Save delivery to Supabase
    async function saveDelivery(delivery) {
        const supabaseOperation = async () => {
            console.log('💾 Mapping delivery to Supabase format:', delivery);
            
            // Map booking object to Supabase schema
            const supabaseDelivery = {
                dr_number: delivery.drNumber,
                customer_name: delivery.customerName,
                vendor_number: delivery.vendorNumber,
                origin: delivery.origin,
                destination: delivery.destination,
                truck_type: delivery.truckType,
                truck_plate_number: delivery.truckPlateNumber,
                status: delivery.status,
                distance: delivery.distance,
                additional_costs: delivery.additionalCosts || 0,
                created_date: delivery.created_date || delivery.deliveryDate || delivery.bookedDate || new Date().toISOString().split('T')[0],
                created_by: delivery.createdBy || delivery.created_by || 'Manual',
                // NEW: Add the item-related fields
                item_number: delivery.itemNumber,
                mobile_number: delivery.mobileNumber,
                item_description: delivery.itemDescription,
                serial_number: delivery.serialNumber
            };
            
            console.log('📤 Supabase delivery object:', supabaseDelivery);

            const { data, error } = await supabaseClientInstance
                .from('deliveries')
                .upsert(supabaseDelivery)
                .select();
            
            if (error) throw error;
            return data[0];
        };

        const fallbackOperation = async () => {
            // Save to localStorage as fallback
            const activeDeliveries = JSON.parse(localStorage.getItem('mci-active-deliveries') || '[]');
            const existingIndex = activeDeliveries.findIndex(d => d.id === delivery.id);
            
            if (existingIndex >= 0) {
                activeDeliveries[existingIndex] = delivery;
            } else {
                activeDeliveries.push(delivery);
            }
            
            localStorage.setItem('mci-active-deliveries', JSON.stringify(activeDeliveries));
            return delivery;
        };

        return executeWithFallback(supabaseOperation, fallbackOperation);
    }

    // Get deliveries from Supabase
    async function getDeliveries(filters = {}) {
        const supabaseOperation = async () => {
            let query = supabaseClientInstance.from('deliveries').select('*');
            
            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        };

        const fallbackOperation = async () => {
            const activeDeliveries = JSON.parse(localStorage.getItem('mci-active-deliveries') || '[]');
            const deliveryHistory = JSON.parse(localStorage.getItem('mci-delivery-history') || '[]');
            
            // Return only active deliveries when no filters are applied
            if (!filters || Object.keys(filters).length === 0) {
                return activeDeliveries;
            }
            
            // Apply filters correctly based on status
            if (filters.status) {
                if (filters.status === 'Completed' || filters.status === 'Signed') {
                    // Return only history items
                    return deliveryHistory.filter(d => d.status === filters.status);
                } else {
                    // Return only active deliveries with matching status
                    return activeDeliveries.filter(d => d.status === filters.status);
                }
            }
            
            // Default to returning active deliveries
            return activeDeliveries;
        };

        return executeWithFallback(supabaseOperation, fallbackOperation);
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        initSupabase();
    });

    // Export functions to global scope
    window.initSupabase = initSupabase;
    window.testConnection = testConnection;
    window.signUp = signUp;
    window.signup = signUp; // Alias for compatibility
    window.signIn = signIn;
    window.login = signIn; // Alias for compatibility
    window.signOut = signOut;
    window.logout = signOut; // Alias for compatibility
    window.getCurrentUser = getCurrentUser;
    window.isAuthenticated = isAuthenticated;
    window.saveDelivery = saveDelivery;
    window.getDeliveries = getDeliveries;

    // Export client for direct access
    window.supabaseClient = () => supabaseClientInstance;
    window.isSupabaseOnline = () => isOnline;
    window.supabaseClientInstance = supabaseClientInstance;

    console.log('✅ Supabase integration module loaded');
}