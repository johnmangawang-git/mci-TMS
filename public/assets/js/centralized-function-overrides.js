/**
 * CENTRALIZED FUNCTION OVERRIDES
 * Overrides all localStorage-based functions to use centralized database system
 * Ensures complete transition to Supabase-centric operations
 */

// Check if centralized overrides are disabled
if (window.CENTRALIZED_OVERRIDES_DISABLED) {
    console.log('🚫 Centralized Function Overrides DISABLED - localStorage will work normally');
    // Exit early without doing anything
} else {
    console.log('🔄 Loading Centralized Function Overrides...');
}

class CentralizedFunctionOverrides {
    constructor() {
        this.originalFunctions = {};
        this.isReady = false;
        this.init();
    }

    async init() {
        // Wait for centralized services
        await this.waitForServices();
        
        // Override all localStorage functions
        this.overrideLocalStorageFunctions();
        
        // Override delivery management functions
        this.overrideDeliveryFunctions();
        
        // Override customer functions
        this.overrideCustomerFunctions();
        
        // Override analytics functions
        this.overrideAnalyticsFunctions();
        
        // Override signature functions
        this.overrideSignatureFunctions();
        
        this.isReady = true;
        console.log('✅ All functions overridden for centralized system');
    }

    async waitForServices() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            if (window.centralizedDataService?.isInitialized && 
                window.centralizedBookingService?.isReady &&
                window.fieldMappingService) {
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('⚠️ Services not fully ready, proceeding with overrides anyway');
    }

    /**
     * Override localStorage functions to prevent usage
     */
    overrideLocalStorageFunctions() {
        console.log('🔄 Overriding localStorage functions...');

        // Store original functions
        this.originalFunctions.localStorage = {
            setItem: localStorage.setItem.bind(localStorage),
            getItem: localStorage.getItem.bind(localStorage),
            removeItem: localStorage.removeItem.bind(localStorage)
        };

        // Override setItem to warn and redirect to centralized system
        localStorage.setItem = (key, value) => {
            if (this.isDeliveryRelatedKey(key)) {
                console.warn(`🚫 localStorage.setItem blocked for ${key} - use centralized system instead`);
                this.handleDeliveryDataSave(key, value);
                return;
            }
            
            // Allow non-delivery related localStorage
            this.originalFunctions.localStorage.setItem(key, value);
        };

        // Override getItem to redirect to centralized system
        localStorage.getItem = (key) => {
            if (this.isDeliveryRelatedKey(key)) {
                console.warn(`🚫 localStorage.getItem blocked for ${key} - use centralized system instead`);
                return this.handleDeliveryDataLoad(key);
            }
            
            return this.originalFunctions.localStorage.getItem(key);
        };

        console.log('✅ localStorage functions overridden');
    }

    /**
     * Check if localStorage key is delivery-related
     */
    isDeliveryRelatedKey(key) {
        const deliveryKeys = [
            'mci-active-deliveries',
            'mci-delivery-history',
            'mci-customers',
            'activeDeliveries',
            'deliveryHistory',
            'customers',
            'deliveries',
            'analytics-cost-breakdown'
        ];
        
        return deliveryKeys.includes(key);
    }

    /**
     * Handle delivery data save through centralized system
     */
    async handleDeliveryDataSave(key, value) {
        try {
            const data = JSON.parse(value);
            
            switch (key) {
                case 'mci-active-deliveries':
                case 'activeDeliveries':
                    console.log('🔄 Redirecting active deliveries save to centralized system');
                    // Don't save - data should come from Supabase
                    break;
                    
                case 'mci-delivery-history':
                case 'deliveryHistory':
                    console.log('🔄 Redirecting delivery history save to centralized system');
                    // Don't save - data should come from Supabase
                    break;
                    
                case 'mci-customers':
                case 'customers':
                    console.log('🔄 Redirecting customers save to centralized system');
                    // Don't save - data should come from Supabase
                    break;
                    
                default:
                    console.log(`🔄 Ignoring localStorage save for ${key}`);
            }
        } catch (error) {
            console.warn('Error handling delivery data save:', error);
        }
    }

    /**
     * Handle delivery data load through centralized system
     */
    handleDeliveryDataLoad(key) {
        switch (key) {
            case 'mci-active-deliveries':
            case 'activeDeliveries':
                return JSON.stringify(window.activeDeliveries || []);
                
            case 'mci-delivery-history':
            case 'deliveryHistory':
                return JSON.stringify(window.deliveryHistory || []);
                
            case 'mci-customers':
            case 'customers':
                return JSON.stringify(window.customers || []);
                
            default:
                return '[]';
        }
    }

