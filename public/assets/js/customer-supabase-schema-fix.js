/**
 * CUSTOMER SUPABASE SCHEMA FIX
 * Fixes the 400 error by ensuring proper field mapping between JavaScript and Supabase schema
 * Addresses the mismatch between 'contactPerson' (JS) and 'name' (Supabase)
 */

console.log('🔧 Loading Customer Supabase Schema Fix...');

(function() {
    'use strict';
    
    /**
     * Map JavaScript customer fields to Supabase schema fields
     */
    function mapToSupabaseSchema(customer) {
        if (!customer) return customer;
        
        // Create a clean object with only Supabase schema fields
        const supabaseCustomer = {
            // Core fields that match Supabase schema exactly
            name: customer.contactPerson || customer.name || '',  // JS uses contactPerson, Supabase uses name
            email: customer.email || null,  // Allow null for optional fields
            phone: customer.phone || null,
            address: customer.address || null,
            vendor_number: customer.vendorNumber || customer.vendor_number || customer.phone || null,
            
            // Timestamps - Supabase handles these automatically but we can set them
            created_at: customer.created_at || customer.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            
            // User ID for RLS (Row Level Security)
            user_id: customer.user_id || null
        };
        
        // Only include ID if it's a valid UUID format (for updates)
        if (customer.id && customer.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            supabaseCustomer.id = customer.id;
        }
        
        // Remove any null/undefined values to avoid 400 errors
        Object.keys(supabaseCustomer).forEach(key => {
            if (supabaseCustomer[key] === null || supabaseCustomer[key] === undefined || supabaseCustomer[key] === '') {
                delete supabaseCustomer[key];
            }
        });
        
        console.log('📝 Mapped to Supabase schema:', supabaseCustomer);
        return supabaseCustomer;
    }
    
    /**
     * Map Supabase customer data back to JavaScript format
     */
    function mapFromSupabaseSchema(supabaseCustomer) {
        if (!supabaseCustomer) return supabaseCustomer;
        
        return {
            id: supabaseCustomer.id,
            contactPerson: supabaseCustomer.name || '',  // Map Supabase 'name' to JS 'contactPerson'
            name: supabaseCustomer.name || '',  // Keep both for compatibility
            phone: supabaseCustomer.phone || '',
            email: supabaseCustomer.email || '',
            address: supabaseCustomer.address || '',
            vendorNumber: supabaseCustomer.vendor_number || supabaseCustomer.phone || '',
            vendor_number: supabaseCustomer.vendor_number || supabaseCustomer.phone || '',
            accountType: 'Individual',  // Default since not in Supabase schema
            account_type: 'Individual',
            status: 'active',  // Default since not in Supabase schema
            notes: 'Loaded from Supabase',  // Default since not in Supabase schema
            bookingsCount: 0,  // Default since not in Supabase schema
            bookings_count: 0,
            lastDelivery: '',  // Default since not in Supabase schema
            last_delivery: '',
            createdAt: supabaseCustomer.created_at,
            created_at: supabaseCustomer.created_at,
            updatedAt: supabaseCustomer.updated_at,
            updated_at: supabaseCustomer.updated_at,
            user_id: supabaseCustomer.user_id
        };
    }
    
    /**
     * Enhanced duplicate customer merging with schema mapping
     */
    function mergeDuplicateCustomersWithSchemaMapping(customers) {
        console.log('🔄 Merging duplicate customers with schema mapping...');
        console.log('📊 Customers before merge:', customers.length);
        
        if (!customers || customers.length === 0) {
            return customers;
        }
        
        // Create a map to group customers by name and phone
        const customerGroups = new Map();
        
        // Group customers by normalized name and phone number
        customers.forEach(customer => {
            const normalizedCustomer = mapFromSupabaseSchema(customer);
            const key = `${normalizedCustomer.contactPerson.toLowerCase()}|${normalizedCustomer.phone}`;
            
            if (!customerGroups.has(key)) {
                customerGroups.set(key, []);
            }
            customerGroups.get(key).push(normalizedCustomer);
        });
        
        // Process groups to merge duplicates
        const mergedCustomers = [];
        let mergeCount = 0;
        
        customerGroups.forEach((group, key) => {
            if (group.length === 1) {
                // No duplicates, just add the customer
                mergedCustomers.push(group[0]);
            } else {
                // Merge duplicates
                console.log(`🔄 Merging ${group.length} duplicate customers for: ${key}`);
                mergeCount += group.length - 1;
                
                // Sort by createdAt to get the most recent one as the primary
                group.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
                
                // Use the most recent customer as the base
                const primaryCustomer = { ...group[0] };
                
                // Merge data from all duplicates
                let totalBookings = 0;
                let latestDeliveryDate = null;
                let mergedNotes = [];
                
                group.forEach(customer => {
                    totalBookings += customer.bookingsCount || customer.bookings_count || 0;
                    
                    // Get the latest delivery date
                    if (customer.lastDelivery || customer.last_delivery) {
                        const customerDate = new Date(customer.lastDelivery || customer.last_delivery);
                        if (!latestDeliveryDate || customerDate > latestDeliveryDate) {
                            latestDeliveryDate = customerDate;
                        }
                    }
                    
                    // Merge notes
                    if (customer.notes && !mergedNotes.includes(customer.notes)) {
                        mergedNotes.push(customer.notes);
                    }
                    
                    // Keep the most complete address if available
                    if (customer.address && customer.address.length > (primaryCustomer.address?.length || 0)) {
                        primaryCustomer.address = customer.address;
                    }
                    
                    // Keep the most complete email if available
                    if (customer.email && customer.email.length > (primaryCustomer.email?.length || 0)) {
                        primaryCustomer.email = customer.email;
                    }
                });
                
                // Update the primary customer with merged data
                primaryCustomer.bookingsCount = totalBookings;
                primaryCustomer.bookings_count = totalBookings;
                
                if (latestDeliveryDate) {
                    primaryCustomer.lastDelivery = latestDeliveryDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    primaryCustomer.last_delivery = primaryCustomer.lastDelivery;
                }
                
                // Merge notes
                if (mergedNotes.length > 0) {
                    primaryCustomer.notes = mergedNotes.join('; ');
                }
                
                // Update timestamps
                primaryCustomer.updatedAt = new Date().toISOString();
                primaryCustomer.updated_at = primaryCustomer.updatedAt;
                
                mergedCustomers.push(primaryCustomer);
            }
        });
        
        console.log(`✅ Merged ${mergeCount} duplicate customers`);
        console.log('📊 Customers after merge:', mergedCustomers.length);
        
        return mergedCustomers;
    }

    /**
     * Enhanced dataService customer operations with proper schema mapping
     */
    const originalDataService = window.dataService;
    
    if (originalDataService) {
        // Override saveCustomer method
        const originalSaveCustomer = originalDataService.saveCustomer.bind(originalDataService);
        originalDataService.saveCustomer = async function(customer) {
            console.log('🔄 Enhanced saveCustomer with schema mapping...');
            console.log('📝 Original customer data:', customer);
            
            const supabaseOp = async () => {
                // Check if supabaseClient function exists
                if (typeof window.supabaseClient !== 'function') {
                    throw new Error('Supabase client function not available. Please check Supabase initialization.');
                }
                
                const client = window.supabaseClient();
                if (!client) {
                    throw new Error('Supabase client not available');
                }
                
                // Map to Supabase schema
                const mappedCustomer = mapToSupabaseSchema(customer);
                console.log('📤 Sending to Supabase:', mappedCustomer);
                
                const { data, error } = await client
                    .from('customers')
                    .upsert(mappedCustomer)
                    .select();
                
                if (error) {
                    console.error('❌ Supabase customer save error:', error);
                    throw error;
                }
                
                console.log('✅ Supabase response:', data);
                
                // Map back to JavaScript format
                return mapFromSupabaseSchema(data[0]);
            };

            return this.execute(supabaseOp);
        };
        
        // Override getCustomers method
        const originalGetCustomers = originalDataService.getCustomers.bind(originalDataService);
        originalDataService.getCustomers = async function() {
            console.log('🔄 Enhanced getCustomers with schema mapping and duplicate merging...');
            
            const supabaseOp = async () => {
                // Check if supabaseClient function exists
                if (typeof window.supabaseClient !== 'function') {
                    throw new Error('Supabase client function not available. Please check Supabase initialization.');
                }
                
                const client = window.supabaseClient();
                if (!client) {
                    throw new Error('Supabase client not available');
                }
                
                console.log('📤 Fetching customers from Supabase...');
                const { data, error } = await client
                    .from('customers')
                    .select('*')
                    .order('name', { ascending: true });
                
                if (error) {
                    console.error('❌ Supabase customer fetch error:', error);
                    throw error;
                }
                
                console.log('✅ Supabase customers response:', data);
                
                // Map all customers back to JavaScript format
                let customers = (data || []).map(customer => mapFromSupabaseSchema(customer));
                
                // Merge duplicates before returning
                customers = mergeDuplicateCustomersWithSchemaMapping(customers);
                
                return customers;
            };

            return this.execute(supabaseOp);
        };
        
        console.log('✅ Enhanced dataService customer methods with schema mapping');
    }
    
    /**
     * Test customer operations to verify fix
     */
    async function testCustomerOperations() {
        console.log('🧪 Testing customer operations...');
        
        try {
            // Test fetching customers
            console.log('📥 Testing customer fetch...');
            const customers = await window.dataService.getCustomers();
            console.log('✅ Customer fetch test passed:', customers.length, 'customers');
            
            // Test saving a customer
            console.log('💾 Testing customer save...');
            const testCustomer = {
                id: 'TEST-' + Date.now(),
                contactPerson: 'Test Customer',
                phone: '+63 999 999 9999',
                email: 'test@example.com',
                address: 'Test Address',
                vendorNumber: '+63 999 999 9999',
                accountType: 'Individual',
                status: 'active',
                notes: 'Test customer for schema fix',
                bookingsCount: 0,
                lastDelivery: '',
                createdAt: new Date().toISOString()
            };
            
            const savedCustomer = await window.dataService.saveCustomer(testCustomer);
            console.log('✅ Customer save test passed:', savedCustomer);
            
            return true;
            
        } catch (error) {
            console.error('❌ Customer operations test failed:', error);
            return false;
        }
    }
    
    /**
     * Initialize the fix
     */
    function initializeSchemaFix() {
        console.log('🚀 Initializing Customer Supabase Schema Fix...');
        
        // Wait for dataService to be available
        if (window.dataService) {
            console.log('✅ DataService found, applying schema fix');
            
            // Test the fix after a short delay
            setTimeout(() => {
                testCustomerOperations().then(success => {
                    if (success) {
                        console.log('🎉 Customer Supabase Schema Fix applied successfully!');
                        
                        // Reload customers to test the fix
                        if (typeof window.loadCustomers === 'function') {
                            window.loadCustomers();
                        }
                    } else {
                        console.warn('⚠️ Customer operations test failed, but fix is still applied');
                    }
                });
            }, 1000);
        } else {
            console.log('⏳ DataService not yet available, retrying...');
            setTimeout(initializeSchemaFix, 500);
        }
    }
    
    // Export utility functions
    window.mapToSupabaseSchema = mapToSupabaseSchema;
    window.mapFromSupabaseSchema = mapFromSupabaseSchema;
    window.mergeDuplicateCustomersWithSchemaMapping = mergeDuplicateCustomersWithSchemaMapping;
    window.testCustomerOperations = testCustomerOperations;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSchemaFix);
    } else {
        initializeSchemaFix();
    }
    
    console.log('✅ Customer Supabase Schema Fix loaded successfully');
    
})();

// Export for external access
window.customerSupabaseSchemaFix = {
    version: '1.0.0',
    loaded: true,
    timestamp: new Date().toISOString()
};