// Check if DataService is already defined to prevent duplicate identifier errors
if (typeof window.DataService !== 'undefined') {
    console.log('⚠️ DataService already defined, skipping definition');
} else {
    /**
     * Data Service Layer
     * Provides a unified interface for all Supabase data operations.
     */

    console.log('🔧 Loading Enhanced Data Service...');

    class DataService {
        constructor() {
            // Try to get Supabase client with better error handling
            try {
                // First try the global Supabase client
                this.supabase = window.supabaseClient ? window.supabaseClient() : null;
                
                // If not available, try direct access
                if (!this.supabase && window.globalSupabaseClient) {
                    this.supabase = window.globalSupabaseClient;
                }
                
                // If still not available, try window.supabase
                if (!this.supabase && window.supabase) {
                    // Try to initialize if we have the config
                    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                        try {
                            this.supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
                            console.log('✅ Supabase client created from direct access');
                        } catch (initError) {
                            console.warn('⚠️ Could not initialize Supabase client:', initError);
                        }
                    }
                }
                
                if (!this.supabase) {
                    console.warn('⚠️ Supabase client not available. Check if Supabase is properly initialized.');
                    console.log('🔧 Available window objects:', Object.keys(window).filter(key => key.includes('supabase')));
                } else {
                    console.log('✅ Supabase client acquired successfully');
                }
            } catch (error) {
                console.error('❌ Error acquiring Supabase client:', error);
                this.supabase = null;
            }
        }

        /**
         * Executes a Supabase operation and handles errors.
         * @param {Promise} operation - The Supabase operation to execute.
         * @returns {Promise<any>} The result of the Supabase operation.
         */
        async execute(operation) {
            // Enhanced check for Supabase availability
            if (!this.supabase) {
                const errorMsg = 'Supabase client is not available. Please check your environment variables and ensure Supabase is properly initialized.';
                console.error('❌ ' + errorMsg);
                console.log('🔧 Debug info - window.supabaseClient:', typeof window.supabaseClient);
                console.log('🔧 Debug info - window.supabaseClientInitialized:', window.supabaseClientInitialized);
                console.log('🔧 Debug info - window.supabase:', typeof window.supabase);
                console.log('🔧 Debug info - window.globalSupabaseClient:', typeof window.globalSupabaseClient);
                
                // Return a more informative fallback
                throw new Error(errorMsg);
            }
            try {
                const { data, error } = await operation;
                if (error) throw error;
                return data;
            } catch (error) {
                console.error('❌ Supabase operation failed:', error);
                // Here you can add logic to display an offline banner to the user.
                showOfflineBanner();
                throw error; // Re-throw to let caller handle
            }
        }

        /**
         * DELIVERY OPERATIONS
         */

        async saveDelivery(delivery) {
            // Enhanced save delivery with better error handling
            if (!this.supabase) {
                console.warn('⚠️ Supabase client not available, delivery not saved to Supabase');
                // But don't throw an error, let the caller handle fallback
                throw new Error('Supabase client not available');
            }
            
            try {
                const operation = this.supabase.from('deliveries').upsert(delivery).select();
                return await this.execute(operation);
            } catch (error) {
                console.error('❌ Failed to save delivery to Supabase:', error);
                throw error;
            }
        }

        async getDeliveries(filters = {}) {
            if (!this.supabase) {
                console.warn('⚠️ Supabase client not available, returning empty array');
                throw new Error('Supabase client not available');
            }
            
            try {
                let query = this.supabase.from('deliveries').select('*');
                if (filters.status) {
                    query = query.eq('status', filters.status);
                }
                const operation = query.order('created_at', { ascending: false });
                return await this.execute(operation);
            } catch (error) {
                console.error('❌ Failed to get deliveries from Supabase:', error);
                throw error;
            }
        }

        async updateDeliveryStatusInSupabase(drNumber, newStatus) {
            if (!this.supabase) {
                console.warn('⚠️ Supabase client not available, status not updated');
                throw new Error('Supabase client not available');
            }
            
            try {
                const operation = this.supabase
                    .from('deliveries')
                    .update({ 
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    })
                    .eq('dr_number', drNumber)
                    .select();
                return await this.execute(operation);
            } catch (error) {
                console.error('❌ Failed to update delivery status in Supabase:', error);
                throw error;
            }
        }

        async deleteDelivery(deliveryId) {
            if (!this.supabase) {
                console.warn('⚠️ Supabase client not available, delivery not deleted');
                throw new Error('Supabase client not available');
            }
            
            try {
                const operation = this.supabase.from('deliveries').delete().eq('id', deliveryId);
                return await this.execute(operation);
            } catch (error) {
                console.error('❌ Failed to delete delivery from Supabase:', error);
                throw error;
            }
        }

        // ... existing code for other methods ...
    }

    // Enhanced offline banner function
    function showOfflineBanner() {
        // Remove any existing banner
        const existingBanner = document.getElementById('offline-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        // Create new banner
        const banner = document.createElement('div');
        banner.id = 'offline-banner';
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.width = '100%';
        banner.style.backgroundColor = '#ffc107';
        banner.style.color = '#000';
        banner.style.textAlign = 'center';
        banner.style.padding = '10px';
        banner.style.zIndex = '10000';
        banner.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        banner.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                <span><i class="bi bi-exclamation-triangle"></i> Offline mode — changes will sync when back online.</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5em; cursor: pointer;">&times;</button>
            </div>
        `;
        document.body.appendChild(banner);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (banner.parentElement) {
                banner.remove();
            }
        }, 5000);
    }

    // Create global instance
    const dataService = new DataService();

    // Export to global scope
    window.dataService = dataService;
    window.DataService = DataService;

    console.log('✅ Enhanced Data Service loaded successfully');
}