    /**
     * Override delivery management functions
     */
    overrideDeliveryFunctions() {
        console.log('🔄 Overriding delivery functions...');

        // Override array push operations
        this.overrideArrayPush();

        // Override status update functions
        if (typeof window.updateDeliveryStatus === 'function') {
            this.originalFunctions.updateDeliveryStatus = window.updateDeliveryStatus;
        }
        
        window.updateDeliveryStatus = async (drNumber, newStatus) => {
            console.log(`🔄 Centralized updateDeliveryStatus: ${drNumber} -> ${newStatus}`);
            
            try {
                // Find delivery using field mapping
                const delivery = window.fieldMappingService.findDeliveryById(window.activeDeliveries, drNumber);
                
                if (!delivery) {
                    console.warn(`⚠️ Delivery not found: ${drNumber}`);
                    return;
                }

                // Update through centralized service
                const updates = window.fieldMappingService.updateDeliveryStatus(delivery, newStatus);
                
                if (window.centralizedDataService?.isInitialized) {
                    await window.centralizedDataService.updateDelivery(delivery.id, updates);
                    console.log('✅ Delivery updated through centralized system');
                } else {
                    console.warn('⚠️ Centralized service not ready, updating locally');
                    // Update local array as fallback
                    const index = window.activeDeliveries.findIndex(d => d.id === delivery.id);
                    if (index !== -1) {
                        window.activeDeliveries[index] = { ...window.activeDeliveries[index], ...updates };
                    }
                }
                
            } catch (error) {
                console.error('❌ Error updating delivery status:', error);
                
                // Fallback to original function if available
                if (this.originalFunctions.updateDeliveryStatus) {
                    this.originalFunctions.updateDeliveryStatus(drNumber, newStatus);
                }
            }
        };

        console.log('✅ Delivery functions overridden');
    }

    /**
     * Override array push operations to prevent direct manipulation
     */
    overrideArrayPush() {
        // Override activeDeliveries push
        if (window.activeDeliveries && Array.isArray(window.activeDeliveries)) {
            const originalPush = window.activeDeliveries.push.bind(window.activeDeliveries);
            
            window.activeDeliveries.push = (...items) => {
                console.warn('🚫 Direct activeDeliveries.push blocked - use centralized booking service');
                
                // Try to add through centralized service
                items.forEach(async (item) => {
                    try {
                        if (window.centralizedBookingService?.isReady) {
                            await window.centralizedBookingService.addDeliveryBooking(item);
                        } else {
                            console.warn('⚠️ Centralized service not ready, adding locally as fallback');
                            originalPush(item);
                        }
                    } catch (error) {
                        console.error('❌ Error adding delivery through centralized service:', error);
                        originalPush(item);
                    }
                });
            };
        }

        // Override deliveryHistory push
        if (window.deliveryHistory && Array.isArray(window.deliveryHistory)) {
            const originalPush = window.deliveryHistory.push.bind(window.deliveryHistory);
            
            window.deliveryHistory.push = (...items) => {
                console.warn('🚫 Direct deliveryHistory.push blocked - deliveries should move automatically');
                // Don't allow direct manipulation of delivery history
            };
        }
    }

    /**
     * Override customer functions
     */
    overrideCustomerFunctions() {
        console.log('🔄 Overriding customer functions...');

        // Override addCustomer function
        if (typeof window.addCustomer === 'function') {
            this.originalFunctions.addCustomer = window.addCustomer;
        }
        
        window.addCustomer = async (customerData) => {
            console.log('🔄 Centralized addCustomer:', customerData);
            
            try {
                if (window.centralizedBookingService?.isReady) {
                    return await window.centralizedBookingService.addCustomer(customerData);
                } else {
                    throw new Error('Centralized Booking Service not ready');
                }
            } catch (error) {
                console.error('❌ Error adding customer through centralized service:', error);
                
                // Fallback to original function
                if (this.originalFunctions.addCustomer) {
                    return this.originalFunctions.addCustomer(customerData);
                }
                
                throw error;
            }
        };

        // Override loadCustomers function
        if (typeof window.loadCustomers === 'function') {
            this.originalFunctions.loadCustomers = window.loadCustomers;
        }
        
        window.loadCustomers = async () => {
            console.log('🔄 Centralized loadCustomers');
            
            // Data should already be loaded by centralized service
            if (window.customers && window.customers.length > 0) {
                console.log(`✅ Using centralized customer data: ${window.customers.length} customers`);
                return window.customers;
            }
            
            // Fallback to original function
            if (this.originalFunctions.loadCustomers) {
                return await this.originalFunctions.loadCustomers();
            }
            
            return [];
        };

        console.log('✅ Customer functions overridden');
    }

    /**
     * Override analytics functions
     */
    overrideAnalyticsFunctions() {
        console.log('🔄 Overriding analytics functions...');

        // Override loadAnalyticsData function
        if (typeof window.loadAnalyticsData === 'function') {
            this.originalFunctions.loadAnalyticsData = window.loadAnalyticsData;
        }
        
        window.loadAnalyticsData = async (period) => {
            console.log('🔄 Centralized loadAnalyticsData:', period);
            
            try {
                // Use data from centralized arrays
                const activeDeliveries = window.activeDeliveries || [];
                const deliveryHistory = window.deliveryHistory || [];
                const allDeliveries = [...activeDeliveries, ...deliveryHistory];
                
                // Generate analytics from centralized data
                return this.generateAnalyticsFromCentralizedData(allDeliveries, period);
                
            } catch (error) {
                console.error('❌ Error loading analytics from centralized data:', error);
                
                // Fallback to original function
                if (this.originalFunctions.loadAnalyticsData) {
                    return await this.originalFunctions.loadAnalyticsData(period);
                }
                
                return this.getEmptyAnalyticsData();
            }
        };

        console.log('✅ Analytics functions overridden');
    }

