/**
 * CONSOLIDATED ACTIVE DELIVERIES FIX
 * Single comprehensive fix for all Active Deliveries display issues
 * Avoids variable name conflicts by using unique naming
 */

console.log('🔧 Loading Consolidated Active Deliveries Fix...');

// =============================================================================
// 1. DISABLE CONFLICTING FUNCTIONS
// =============================================================================

// Clear any blocking flags
if (window.pendingStatusChanges) {
    window.pendingStatusChanges.clear();
}
window.statusUpdateInProgress = false;
window.lastStatusUpdate = null;

// Disable conflicting functions
const conflictingFunctions = [
    'loadActiveDeliveries',
    'minimalLoadActiveDeliveries', 
    'enhancedLoadActiveDeliveries',
    'populateActiveDeliveriesTable'
];

conflictingFunctions.forEach(funcName => {
    if (window[funcName]) {
        console.log(`🔧 Disabling conflicting function: ${funcName}`);
        window[`_original${funcName}`] = window[funcName];
        window[funcName] = null;
    }
});

// =============================================================================
// 2. UNIFIED LOAD ACTIVE DELIVERIES FUNCTION
// =============================================================================

window.loadActiveDeliveries = async function(forceReload = false) {
    console.log('🔄 CONSOLIDATED loadActiveDeliveries called - forceReload:', forceReload);
    
    try {
        // Step 1: Load from Supabase (primary source)
        if (window.dataService && typeof window.dataService.getDeliveries === 'function') {
            console.log('📡 Loading from Supabase...');
            const deliveries = await window.dataService.getDeliveries();
            
            if (deliveries && deliveries.length > 0) {
                console.log(`📊 Loaded ${deliveries.length} deliveries from Supabase`);
                
                // Filter for active deliveries
                window.activeDeliveries = deliveries.filter(d => 
                    d.status !== 'Completed' && 
                    d.status !== 'Signed' && 
                    d.status !== 'Delivered'
                );
                
                console.log(`📦 Filtered to ${window.activeDeliveries.length} active deliveries`);
                
                // Save to localStorage as backup
                localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
                
                // Populate table
                await populateActiveDeliveriesTableConsolidated();
                return;
            }
        }
        
        // Step 2: Fallback to localStorage
        console.log('📊 Supabase empty, trying localStorage...');
        const saved = localStorage.getItem('mci-active-deliveries');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                window.activeDeliveries = parsed;
                console.log(`📊 Loaded ${window.activeDeliveries.length} deliveries from localStorage`);
                
                // Populate table
                await populateActiveDeliveriesTableConsolidated();
                return;
            }
        }
        
        // Step 3: Initialize empty
        window.activeDeliveries = [];
        await populateActiveDeliveriesTableConsolidated();
        
    } catch (error) {
        console.error('❌ Error in CONSOLIDATED loadActiveDeliveries:', error);
        
        // Fallback: try to display existing data
        if (window.activeDeliveries && window.activeDeliveries.length > 0) {
            await populateActiveDeliveriesTableConsolidated();
        }
    }
};

// =============================================================================
// 3. CONSOLIDATED TABLE POPULATION
// =============================================================================

