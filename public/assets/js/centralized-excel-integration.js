/**
 * CENTRALIZED EXCEL INTEGRATION
 * Integrates Excel upload with the centralized database system
 * Ensures all Excel uploads go through Supabase instead of localStorage
 */

console.log('📊 Loading Centralized Excel Integration...');

class CentralizedExcelIntegration {
    constructor() {
        this.isReady = false;
        this.processingUpload = false;
        this.init();
    }

    async init() {
        // Wait for centralized services to be ready
        await this.waitForServices();
        
        // Override existing Excel upload functions
        this.overrideExcelFunctions();
        
        // Monitor for Excel data
        this.monitorExcelData();
        
        this.isReady = true;
        console.log('✅ Centralized Excel Integration ready');
    }

    async waitForServices() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (window.centralizedBookingService?.isReady && 
                window.fieldMappingService) {
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('⚠️ Centralized services not fully ready, proceeding anyway');
    }

    /**
     * Override existing Excel upload functions
     */
    overrideExcelFunctions() {
        console.log('🔄 Overriding Excel upload functions for centralized system...');

        // Override main processing function
        if (typeof window.processUploadData === 'function') {
            window.originalProcessUploadData = window.processUploadData;
        }
        window.processUploadData = this.processUploadData.bind(this);

        // Override confirm DR upload
        if (typeof window.confirmDrUpload === 'function') {
            window.originalConfirmDrUpload = window.confirmDrUpload;
        }
        window.confirmDrUpload = this.confirmDrUpload.bind(this);

        // Override definitive process upload
        if (typeof window.definitiveProcessUpload === 'function') {
            window.originalDefinitiveProcessUpload = window.definitiveProcessUpload;
        }
        window.definitiveProcessUpload = this.processUploadData.bind(this);

        console.log('✅ Excel upload functions overridden for centralized system');
    }

    /**
     * Process Excel upload data through centralized system
     */
    async processUploadData(data) {
        if (this.processingUpload) {
            console.log('⚠️ Upload already in progress, skipping...');
            return;
        }

        this.processingUpload = true;
        console.log('📊 Processing Excel upload through centralized system...', data.length, 'rows');

        try {
            // Show loading indicator
            this.showUploadProgress('Processing Excel data...');

            // Convert Excel data to delivery format
            const deliveries = this.convertExcelToDeliveries(data);
            console.log('📋 Converted to deliveries:', deliveries.length);

            // Batch import through centralized booking service
            if (window.centralizedBookingService?.isReady) {
                const result = await window.centralizedBookingService.batchImportDeliveries(deliveries);
                
                this.showUploadSuccess(result);
                this.refreshUI();
                
            } else {
                throw new Error('Centralized Booking Service not ready');
            }

        } catch (error) {
            console.error('❌ Excel upload failed:', error);
            this.showUploadError(error.message);
        } finally {
            this.processingUpload = false;
            this.hideUploadProgress();
        }
    }

    /**
     * Convert Excel data to delivery format
     */
    convertExcelToDeliveries(excelData) {
        if (!Array.isArray(excelData)) {
            console.warn('⚠️ Excel data is not an array:', excelData);
            return [];
        }

        return excelData.map((row, index) => {
            try {
                // Handle different Excel column formats
                const delivery = {
                    // DR Number - try multiple column names
                    drNumber: row['DR'] || row['DR Number'] || row['dr_number'] || row['drNumber'] || `DR-${Date.now()}-${index}`,
                    
                    // Customer - try multiple formats
                    customerName: row['Customer'] || row['Customer Name'] || row['customer_name'] || row['customerName'] || 'Unknown Customer',
                    
                    // Vendor
                    vendorNumber: row['Vendor'] || row['Vendor Number'] || row['vendor_number'] || row['vendorNumber'] || '',
                    
                    // Location data
                    origin: row['Origin'] || row['From'] || row['origin'] || 'Unknown Origin',
                    destination: row['Destination'] || row['To'] || row['destination'] || 'Unknown Destination',
                    
                    // Truck data
                    truckType: row['Truck Type'] || row['truck_type'] || row['truckType'] || '',
                    truckPlateNumber: row['Truck Plate'] || row['truck_plate_number'] || row['truckPlateNumber'] || '',
                    
                    // Status and dates
                    status: row['Status'] || 'On Schedule',
                    deliveryDate: row['Date'] || row['Delivery Date'] || row['delivery_date'] || new Date().toISOString().split('T')[0],
                    
                    // Additional data
                    distance: row['Distance'] || row['distance'] || '',
                    additionalCosts: parseFloat(row['Additional Costs'] || row['additional_costs'] || 0),
                    
                    // Item details
                    itemNumber: row['Item Number'] || row['item_number'] || row['itemNumber'] || '',
                    itemDescription: row['Item Description'] || row['item_description'] || row['itemDescription'] || '',
                    serialNumber: row['Serial Number'] || row['serial_number'] || row['serialNumber'] || '',
                    mobileNumber: row['Mobile Number'] || row['mobile_number'] || row['mobileNumber'] || '',
                    
                    // System fields
                    createdBy: 'Excel Upload (Centralized)',
                    timestamp: new Date().toISOString()
                };

                // Validate required fields
                if (!delivery.drNumber || !delivery.customerName) {
                    console.warn('⚠️ Invalid delivery data at row', index, delivery);
                }

                return delivery;

            } catch (error) {
                console.error('❌ Error processing Excel row', index, error);
                return null;
            }
        }).filter(delivery => delivery !== null);
    }

