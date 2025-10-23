/**
 * CENTRALIZED DATA SERVICE
 * Complete Supabase-centric data management for multi-user synchronization
 * Eliminates localStorage dependencies and provides real-time sync
 */

console.log('🌐 Loading Centralized Data Service...');

class CentralizedDataService {
    constructor() {
        this.isInitialized = false;
        this.supabaseClient = null;
        this.currentUser = null;
        this.realtimeSubscriptions = new Map();
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleOnlineStatus = this.handleOnlineStatus.bind(this);
        
        // Listen for online/offline events
        window.addEventListener('online', this.handleOnlineStatus);
        window.addEventListener('offline', this.handleOnlineStatus);
    }

    /**
     * Initialize the centralized data service
     */
    async init() {
        console.log('🚀 Initializing Centralized Data Service...');
        
        try {
            // Wait for Supabase client to be available
            await this.waitForSupabaseClient();
            
            // Get current user
            await this.getCurrentUser();
            
            // Initialize global data arrays
            this.initializeGlobalArrays();
            
            // Clear any localStorage data
            this.clearLocalStorage();
            
            // Load initial data from Supabase
            await this.loadInitialData();
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            this.isInitialized = true;
            console.log('✅ Centralized Data Service initialized successfully');
            
            // Emit initialization event
            window.dispatchEvent(new CustomEvent('centralizedDataServiceReady'));
            
        } catch (error) {
            console.error('❌ Failed to initialize Centralized Data Service:', error);
            throw error;
        }
    }

    /**
     * Wait for Supabase client to be available
     */
    async waitForSupabaseClient() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (window.supabaseClient && typeof window.supabaseClient === 'function') {
                this.supabaseClient = window.supabaseClient();
                if (this.supabaseClient) {
                    console.log('✅ Supabase client found');
                    return;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Supabase client not available after waiting');
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabaseClient.auth.getUser();
            
            if (error) {
                console.error('❌ Error getting user:', error);
                return null;
            }
            
            this.currentUser = user;
            console.log('👤 Current user:', user?.email || 'Not authenticated');
            return user;
            
        } catch (error) {
            console.error('❌ Error in getCurrentUser:', error);
            return null;
        }
    }

    /**
     * Initialize global data arrays (Supabase-centric)
     */
    initializeGlobalArrays() {
        // Initialize with empty arrays - data will come from Supabase
        window.activeDeliveries = [];
        window.deliveryHistory = [];
        window.customers = [];
        window.bookings = [];
        window.ePodRecords = [];
        
        console.log('✅ Global arrays initialized (Supabase-centric)');
    }

