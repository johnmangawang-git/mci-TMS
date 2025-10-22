/**
 * CENTRALIZED BOOKING SERVICE
 * Handles all booking operations through Supabase for multi-user synchronization
 */

console.log('📋 Loading Centralized Booking Service...');

class CentralizedBookingService {
    constructor() {
        this.dataService = null;
        this.isReady = false;
        
        // Wait for centralized data service
        this.waitForDataService();
    }

    async waitForDataService() {
        // Wait for centralized data service to be ready
        if (window.centralizedDataService && window.centralizedDataService.isInitialized) {
            this.dataService = window.centralizedDataService;
            this.isReady = true;
            console.log('✅ Centralized Booking Service ready');
            return;
        }

        // Listen for data service ready event
        window.addEventListener('centralizedDataServiceReady', () => {
            this.dataService = window.centralizedDataService;
            this.isReady = true;
            console.log('✅ Centralized Booking Service ready');
        });
    }

    /**
     * Add new delivery booking to Supabase
     */
    async addDeliveryBooking(bookingData) {
        if (!this.isReady) {
            throw new Error('Centralized Booking Service not ready');
        }

        console.log('📋 Adding delivery booking to centralized database...');

        try {
            // Normalize booking data for Supabase
            const normalizedData = this.normalizeBookingData(bookingData);
            
            // Add to Supabase through centralized data service
            const result = await this.dataService.addDelivery(normalizedData);
            
            console.log('✅ Delivery booking added successfully:', result);
            
            // Show success notification
            this.showSuccessNotification('Delivery booking added successfully!');
            
            // Refresh UI
            this.refreshBookingUI();
            
            return result;

        } catch (error) {
            console.error('❌ Error adding delivery booking:', error);
            this.showErrorNotification('Failed to add delivery booking: ' + error.message);
            throw error;
        }
    }

    /**
     * Update existing delivery booking
     */
    async updateDeliveryBooking(deliveryId, updates) {
        if (!this.isReady) {
            throw new Error('Centralized Booking Service not ready');
        }

        console.log('📋 Updating delivery booking in centralized database...');

        try {
            const result = await this.dataService.updateDelivery(deliveryId, updates);
            
            console.log('✅ Delivery booking updated successfully:', result);
            this.showSuccessNotification('Delivery booking updated successfully!');
            
            return result;

        } catch (error) {
            console.error('❌ Error updating delivery booking:', error);
            this.showErrorNotification('Failed to update delivery booking: ' + error.message);
            throw error;
        }
    }

    /**
     * Delete delivery booking
     */
    async deleteDeliveryBooking(deliveryId) {
        if (!this.isReady) {
            throw new Error('Centralized Booking Service not ready');
        }

        console.log('📋 Deleting delivery booking from centralized database...');

        try {
            await this.dataService.deleteDelivery(deliveryId);
            
            console.log('✅ Delivery booking deleted successfully');
            this.showSuccessNotification('Delivery booking deleted successfully!');
            
            return true;

        } catch (error) {
            console.error('❌ Error deleting delivery booking:', error);
            this.showErrorNotification('Failed to delete delivery booking: ' + error.message);
            throw error;
        }
    }

    /**
     * Add customer to centralized database
     */
    async addCustomer(customerData) {
        if (!this.isReady) {
            throw new Error('Centralized Booking Service not ready');
        }

        console.log('👤 Adding customer to centralized database...');

        try {
            const result = await this.dataService.addCustomer(customerData);
            
            console.log('✅ Customer added successfully:', result);
            this.showSuccessNotification('Customer added successfully!');
            
            return result;

        } catch (error) {
            console.error('❌ Error adding customer:', error);
            this.showErrorNotification('Failed to add customer: ' + error.message);
            throw error;
        }
    }