    /**
     * Confirm DR upload (override existing function)
     */
    async confirmDrUpload() {
        console.log('📋 Confirm DR Upload called - using centralized system');

        try {
            // Get pending data from various sources
            const pendingData = this.getPendingUploadData();
            
            if (!pendingData || pendingData.length === 0) {
                throw new Error('No pending upload data found');
            }

            // Process through centralized system
            await this.processUploadData(pendingData);

        } catch (error) {
            console.error('❌ Confirm DR upload failed:', error);
            this.showUploadError(error.message);
        }
    }

    /**
     * Get pending upload data from various global variables
     */
    getPendingUploadData() {
        // Try different global variables that might contain Excel data
        const possibleSources = [
            'pendingDRBookings',
            'excelData', 
            'uploadedData',
            'drData',
            'processedExcelData',
            'bookingData'
        ];

        for (const sourceName of possibleSources) {
            const data = window[sourceName];
            if (data && Array.isArray(data) && data.length > 0) {
                console.log(`📊 Found pending data in ${sourceName}:`, data.length, 'items');
                return data;
            }
        }

        console.warn('⚠️ No pending upload data found in any source');
        return [];
    }

    /**
     * Monitor for Excel data in global variables
     */
    monitorExcelData() {
        console.log('👀 Monitoring for Excel data...');

        // Monitor specific global variables
        const monitorVariables = ['pendingDRBookings', 'excelData', 'uploadedData'];
        
        monitorVariables.forEach(varName => {
            let lastLength = 0;
            
            setInterval(() => {
                const data = window[varName];
                if (data && Array.isArray(data) && data.length > 0 && data.length !== lastLength) {
                    console.log(`📊 Detected new Excel data in ${varName}:`, data.length, 'items');
                    lastLength = data.length;
                    
                    // Auto-process if not already processing
                    if (!this.processingUpload) {
                        setTimeout(() => {
                            this.processUploadData(data);
                        }, 1000);
                    }
                }
            }, 2000);
        });
    }

    /**
     * Show upload progress
     */
    showUploadProgress(message) {
        console.log('🔄', message);
        
        // Try to show in UI if toast function exists
        if (typeof showToast === 'function') {
            showToast(message, 'info');
        }

        // Show in any existing progress elements
        const progressElements = document.querySelectorAll('.upload-progress, #uploadProgress');
        progressElements.forEach(el => {
            el.textContent = message;
            el.style.display = 'block';
        });
    }

    /**
     * Show upload success
     */
    showUploadSuccess(result) {
        const message = `Excel upload completed! ${result.success || 'Multiple'} deliveries imported successfully.`;
        console.log('✅', message);
        
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        }
    }

    /**
     * Show upload error
     */
    showUploadError(errorMessage) {
        const message = `Excel upload failed: ${errorMessage}`;
        console.error('❌', message);
        
        if (typeof showError === 'function') {
            showError(message);
        } else if (typeof showToast === 'function') {
            showToast(message, 'danger');
        }
    }

    /**
     * Hide upload progress
     */
    hideUploadProgress() {
        const progressElements = document.querySelectorAll('.upload-progress, #uploadProgress');
        progressElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Refresh UI after upload
     */
    refreshUI() {
        console.log('🔄 Refreshing UI after Excel upload...');
        
        // Refresh active deliveries
        if (typeof refreshActiveDeliveries === 'function') {
            refreshActiveDeliveries();
        }
        
        // Refresh analytics
        if (typeof updateAnalyticsDashboard === 'function') {
            updateAnalyticsDashboard();
        }
        
        // Clear any pending data
        this.clearPendingData();
    }

    /**
     * Clear pending upload data
     */
    clearPendingData() {
        const dataSources = ['pendingDRBookings', 'excelData', 'uploadedData', 'drData'];
        dataSources.forEach(sourceName => {
            if (window[sourceName]) {
                window[sourceName] = [];
                console.log(`🧹 Cleared ${sourceName}`);
            }
        });
    }
}

// Create global instance
window.centralizedExcelIntegration = new CentralizedExcelIntegration();

// Export for debugging
window.debugExcelUpload = () => {
    console.log('=== EXCEL UPLOAD DEBUG ===');
    console.log('Integration ready:', window.centralizedExcelIntegration?.isReady);
    console.log('Processing upload:', window.centralizedExcelIntegration?.processingUpload);
    console.log('Centralized booking ready:', window.centralizedBookingService?.isReady);
    console.log('Field mapping ready:', !!window.fieldMappingService);
    
    // Check for pending data
    const sources = ['pendingDRBookings', 'excelData', 'uploadedData', 'drData'];
    sources.forEach(source => {
        const data = window[source];
        console.log(`${source}:`, data ? `${data.length} items` : 'not found');
    });
};

console.log('✅ Centralized Excel Integration loaded');