    /**
     * Clear localStorage to prevent conflicts
     */
    clearLocalStorage() {
        const keysToRemove = [
            'mci-active-deliveries',
            'mci-delivery-history',
            'deliveries',
            'deliveryHistory',
            'activeDeliveries',
            'customers',
            'bookings',
            'ePodRecords',
            'completedDeliveries'
        ];
        
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ Cleared localStorage: ${key}`);
            }
        });
    }

    /**
     * Load initial data from Supabase
     */
    async loadInitialData() {
        if (!this.currentUser) {
            console.log('⚠️ No authenticated user, skipping data load');
            return;
        }

        console.log('📡 Loading initial data from Supabase...');

        try {
            // Load deliveries (active and completed)
            await this.loadDeliveries();
            
            // Load customers
            await this.loadCustomers();
            
            // Load bookings
            await this.loadBookings();
            
            // Load e-POD records
            await this.loadEPodRecords();
            
            console.log('✅ Initial data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading initial data:', error);
        }
    }

    /**
     * Load deliveries from Supabase
     */
    async loadDeliveries() {
        try {
            const { data: deliveries, error } = await this.supabaseClient
                .from('deliveries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error loading deliveries:', error);
                return;
            }

            // Convert to frontend format using field mapping
            const mappedDeliveries = deliveries.map(delivery => 
                window.fieldMappingService ? 
                window.fieldMappingService.mapDeliveryFromSupabase(delivery) : 
                delivery
            );

            // Normalize arrays for consistent format
            const normalizedDeliveries = window.fieldMappingService ? 
                window.fieldMappingService.normalizeDeliveryArray(mappedDeliveries) : 
                mappedDeliveries;

            // Separate active and completed deliveries
            window.activeDeliveries = normalizedDeliveries.filter(d => d.status !== 'Completed' && d.status !== 'Signed') || [];
            window.deliveryHistory = normalizedDeliveries.filter(d => d.status === 'Completed' || d.status === 'Signed') || [];

            console.log(`📦 Loaded ${window.activeDeliveries.length} active deliveries`);
            console.log(`📋 Loaded ${window.deliveryHistory.length} completed deliveries`);

        } catch (error) {
            console.error('❌ Error in loadDeliveries:', error);
        }
    }

    /**
     * Load customers from Supabase
     */
    async loadCustomers() {
        try {
            const { data: customers, error } = await this.supabaseClient
                .from('customers')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('❌ Error loading customers:', error);
                return;
            }

            window.customers = customers || [];
            console.log(`👥 Loaded ${window.customers.length} customers`);

        } catch (error) {
            console.error('❌ Error in loadCustomers:', error);
        }
    }

    /**
     * Load bookings from Supabase
     */
    async loadBookings() {
        try {
            // Try with start_date first, fallback to created_at if column doesn't exist
            let query = this.supabaseClient.from('bookings').select('*');
            
            // Check if bookings table exists and has start_date column
            const { data: bookings, error } = await query.order('created_at', { ascending: false });

            if (error) {
                if (error.code === '42P01') {
                    // Table doesn't exist
                    console.warn('⚠️ Bookings table does not exist, skipping bookings load');
                    window.bookings = [];
                    return;
                } else if (error.code === '42703') {
                    // Column doesn't exist, this is expected for now
                    console.warn('⚠️ Bookings table schema mismatch, using empty array');
                    window.bookings = [];
                    return;
                } else {
                    console.error('❌ Error loading bookings:', error);
                    window.bookings = [];
                    return;
                }
            }

            window.bookings = bookings || [];
            console.log(`📅 Loaded ${window.bookings.length} bookings`);

        } catch (error) {
            console.error('❌ Error in loadBookings:', error);
            window.bookings = [];
        }
    }

    /**
     * Load e-POD records from Supabase
     */
    async loadEPodRecords() {
        try {
            const { data: records, error } = await this.supabaseClient
                .from('epod_records')
                .select('*')
                .order('signed_at', { ascending: false });

            if (error) {
                console.error('❌ Error loading e-POD records:', error);
                return;
            }

            window.ePodRecords = records || [];
            console.log(`📝 Loaded ${window.ePodRecords.length} e-POD records`);

        } catch (error) {
            console.error('❌ Error in loadEPodRecords:', error);
        }
    }

    /**
     * Setup real-time subscriptions for live data sync
     */
    setupRealtimeSubscriptions() {
        if (!this.currentUser) {
            console.log('⚠️ No authenticated user, skipping real-time setup');
            return;
        }

        console.log('🔄 Setting up real-time subscriptions...');

        // Subscribe to deliveries changes
        const deliveriesSubscription = this.supabaseClient
            .channel('deliveries-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'deliveries' },
                (payload) => this.handleDeliveriesChange(payload)
            )
            .subscribe();

        // Subscribe to customers changes
        const customersSubscription = this.supabaseClient
            .channel('customers-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                (payload) => this.handleCustomersChange(payload)
            )
            .subscribe();

        // Subscribe to bookings changes
        const bookingsSubscription = this.supabaseClient
            .channel('bookings-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => this.handleBookingsChange(payload)
            )
            .subscribe();

        // Store subscriptions for cleanup
        this.realtimeSubscriptions.set('deliveries', deliveriesSubscription);
        this.realtimeSubscriptions.set('customers', customersSubscription);
        this.realtimeSubscriptions.set('bookings', bookingsSubscription);

        console.log('✅ Real-time subscriptions established');
    }

    /**
     * Handle deliveries real-time changes
     */
    handleDeliveriesChange(payload) {
        console.log('🔄 Deliveries change detected:', payload);
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
            case 'INSERT':
                this.handleDeliveryInsert(newRecord);
                break;
            case 'UPDATE':
                this.handleDeliveryUpdate(newRecord, oldRecord);
                break;
            case 'DELETE':
                this.handleDeliveryDelete(oldRecord);
                break;
        }
        
        // Refresh UI
        this.refreshDeliveriesUI();
    }

    /**
     * Handle delivery insert
     */
    handleDeliveryInsert(delivery) {
        // Add to appropriate array based on status
        if (delivery.status === 'Completed' || delivery.status === 'Signed') {
            // Remove from active if exists
            window.activeDeliveries = window.activeDeliveries.filter(d => d.id !== delivery.id);
            // Add to history if not exists
            if (!window.deliveryHistory.find(d => d.id === delivery.id)) {
                window.deliveryHistory.unshift(delivery);
            }
        } else {
            // Remove from history if exists
            window.deliveryHistory = window.deliveryHistory.filter(d => d.id !== delivery.id);
            // Add to active if not exists
            if (!window.activeDeliveries.find(d => d.id === delivery.id)) {
                window.activeDeliveries.unshift(delivery);
            }
        }
    }

    /**
     * Handle delivery update
     */
    handleDeliveryUpdate(newDelivery, oldDelivery) {
        // Update in active deliveries
        const activeIndex = window.activeDeliveries.findIndex(d => d.id === newDelivery.id);
        if (activeIndex !== -1) {
            if (newDelivery.status === 'Completed' || newDelivery.status === 'Signed') {
                // Move to history
                window.activeDeliveries.splice(activeIndex, 1);
                window.deliveryHistory.unshift(newDelivery);
            } else {
                // Update in place
                window.activeDeliveries[activeIndex] = newDelivery;
            }
        }
        
        // Update in delivery history
        const historyIndex = window.deliveryHistory.findIndex(d => d.id === newDelivery.id);
        if (historyIndex !== -1) {
            if (newDelivery.status !== 'Completed' && newDelivery.status !== 'Signed') {
                // Move to active
                window.deliveryHistory.splice(historyIndex, 1);
                window.activeDeliveries.unshift(newDelivery);
            } else {
                // Update in place
                window.deliveryHistory[historyIndex] = newDelivery;
            }
        }
    }

    /**
     * Handle delivery delete
     */
    handleDeliveryDelete(delivery) {
        window.activeDeliveries = window.activeDeliveries.filter(d => d.id !== delivery.id);
        window.deliveryHistory = window.deliveryHistory.filter(d => d.id !== delivery.id);
    }

    /**
     * Handle customers real-time changes
     */
    handleCustomersChange(payload) {
        console.log('🔄 Customers change detected:', payload);
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
            case 'INSERT':
                if (!window.customers.find(c => c.id === newRecord.id)) {
                    window.customers.push(newRecord);
                }
                break;
            case 'UPDATE':
                const updateIndex = window.customers.findIndex(c => c.id === newRecord.id);
                if (updateIndex !== -1) {
                    window.customers[updateIndex] = newRecord;
                }
                break;
            case 'DELETE':
                window.customers = window.customers.filter(c => c.id !== oldRecord.id);
                break;
        }
        
        // Refresh customers UI
        this.refreshCustomersUI();
    }

    /**
     * Handle bookings real-time changes
     */
    handleBookingsChange(payload) {
        console.log('🔄 Bookings change detected:', payload);
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
            case 'INSERT':
                if (!window.bookings.find(b => b.id === newRecord.id)) {
                    window.bookings.push(newRecord);
                }
                break;
            case 'UPDATE':
                const updateIndex = window.bookings.findIndex(b => b.id === newRecord.id);
                if (updateIndex !== -1) {
                    window.bookings[updateIndex] = newRecord;
                }
                break;
            case 'DELETE':
                window.bookings = window.bookings.filter(b => b.id !== oldRecord.id);
                break;
        }
        
        // Refresh bookings UI
        this.refreshBookingsUI();
    }

    /**
     * Refresh deliveries UI
     */
    refreshDeliveriesUI() {
        // Trigger UI refresh events
        window.dispatchEvent(new CustomEvent('deliveriesUpdated'));
        
        // Call existing refresh functions if available
        if (typeof window.refreshActiveDeliveries === 'function') {
            window.refreshActiveDeliveries();
        }
        if (typeof window.refreshDeliveryHistory === 'function') {
            window.refreshDeliveryHistory();
        }
    }

    /**
     * Refresh customers UI
     */
    refreshCustomersUI() {
        window.dispatchEvent(new CustomEvent('customersUpdated'));
        
        if (typeof window.refreshCustomers === 'function') {
            window.refreshCustomers();
        }
    }

    /**
     * Refresh bookings UI
     */
    refreshBookingsUI() {
        window.dispatchEvent(new CustomEvent('bookingsUpdated'));
        
        if (typeof window.refreshBookings === 'function') {
            window.refreshBookings();
        }
    }

    /**
     * Handle online/offline status
     */
    handleOnlineStatus() {
        this.isOnline = navigator.onLine;
        console.log(`🌐 Connection status: ${this.isOnline ? 'Online' : 'Offline'}`);
        
        if (this.isOnline && this.syncQueue.length > 0) {
            this.processSyncQueue();
        }
    }

    /**
     * Process sync queue when back online
     */
    async processSyncQueue() {
        console.log(`🔄 Processing ${this.syncQueue.length} queued operations...`);
        
        while (this.syncQueue.length > 0) {
            const operation = this.syncQueue.shift();
            try {
                await this.executeOperation(operation);
                console.log('✅ Queued operation processed:', operation);
            } catch (error) {
                console.error('❌ Failed to process queued operation:', error);
                // Re-queue if failed
                this.syncQueue.unshift(operation);
                break;
            }
        }
    }

    /**
     * Execute a database operation
     */
    async executeOperation(operation) {
        const { type, table, data, id } = operation;
        
        switch (type) {
            case 'INSERT':
                return await this.supabaseClient.from(table).insert(data);
            case 'UPDATE':
                return await this.supabaseClient.from(table).update(data).eq('id', id);
            case 'DELETE':
                return await this.supabaseClient.from(table).delete().eq('id', id);
            default:
                throw new Error(`Unknown operation type: ${type}`);
        }
    }

    /**
     * Add delivery to Supabase
     */
    async addDelivery(deliveryData) {
        try {
            // Use field mapping service to convert to Supabase format
            const mappedData = window.fieldMappingService ? 
                window.fieldMappingService.mapDeliveryToSupabase(deliveryData) : 
                deliveryData;

            // Add user_id
            mappedData.user_id = this.currentUser?.id;

            // Handle DR number conflicts by checking for existing deliveries
            if (mappedData.dr_number) {
                const { data: existingDeliveries } = await this.supabaseClient
                    .from('deliveries')
                    .select('dr_number')
                    .eq('dr_number', mappedData.dr_number)
                    .eq('user_id', this.currentUser?.id);

                if (existingDeliveries && existingDeliveries.length > 0) {
                    // Generate unique DR number
                    const timestamp = Date.now();
                    const originalDR = mappedData.dr_number;
                    mappedData.dr_number = `${originalDR}-${timestamp}`;
                    console.warn(`⚠️ DR conflict detected, using unique DR: ${mappedData.dr_number}`);
                }
            }

            const { data, error } = await this.supabaseClient
                .from('deliveries')
                .insert([mappedData])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    // Unique constraint violation - try with timestamp
                    const timestamp = Date.now();
                    mappedData.dr_number = `${mappedData.dr_number}-${timestamp}`;
                    console.warn(`⚠️ Retrying with unique DR: ${mappedData.dr_number}`);
                    
                    const { data: retryData, error: retryError } = await this.supabaseClient
                        .from('deliveries')
                        .insert([mappedData])
                        .select()
                        .single();
                    
                    if (retryError) throw retryError;
                    
                    const frontendData = window.fieldMappingService ? 
                        window.fieldMappingService.mapDeliveryFromSupabase(retryData) : 
                        retryData;
                    
                    console.log('✅ Delivery added to Supabase (with unique DR):', frontendData);
                    return frontendData;
                }
                throw error;
            }

            // Convert back to frontend format
            const frontendData = window.fieldMappingService ? 
                window.fieldMappingService.mapDeliveryFromSupabase(data) : 
                data;

            console.log('✅ Delivery added to Supabase:', frontendData);
            return frontendData;

        } catch (error) {
            console.error('❌ Error adding delivery:', error);
            
            // Queue for later if offline
            if (!this.isOnline) {
                this.syncQueue.push({
                    type: 'INSERT',
                    table: 'deliveries',
                    data: deliveryData
                });
            }
            
            throw error;
        }
    }

    /**
     * Update delivery in Supabase
     */
    async updateDelivery(deliveryId, updates) {
        try {
            const { data, error } = await this.supabaseClient
                .from('deliveries')
                .update(updates)
                .eq('id', deliveryId)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Delivery updated in Supabase:', data);
            return data;

        } catch (error) {
            console.error('❌ Error updating delivery:', error);
            
            // Queue for later if offline
            if (!this.isOnline) {
                this.syncQueue.push({
                    type: 'UPDATE',
                    table: 'deliveries',
                    data: updates,
                    id: deliveryId
                });
            }
            
            throw error;
        }
    }

    /**
     * Delete delivery from Supabase
     */
    async deleteDelivery(deliveryId) {
        try {
            const { error } = await this.supabaseClient
                .from('deliveries')
                .delete()
                .eq('id', deliveryId);

            if (error) throw error;

            console.log('✅ Delivery deleted from Supabase');

        } catch (error) {
            console.error('❌ Error deleting delivery:', error);
            
            // Queue for later if offline
            if (!this.isOnline) {
                this.syncQueue.push({
                    type: 'DELETE',
                    table: 'deliveries',
                    id: deliveryId
                });
            }
            
            throw error;
        }
    }

    /**
     * Add customer to Supabase
     */
    async addCustomer(customerData) {
        try {
            const { data, error } = await this.supabaseClient
                .from('customers')
                .insert([{
                    ...customerData,
                    user_id: this.currentUser?.id
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Customer added to Supabase:', data);
            return data;

        } catch (error) {
            console.error('❌ Error adding customer:', error);
            throw error;
        }
    }

    /**
     * Update customer in Supabase
     */
    async updateCustomer(customerId, updates) {
        try {
            const { data, error } = await this.supabaseClient
                .from('customers')
                .update(updates)
                .eq('id', customerId)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Customer updated in Supabase:', data);
            return data;

        } catch (error) {
            console.error('❌ Error updating customer:', error);
            throw error;
        }
    }

    /**
     * Cleanup subscriptions
     */
    cleanup() {
        console.log('🧹 Cleaning up Centralized Data Service...');
        
        // Unsubscribe from real-time channels
        this.realtimeSubscriptions.forEach((subscription, name) => {
            subscription.unsubscribe();
            console.log(`🔌 Unsubscribed from ${name}`);
        });
        
        this.realtimeSubscriptions.clear();
        
        // Remove event listeners
        window.removeEventListener('online', this.handleOnlineStatus);
        window.removeEventListener('offline', this.handleOnlineStatus);
    }
}

// Create global instance
window.centralizedDataService = new CentralizedDataService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.centralizedDataService.init().catch(console.error);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        window.centralizedDataService.init().catch(console.error);
    }, 100);
}

// Export for external use
window.CentralizedDataService = CentralizedDataService;

console.log('✅ Centralized Data Service loaded');