    /**
     * Normalize booking data for Supabase storage
     */
    normalizeBookingData(bookingData) {
        // Generate unique DR number if not provided
        const drNumber = bookingData.drNumber || bookingData.dr_number || this.generateDRNumber();
        
        return {
            dr_number: drNumber,
            customer_name: bookingData.customerName || bookingData.customer_name || '',
            vendor_number: bookingData.vendorNumber || bookingData.vendor_number || '',
            origin: bookingData.origin || '',
            destination: bookingData.destination || bookingData.destinations?.join('; ') || '',
            truck_type: bookingData.truckType || bookingData.truck_type || '',
            truck_plate_number: bookingData.truckPlateNumber || bookingData.truck_plate_number || '',
            status: bookingData.status || 'On Schedule',
            distance: bookingData.distance || '',
            additional_costs: parseFloat(bookingData.additionalCosts || bookingData.additional_costs || 0),
            created_date: bookingData.deliveryDate || bookingData.created_date || new Date().toISOString().split('T')[0],
            created_by: 'Centralized Booking System',
            // Store additional data as JSON
            additional_data: JSON.stringify({
                additionalCostItems: bookingData.additionalCostItems || [],
                itemNumber: bookingData.itemNumber || bookingData.item_number || '',
                itemDescription: bookingData.itemDescription || bookingData.item_description || '',
                serialNumber: bookingData.serialNumber || bookingData.serial_number || '',
                mobileNumber: bookingData.mobileNumber || bookingData.mobile_number || '',
                timestamp: bookingData.timestamp || new Date().toISOString()
            })
        };
    }

    /**
     * Generate unique DR number
     */
    generateDRNumber() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const time = now.getTime().toString().slice(-6);
        
        return `DR${year}${month}${day}-${time}`;
    }

    /**
     * Show success notification
     */
    showSuccessNotification(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            console.log('✅ SUCCESS:', message);
        }
    }

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        if (typeof showError === 'function') {
            showError(message);
        } else if (typeof showToast === 'function') {
            showToast(message, 'danger');
        } else {
            console.error('❌ ERROR:', message);
        }
    }

    /**
     * Refresh booking UI
     */
    refreshBookingUI() {
        // Close booking modal
        if (typeof hideModal === 'function') {
            hideModal('bookingModal');
        }
        
        // Reset booking form
        if (typeof resetBookingForm === 'function') {
            resetBookingForm();
        }
        
        // Refresh active deliveries view
        if (typeof refreshActiveDeliveries === 'function') {
            refreshActiveDeliveries();
        }
        
        // Refresh analytics
        if (typeof updateAnalyticsDashboard === 'function') {
            updateAnalyticsDashboard();
        }
    }

    /**
     * Batch import deliveries (for Excel uploads)
     */
    async batchImportDeliveries(deliveriesArray) {
        if (!this.isReady) {
            throw new Error('Centralized Booking Service not ready');
        }

        console.log(`📋 Batch importing ${deliveriesArray.length} deliveries...`);

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const delivery of deliveriesArray) {
            try {
                await this.addDeliveryBooking(delivery);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    delivery: delivery.drNumber || 'Unknown',
                    error: error.message
                });
            }
        }

        console.log('📋 Batch import completed:', results);
        
        if (results.success > 0) {
            this.showSuccessNotification(`Successfully imported ${results.success} deliveries`);
        }
        
        if (results.failed > 0) {
            this.showErrorNotification(`Failed to import ${results.failed} deliveries`);
        }

        return results;
    }

    /**
     * Get delivery statistics
     */
    getDeliveryStatistics() {
        const activeCount = window.activeDeliveries?.length || 0;
        const completedCount = window.deliveryHistory?.length || 0;
        const totalCount = activeCount + completedCount;

        return {
            active: activeCount,
            completed: completedCount,
            total: totalCount,
            completionRate: totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : 0
        };
    }
}

// Create global instance
window.centralizedBookingService = new CentralizedBookingService();

// Override existing booking functions to use centralized service
window.addDeliveryBooking = async function(bookingData) {
    return await window.centralizedBookingService.addDeliveryBooking(bookingData);
};

window.updateDeliveryBooking = async function(deliveryId, updates) {
    return await window.centralizedBookingService.updateDeliveryBooking(deliveryId, updates);
};

window.deleteDeliveryBooking = async function(deliveryId) {
    return await window.centralizedBookingService.deleteDeliveryBooking(deliveryId);
};

window.addCustomerCentralized = async function(customerData) {
    return await window.centralizedBookingService.addCustomer(customerData);
};

console.log('✅ Centralized Booking Service loaded');