async function populateActiveDeliveriesTableConsolidated() {
    console.log('🔄 CONSOLIDATED populateActiveDeliveriesTable called');
    
    const tableBody = document.getElementById('activeDeliveriesTableBody');
    if (!tableBody) {
        console.error('❌ activeDeliveriesTableBody not found');
        return;
    }
    
    // Ensure we have data
    if (!window.activeDeliveries || window.activeDeliveries.length === 0) {
        console.log('📭 No active deliveries to display');
        tableBody.innerHTML = `
            <tr>
                <td colspan="13" class="text-center py-5">
                    <i class="bi bi-truck" style="font-size: 3rem; opacity: 0.3;"></i>
                    <h4 class="mt-3">No active deliveries found</h4>
                    <p class="text-muted">Try uploading an Excel file or creating a new booking</p>
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`📊 Displaying ${window.activeDeliveries.length} active deliveries`);
    
    // Generate table rows with proper field mapping
    const tableRows = window.activeDeliveries.map((delivery, index) => {
        // Ensure consistent field names
        const drNumber = delivery.drNumber || delivery.dr_number || 'N/A';
        const customerName = delivery.customerName || delivery.customer_name || 'Unknown Customer';
        const vendorNumber = delivery.vendorNumber || delivery.vendor_number || 'N/A';
        const origin = delivery.origin || 'SMEG Alabang warehouse';
        const destination = delivery.destination || 'Unknown Destination';
        const truckType = delivery.truckType || delivery.truck_type || '';
        const truckPlateNumber = delivery.truckPlateNumber || delivery.truck_plate_number || '';
        const truck = delivery.truck || (truckType && truckPlateNumber ? `${truckType} (${truckPlateNumber})` : 'N/A');
        const status = delivery.status || 'On Schedule';
        const deliveryDate = delivery.deliveryDate || delivery.delivery_date || delivery.bookedDate || 'N/A';
        const additionalCosts = parseFloat(delivery.additionalCosts || delivery.additional_costs || 0);
        const itemNumber = delivery.itemNumber || delivery.item_number || '';
        const mobileNumber = delivery.mobileNumber || delivery.mobile_number || '';
        const itemDescription = delivery.itemDescription || delivery.item_description || '';
        const serialNumber = delivery.serialNumber || delivery.serial_number || '';
        
        // Get status info
        const statusInfo = getStatusInfoConsolidated(status);
        
        return `
            <tr data-delivery-id="${delivery.id}">
                <td>
                    <input type="checkbox" class="form-check-input delivery-checkbox" 
                           data-delivery-id="${delivery.id}">
                </td>
                <td><strong>${drNumber}</strong></td>
                <td>${customerName}</td>
                <td>${vendorNumber}</td>
                <td><span class="badge bg-info">${origin}</span></td>
                <td>${destination}</td>
                <td>${truck}</td>
                <td>
                    <div class="status-dropdown-container">
                        <span class="badge ${statusInfo.class} status-clickable" 
                              data-delivery-id="${delivery.id}" 
                              data-current-status="${status}"
                              onclick="event.stopPropagation(); toggleStatusDropdownConsolidated('${delivery.id}')">
                            <i class="bi ${statusInfo.icon}"></i> ${status}
                            <i class="bi bi-chevron-down ms-1" style="font-size: 0.8em;"></i>
                        </span>
                        <div class="status-dropdown" id="statusDropdown-${delivery.id}" style="display: none;">
                            ${generateStatusOptionsConsolidated(status, delivery.id)}
                        </div>
                    </div>
                </td>
                <td>${deliveryDate}</td>
                <td>₱${additionalCosts.toFixed(2)}</td>
                <td>${itemNumber}</td>
                <td>${mobileNumber}</td>
                <td>${itemDescription}</td>
                <td>${serialNumber}</td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tableRows;
    
    // Update counter if exists
    const activeCount = document.getElementById('activeDeliveriesCount');
    if (activeCount) {
        activeCount.textContent = window.activeDeliveries.length.toString();
    }
    
    console.log('✅ CONSOLIDATED table populated successfully');
}

// =============================================================================
// 4. ENHANCED EXCEL UPLOAD INTEGRATION
// =============================================================================

// Override mapDRData function
const _originalMapDRDataConsolidated = window.mapDRData;

window.mapDRData = function(data) {
    console.log('🔧 CONSOLIDATED mapDRData called with', data.length, 'rows');
    
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
            id: generateDeliveryIdConsolidated(),
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
    
    console.log(`🗺️ === CONSOLIDATED MAPDRDATA COMPLETED ===`);
    console.log(`📊 Mapped ${mappedData.length} valid bookings from ${data.length - 1} rows`);
    console.log(`🔢 Unique Serial Numbers processed: ${seenSerialNumbers.size}`);
    console.log(`⚠️ Skipped duplicate Serial Numbers: ${skippedDuplicateSerials}`);
    
    return mappedData;
};

// Override createBookingFromDR function
const _originalCreateBookingFromDRConsolidated = window.createBookingFromDR;

window.createBookingFromDR = async function(bookingData) {
    console.log('🔧 CONSOLIDATED createBookingFromDR called for:', bookingData.drNumber);
    
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
        bookingData.id = bookingData.id || generateDeliveryIdConsolidated();
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
        
        console.log(`✅ CONSOLIDATED createBookingFromDR completed for ${bookingData.drNumber}`);
        console.log(`📊 Total active deliveries: ${window.activeDeliveries.length}`);
        
    } catch (error) {
        console.error('❌ Error in CONSOLIDATED createBookingFromDR:', error);
        throw error;
    }
};

// Override confirmDRUpload function
const _originalConfirmDRUploadConsolidated = window.confirmDRUpload;

