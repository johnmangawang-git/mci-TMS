/**
 * EXCEL UPLOAD DATA FLOW FIX
 * Ensures proper data flow from Excel upload to Active Deliveries display
 * 
 * Issues Fixed:
 * 1. Data format mismatches between upload and display
 * 2. Missing field mappings
 * 3. Status filtering issues
 * 4. UI refresh timing problems
 */

console.log('🔧 Loading Excel Upload Data Flow Fix...');

// =============================================================================
// 1. ENHANCED DATA MAPPING FOR EXCEL UPLOAD
// =============================================================================

// Override the mapDRData function to ensure proper field mapping
const originalMapDRDataFlow = window.mapDRData;

window.mapDRData = function(data) {
    console.log('🔧 ENHANCED mapDRData called with', data.length, 'rows');
    
    if (!data || data.length === 0) {
        console.error('❌ No data received in mapDRData');
        return [];
    }
    
    const mappedData = [];
    const seenSerialNumbers = new Set();
    let skippedDuplicateSerials = 0;
    
    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        // Skip empty rows
        if (!row || row.length === 0) continue;
        
        console.log(`🔍 Processing row ${i}:`, row);
        
        // Extract data with robust handling
        const drNumber = row[3] !== undefined && row[3] !== null ? String(row[3]).trim() : '';
        const vendorNumber = row[6] !== undefined && row[6] !== null ? String(row[6]).trim() : '';
        const customerName = row[7] !== undefined && row[7] !== null ? String(row[7]).trim() : '';
        const destination = row[8] !== undefined && row[8] !== null ? String(row[8]).trim() : '';
        const itemNumber = row[9] !== undefined && row[9] !== null ? String(row[9]).trim() : '';
        const mobileNumber = row[10] !== undefined && row[10] !== null ? String(row[10]).trim() : '';
        const itemDescription = row[11] !== undefined && row[11] !== null ? String(row[11]).trim() : '';
        const serialNumber = row[14] !== undefined && row[14] !== null ? String(row[14]).trim() : '';
        
        // Validate required fields
        if (!drNumber || !customerName || !destination) {
            console.warn(`❌ Skipping row ${i + 1}: Missing required data`);
            continue;
        }
        
        // Check for duplicate serial numbers
        if (serialNumber && seenSerialNumbers.has(serialNumber)) {
            console.warn(`⚠️ Skipping row ${i + 1}: Duplicate Serial Number "${serialNumber}"`);
            skippedDuplicateSerials++;
            continue;
        }
        
        if (serialNumber) {
            seenSerialNumbers.add(serialNumber);
        }
        
        // Create booking object with ENHANCED field mapping for display compatibility
        const booking = {
            // Core identification
            id: generateDeliveryId(),
            drNumber: drNumber,
            
            // Customer details
            customerName: customerName,
            vendorNumber: vendorNumber || '',
            
            // Location details
            origin: 'SMEG Alabang warehouse',
            destination: destination,
            
            // Date and timing
            deliveryDate: new Date().toISOString().split('T')[0],
            bookedDate: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            
            // Truck reference (will be filled from form inputs)
            truckType: '',
            truckPlateNumber: '',
            truck: '',
            
            // Status and tracking - CRITICAL: Use 'On Schedule' for display compatibility
            status: 'On Schedule',
            source: 'DR_UPLOAD',
            
            // Cost information
            additionalCosts: 0,
            additionalCostBreakdown: [],
            
            // Distance
            distance: '',
            
            // Excel-specific fields
            itemNumber: itemNumber || '',
            mobileNumber: mobileNumber || '',
            itemDescription: itemDescription || '',
            serialNumber: serialNumber || '',
            
            // Additional fields for complete data mapping
            completedDate: null,
            signedAt: null,
            signature: null,
            
            // Metadata for tracking
            createdBy: 'Excel Upload',
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log(`✅ Created booking object for row ${i + 1}:`, booking);
        mappedData.push(booking);
    }
    
    console.log(`🗺️ === ENHANCED MAPDRDATA COMPLETED ===`);
    console.log(`📊 Mapped ${mappedData.length} valid bookings from ${data.length - 1} rows`);
    console.log(`🔢 Unique Serial Numbers processed: ${seenSerialNumbers.size}`);
    console.log(`⚠️ Skipped duplicate Serial Numbers: ${skippedDuplicateSerials}`);
    
    return mappedData;
};