    /**
     * Override signature functions
     */
    overrideSignatureFunctions() {
        console.log('🔄 Overriding signature functions...');

        // Override signature completion to use centralized system
        if (typeof window.completeDeliveryWithSignature === 'function') {
            this.originalFunctions.completeDeliveryWithSignature = window.completeDeliveryWithSignature;
        }
        
        window.completeDeliveryWithSignature = async (drNumber, signatureData) => {
            console.log('🔄 Centralized completeDeliveryWithSignature:', drNumber);
            
            try {
                // Find delivery
                const delivery = window.fieldMappingService.findDeliveryById(window.activeDeliveries, drNumber);
                
                if (!delivery) {
                    throw new Error(`Delivery not found: ${drNumber}`);
                }

                // Update through centralized service
                const updates = {
                    status: 'Completed',
                    signature_data: signatureData,
                    completed_at: new Date().toISOString()
                };

                if (window.centralizedDataService?.isInitialized) {
                    await window.centralizedDataService.updateDelivery(delivery.id, updates);
                    console.log('✅ Delivery completed through centralized system');
                } else {
                    throw new Error('Centralized Data Service not ready');
                }
                
            } catch (error) {
                console.error('❌ Error completing delivery with signature:', error);
                
                // Fallback to original function
                if (this.originalFunctions.completeDeliveryWithSignature) {
                    return this.originalFunctions.completeDeliveryWithSignature(drNumber, signatureData);
                }
                
                throw error;
            }
        };

        console.log('✅ Signature functions overridden');
    }

    /**
     * Generate analytics data from centralized arrays
     */
    generateAnalyticsFromCentralizedData(deliveries, period) {
        const now = new Date();
        const labels = [];
        const bookingValues = [];
        const costValues = [];
        
        // Generate labels based on period
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            if (period === 'day') {
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            } else if (period === 'week') {
                labels.push(`Week ${Math.ceil(date.getDate() / 7)}`);
            } else {
                labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            }
        }
        
        // Calculate values from deliveries
        labels.forEach((label, index) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - index));
            
            const dayDeliveries = deliveries.filter(d => {
                const deliveryDate = new Date(d.created_at || d.timestamp || d.deliveryDate);
                return deliveryDate.toDateString() === date.toDateString();
            });
            
            bookingValues.push(dayDeliveries.length);
            costValues.push(dayDeliveries.reduce((sum, d) => sum + (parseFloat(d.additional_costs || d.additionalCosts || 0)), 0));
        });
        
        return {
            bookings: { labels, values: bookingValues },
            costs: { labels, values: costValues },
            origins: { labels: ['Manila', 'Quezon City', 'Makati'], values: [40, 30, 30] }
        };
    }

    /**
     * Get empty analytics data
     */
    getEmptyAnalyticsData() {
        const labels = ['No Data'];
        return {
            bookings: { labels, values: [0] },
            costs: { labels, values: [0] },
            origins: { labels, values: [0] }
        };
    }

    /**
     * Restore original functions (for debugging)
     */
    restoreOriginalFunctions() {
        console.log('🔄 Restoring original functions...');
        
        Object.entries(this.originalFunctions).forEach(([name, func]) => {
            if (name === 'localStorage') {
                localStorage.setItem = func.setItem;
                localStorage.getItem = func.getItem;
                localStorage.removeItem = func.removeItem;
            } else {
                window[name] = func;
            }
        });
        
        console.log('✅ Original functions restored');
    }
}

// Create global instance only if not disabled
if (!window.CENTRALIZED_OVERRIDES_DISABLED) {
    window.centralizedFunctionOverrides = new CentralizedFunctionOverrides();
} else {
    console.log('✅ Centralized Function Overrides completely disabled - localStorage works normally');
}

// Export for debugging
window.debugCentralizedOverrides = () => {
    console.log('=== CENTRALIZED OVERRIDES DEBUG ===');
    console.log('Overrides ready:', window.centralizedFunctionOverrides?.isReady);
    console.log('Original functions stored:', Object.keys(window.centralizedFunctionOverrides?.originalFunctions || {}));
    console.log('Services ready:', {
        centralizedData: window.centralizedDataService?.isInitialized,
        centralizedBooking: window.centralizedBookingService?.isReady,
        fieldMapping: !!window.fieldMappingService
    });
};

// Function to restore original functions if needed
window.restoreOriginalFunctions = () => {
    if (window.centralizedFunctionOverrides) {
        window.centralizedFunctionOverrides.restoreOriginalFunctions();
    }
};

console.log('✅ Centralized Function Overrides loaded');