window.confirmDRUpload = async function() {
    console.log('🔧 CONSOLIDATED confirmDRUpload called');
    
    try {
        // Call original function first
        if (_originalConfirmDRUploadConsolidated) {
            await _originalConfirmDRUploadConsolidated();
        }
        
        // Enhanced post-upload processing
        console.log('🔄 Enhanced post-upload processing...');
        
        // Step 1: Ensure data is properly loaded
        await ensureActiveDeliveriesLoadedConsolidated();
        
        // Step 2: Force refresh of display
        await forceRefreshActiveDeliveriesConsolidated();
        
        // Step 3: Switch to Active Deliveries view
        setTimeout(() => {
            if (typeof window.switchToActiveDeliveriesView === 'function') {
                window.switchToActiveDeliveriesView();
                console.log('✅ Switched to Active Deliveries view');
            }
        }, 1000);
        
        console.log('✅ CONSOLIDATED confirmDRUpload completed');
        
    } catch (error) {
        console.error('❌ Error in CONSOLIDATED confirmDRUpload:', error);
    }
};

// =============================================================================
// 5. UTILITY FUNCTIONS
// =============================================================================

function getStatusInfoConsolidated(status) {
    const statusMap = {
        'On Schedule': { class: 'bg-primary', icon: 'bi-clock' },
        'Active': { class: 'bg-primary', icon: 'bi-clock' },
        'In Transit': { class: 'bg-warning', icon: 'bi-truck' },
        'Out for Delivery': { class: 'bg-info', icon: 'bi-truck' },
        'Delivered': { class: 'bg-success', icon: 'bi-check-circle' },
        'Completed': { class: 'bg-success', icon: 'bi-check-circle' },
        'Signed': { class: 'bg-success', icon: 'bi-check-circle' },
        'Cancelled': { class: 'bg-danger', icon: 'bi-x-circle' },
        'Pending': { class: 'bg-secondary', icon: 'bi-hourglass' }
    };
    
    return statusMap[status] || { class: 'bg-secondary', icon: 'bi-question' };
}

function generateStatusOptionsConsolidated(currentStatus, deliveryId) {
    const statuses = ['On Schedule', 'In Transit', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'];
    
    return statuses.map(status => {
        const isCurrent = status === currentStatus;
        return `
            <div class="status-option ${isCurrent ? 'current' : ''}" 
                 onclick="changeDeliveryStatusConsolidated('${deliveryId}', '${status}')">
                ${status}
            </div>
        `;
    }).join('');
}

function generateDeliveryIdConsolidated() {
    return 'delivery_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function ensureActiveDeliveriesLoadedConsolidated() {
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

async function forceRefreshActiveDeliveriesConsolidated() {
    console.log('🔄 Force refreshing Active Deliveries...');
    
    // Call the unified load function
    if (typeof window.loadActiveDeliveries === 'function') {
        await window.loadActiveDeliveries(true); // Force reload
    }
    
    // Also call the populate function directly
    if (typeof populateActiveDeliveriesTableConsolidated === 'function') {
        populateActiveDeliveriesTableConsolidated();
    }
    
    console.log('✅ Force refresh completed');
}

// =============================================================================
// 6. STATUS MANAGEMENT
// =============================================================================

window.toggleStatusDropdownConsolidated = function(deliveryId) {
    // Close all other dropdowns
    document.querySelectorAll('.status-dropdown').forEach(dropdown => {
        if (dropdown.id !== `statusDropdown-${deliveryId}`) {
            dropdown.style.display = 'none';
        }
    });
    
    // Toggle current dropdown
    const dropdown = document.getElementById(`statusDropdown-${deliveryId}`);
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
};

window.changeDeliveryStatusConsolidated = function(deliveryId, newStatus) {
    console.log(`🔄 Changing status for delivery ${deliveryId} to ${newStatus}`);
    
    // Find delivery in array
    const deliveryIndex = window.activeDeliveries.findIndex(d => d.id === deliveryId);
    if (deliveryIndex === -1) {
        console.error('❌ Delivery not found:', deliveryId);
        return;
    }
    
    // Update status
    window.activeDeliveries[deliveryIndex].status = newStatus;
    window.activeDeliveries[deliveryIndex].lastModified = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
    
    // Save to Supabase if available
    if (window.dataService && typeof window.dataService.saveDelivery === 'function') {
        window.dataService.saveDelivery(window.activeDeliveries[deliveryIndex])
            .then(() => console.log('✅ Status saved to Supabase'))
            .catch(error => console.warn('⚠️ Failed to save to Supabase:', error));
    }
    
    // Refresh display
    populateActiveDeliveriesTableConsolidated();
    
    // Close dropdown
    const dropdown = document.getElementById(`statusDropdown-${deliveryId}`);
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    console.log('✅ Status changed successfully');
};

// =============================================================================
// 7. INITIALIZATION
// =============================================================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Consolidated Active Deliveries Fix initialized');
    
    // Ensure arrays exist
    if (!window.activeDeliveries) {
        window.activeDeliveries = [];
    }
    
    // Load initial data
    setTimeout(() => {
        window.loadActiveDeliveries();
    }, 1000);
});

console.log('✅ Consolidated Active Deliveries Fix loaded successfully');