// =============================================================================
// 2. ENHANCED CREATE BOOKING FROM DR
// =============================================================================

// Override the createBookingFromDR function to ensure proper data flow
const originalCreateBookingFromDRFlow = window.createBookingFromDR;

window.createBookingFromDR = async function(bookingData) {
    console.log('🔧 ENHANCED createBookingFromDR called for:', bookingData.drNumber);
    
    try {
        // Ensure activeDeliveries array exists
        if (!window.activeDeliveries) {
            window.activeDeliveries = [];
            console.log('🔧 Initialized activeDeliveries array');
        }
        
        // CRITICAL: Ensure status is compatible with display filters
        if (bookingData.status !== 'On Schedule' && bookingData.status !== 'Active') {
            bookingData.status = 'On Schedule';
            console.log('🔧 Fixed status to On Schedule for display compatibility');
        }
        
        // Ensure all required display fields are present
        bookingData.id = bookingData.id || generateDeliveryId();
        bookingData.drNumber = bookingData.drNumber || `DR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        bookingData.customerName = bookingData.customerName || 'Unknown Customer';
        bookingData.origin = bookingData.origin || 'SMEG Alabang warehouse';
        bookingData.destination = bookingData.destination || 'Unknown Destination';
        bookingData.deliveryDate = bookingData.deliveryDate || new Date().toISOString().split('T')[0];
        bookingData.bookedDate = bookingData.bookedDate || bookingData.deliveryDate;
        bookingData.truck = bookingData.truck || (bookingData.truckType && bookingData.truckPlateNumber ? 
            `${bookingData.truckType} (${bookingData.truckPlateNumber})` : 'N/A');
        
        console.log('🔧 Enhanced booking data:', bookingData);
        
        // Save to Supabase using dataService
        if (window.dataService) {
            try {
                // Create delivery object with Supabase-compatible field names
                const newDelivery = {
                    dr_number: bookingData.drNumber,
                    customer_name: bookingData.customerName,
                    vendor_number: bookingData.vendorNumber || '',
                    origin: bookingData.origin,
                    destination: bookingData.destination,
                    truck_type: bookingData.truckType || '',
                    truck_plate_number: bookingData.truckPlateNumber || '',
                    status: 'On Schedule', // Ensure compatible status
                    distance: bookingData.distance || '',
                    additional_costs: parseFloat(bookingData.additionalCosts) || 0.00,
                    created_date: bookingData.bookedDate,
                    created_by: 'Excel Upload',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    // Excel-specific fields
                    item_number: bookingData.itemNumber || '',
                    mobile_number: bookingData.mobileNumber || '',
                    item_description: bookingData.itemDescription || '',
                    serial_number: bookingData.serialNumber || ''
                };

                console.log('🔧 Saving to Supabase:', newDelivery);
                
                // Save to Supabase
                const savedDelivery = await window.dataService.saveDelivery(newDelivery);
                console.log('✅ Saved to Supabase:', savedDelivery);
                
                // Add to local array with proper field mapping
                const localDelivery = {
                    ...bookingData,
                    id: savedDelivery.id || bookingData.id,
                    drNumber: savedDelivery.dr_number || bookingData.drNumber,
                    customerName: savedDelivery.customer_name || bookingData.customerName,
                    vendorNumber: savedDelivery.vendor_number || bookingData.vendorNumber,
                    origin: savedDelivery.origin || bookingData.origin,
                    destination: savedDelivery.destination || bookingData.destination,
                    truckType: savedDelivery.truck_type || bookingData.truckType,
                    truckPlateNumber: savedDelivery.truck_plate_number || bookingData.truckPlateNumber,
                    status: 'On Schedule', // Ensure display compatibility
                    additionalCosts: savedDelivery.additional_costs || bookingData.additionalCosts,
                    createdBy: savedDelivery.created_by || bookingData.createdBy,
                    createdAt: savedDelivery.created_at || bookingData.createdAt
                };
                
                window.activeDeliveries.push(localDelivery);
                console.log('✅ Added to local activeDeliveries array');
                
            } catch (supabaseError) {
                console.warn('⚠️ Supabase save failed, using localStorage fallback:', supabaseError);
                
                // Fallback to localStorage
                window.activeDeliveries.push(bookingData);
                localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
                console.log('✅ Saved to localStorage as fallback');
            }
        } else {
            console.log('📊 DataService not available, using localStorage');
            window.activeDeliveries.push(bookingData);
            localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
        }
        
        console.log(`✅ ENHANCED createBookingFromDR completed for ${bookingData.drNumber}`);
        console.log(`📊 Total active deliveries: ${window.activeDeliveries.length}`);
        
    } catch (error) {
        console.error('❌ Error in ENHANCED createBookingFromDR:', error);
        throw error;
    }
};

// =============================================================================
// 3. ENHANCED CONFIRM DR UPLOAD
// =============================================================================

// Override the confirmDRUpload function to ensure proper data flow
const originalConfirmDRUploadFlow = window.confirmDRUpload;

window.confirmDRUpload = async function() {
    console.log('🔧 ENHANCED confirmDRUpload called');
    
    try {
        // Call original function first
        if (originalConfirmDRUploadFlow) {
            await originalConfirmDRUploadFlow();
        }
        
        // Enhanced post-upload processing
        console.log('🔄 Enhanced post-upload processing...');
        
        // Step 1: Ensure data is properly loaded
        await ensureActiveDeliveriesLoaded();
        
        // Step 2: Force refresh of display
        await forceRefreshActiveDeliveries();
        
        // Step 3: Switch to Active Deliveries view
        setTimeout(() => {
            if (typeof window.switchToActiveDeliveriesView === 'function') {
                window.switchToActiveDeliveriesView();
                console.log('✅ Switched to Active Deliveries view');
            }
        }, 1000);
        
        console.log('✅ ENHANCED confirmDRUpload completed');
        
    } catch (error) {
        console.error('❌ Error in ENHANCED confirmDRUpload:', error);
    }
};

// =============================================================================
// 4. UTILITY FUNCTIONS
// =============================================================================

async function ensureActiveDeliveriesLoaded() {
    console.log('🔧 Ensuring active deliveries are loaded...');
    
    // If no data in memory, try to load from source
    if (!window.activeDeliveries || window.activeDeliveries.length === 0) {
        console.log('📊 No data in memory, loading from source...');
        
        // Try Supabase first
        if (window.dataService && typeof window.dataService.getDeliveries === 'function') {
            try {
                const deliveries = await window.dataService.getDeliveries();
                if (deliveries && deliveries.length > 0) {
                    window.activeDeliveries = deliveries.filter(d => 
                        d.status !== 'Completed' && d.status !== 'Signed'
                    );
                    console.log(`📊 Loaded ${window.activeDeliveries.length} deliveries from Supabase`);
                }
            } catch (error) {
                console.warn('⚠️ Supabase load failed:', error);
            }
        }
        
        // Try localStorage fallback
        if (!window.activeDeliveries || window.activeDeliveries.length === 0) {
            try {
                const saved = localStorage.getItem('mci-active-deliveries');
                if (saved) {
                    window.activeDeliveries = JSON.parse(saved);
                    console.log(`📊 Loaded ${window.activeDeliveries.length} deliveries from localStorage`);
                }
            } catch (error) {
                console.warn('⚠️ localStorage load failed:', error);
            }
        }
    }
    
    console.log(`📊 Active deliveries count: ${window.activeDeliveries ? window.activeDeliveries.length : 0}`);
}

async function forceRefreshActiveDeliveries() {
    console.log('🔄 Force refreshing Active Deliveries...');
    
    // Call the unified load function
    if (typeof window.loadActiveDeliveries === 'function') {
        await window.loadActiveDeliveries(true); // Force reload
    }
    
    // Also call the populate function directly
    if (typeof window.populateActiveDeliveriesTable === 'function') {
        window.populateActiveDeliveriesTable();
    }
    
    console.log('✅ Force refresh completed');
}

function generateDeliveryId() {
    return 'delivery_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// =============================================================================
// 5. INITIALIZATION
// =============================================================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Excel Upload Data Flow Fix initialized');
    
    // Ensure arrays exist
    if (!window.activeDeliveries) {
        window.activeDeliveries = [];
    }
    
    console.log('✅ Excel Upload Data Flow Fix loaded successfully');
});

console.log('✅ Excel Upload Data Flow Fix loaded successfully');
