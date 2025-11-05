/**
 * ACTIVE DELIVERIES DISPLAY FIX
 * Comprehensive solution for Excel upload display issues
 * 
 * Issues Identified:
 * 1. Multiple conflicting loadActiveDeliveries functions
 * 2. Data format mismatches between upload and display
 * 3. UI refresh timing issues
 * 4. Status filtering problems
 * 5. Field mapping inconsistencies
 */

console.log('🔧 Loading Active Deliveries Display Fix...');

// =============================================================================
// 1. UNIFIED LOAD ACTIVE DELIVERIES FUNCTION
// =============================================================================

// Store original functions to avoid conflicts
const originalLoadActiveDeliveriesDisplay = window.loadActiveDeliveries;
const originalPopulateActiveDeliveriesTableDisplay = window.populateActiveDeliveriesTable;

// Unified loadActiveDeliveries function that handles all scenarios
window.loadActiveDeliveries = async function(forceReload = false) {
    console.log('🔄 UNIFIED loadActiveDeliveries called - forceReload:', forceReload);
    
    try {
        // Step 1: Load data from primary source (Supabase)
        await loadActiveDeliveriesFromSource(forceReload);
        
        // Step 2: Ensure data is properly formatted for display
        normalizeActiveDeliveriesData();
        
        // Step 3: Populate the table
        await populateActiveDeliveriesTableUnified();
        
        console.log('✅ UNIFIED loadActiveDeliveries completed successfully');
        
    } catch (error) {
        console.error('❌ Error in UNIFIED loadActiveDeliveries:', error);
        
        // Fallback: Try to display existing data
        if (window.activeDeliveries && window.activeDeliveries.length > 0) {
            console.log('🔄 Fallback: Displaying existing data');
            await populateActiveDeliveriesTableUnified();
        }
    }
};

// =============================================================================
// 2. DATA LOADING FROM SOURCE
// =============================================================================

async function loadActiveDeliveriesFromSource(forceReload = false) {
    console.log('📡 Loading data from source...');
    
    // Priority 1: Supabase (if available)
    if (window.dataService && typeof window.dataService.getDeliveries === 'function') {
        try {
            console.log('🔧 Loading from Supabase...');
            const deliveries = await window.dataService.getDeliveries();
            
            if (deliveries && deliveries.length > 0) {
                console.log(`📊 Loaded ${deliveries.length} deliveries from Supabase`);
                
                // Normalize field names
                const normalizedDeliveries = normalizeDeliveryArray(deliveries);
                
                // Filter for active deliveries (not completed)
                window.activeDeliveries = normalizedDeliveries.filter(d => 
                    d.status !== 'Completed' && 
                    d.status !== 'Signed' && 
                    d.status !== 'Delivered'
                );
                
                console.log(`📦 Filtered to ${window.activeDeliveries.length} active deliveries`);
                
                // Save to localStorage as backup
                localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
                
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Supabase load failed, trying localStorage:', error);
        }
    }
    
    // Priority 2: localStorage fallback
    try {
        const saved = localStorage.getItem('mci-active-deliveries');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                window.activeDeliveries = normalizeDeliveryArray(parsed);
                console.log(`📊 Loaded ${window.activeDeliveries.length} deliveries from localStorage`);
                return true;
            }
        }
    } catch (error) {
        console.warn('⚠️ localStorage load failed:', error);
    }
    
    // Priority 3: Initialize empty array
    if (!window.activeDeliveries) {
        window.activeDeliveries = [];
        console.log('📊 Initialized empty activeDeliveries array');
    }
    
    return false;
}

// =============================================================================
// 3. DATA NORMALIZATION
// =============================================================================

function normalizeActiveDeliveriesData() {
    if (!window.activeDeliveries || !Array.isArray(window.activeDeliveries)) {
        window.activeDeliveries = [];
        return;
    }
    
    console.log('🔧 Normalizing active deliveries data...');
    
    window.activeDeliveries = window.activeDeliveries.map(delivery => {
        // Ensure consistent field names for display
        const normalized = {
            // Core fields with fallbacks
            id: delivery.id || delivery.delivery_id || generateId(),
            drNumber: delivery.drNumber || delivery.dr_number || 'N/A',
            customerName: delivery.customerName || delivery.customer_name || 'Unknown Customer',
            vendorNumber: delivery.vendorNumber || delivery.vendor_number || '',
            origin: delivery.origin || 'SMEG Alabang warehouse',
            destination: delivery.destination || 'Unknown Destination',
            truckType: delivery.truckType || delivery.truck_type || '',
            truckPlateNumber: delivery.truckPlateNumber || delivery.truck_plate_number || '',
            status: delivery.status || 'On Schedule',
            deliveryDate: delivery.deliveryDate || delivery.delivery_date || delivery.created_date || new Date().toISOString().split('T')[0],
            bookedDate: delivery.bookedDate || delivery.booked_date || delivery.created_date || new Date().toISOString().split('T')[0],
            additionalCosts: parseFloat(delivery.additionalCosts || delivery.additional_costs || 0),
            createdBy: delivery.createdBy || delivery.created_by || 'System',
            createdAt: delivery.createdAt || delivery.created_at || new Date().toISOString(),
            
            // Additional fields from Excel upload
            itemNumber: delivery.itemNumber || delivery.item_number || '',
            mobileNumber: delivery.mobileNumber || delivery.mobile_number || '',
            itemDescription: delivery.itemDescription || delivery.item_description || '',
            serialNumber: delivery.serialNumber || delivery.serial_number || '',
            
            // Display fields
            truck: delivery.truck || (delivery.truckType && delivery.truckPlateNumber ? 
                `${delivery.truckType} (${delivery.truckPlateNumber})` : 'N/A'),
            distance: delivery.distance || '',
            lastModified: delivery.lastModified || new Date().toISOString()
        };
        
        // Remove undefined values
        Object.keys(normalized).forEach(key => {
            if (normalized[key] === undefined) {
                delete normalized[key];
            }
        });
        
        return normalized;
    });
    
    console.log(`✅ Normalized ${window.activeDeliveries.length} deliveries`);
}

// =============================================================================
// 4. UNIFIED TABLE POPULATION
// =============================================================================

async function populateActiveDeliveriesTableUnified() {
    console.log('🔄 UNIFIED populateActiveDeliveriesTable called');
    
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
                <td colspan="14" class="text-center py-5">
                    <i class="bi bi-truck" style="font-size: 3rem; opacity: 0.3;"></i>
                    <h4 class="mt-3">No active deliveries found</h4>
                    <p class="text-muted">Try uploading an Excel file or creating a new booking</p>
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`📊 Displaying ${window.activeDeliveries.length} active deliveries`);
    
    // Generate table rows
    const tableRows = window.activeDeliveries.map((delivery, index) => {
        const statusInfo = getStatusInfo(delivery.status);
        const deliveryDate = delivery.deliveryDate || delivery.bookedDate || 'N/A';
        
        return `
            <tr data-delivery-id="${delivery.id}">
                <td>
                    <input type="checkbox" class="form-check-input delivery-checkbox" 
                           data-delivery-id="${delivery.id}">
                </td>
                <td><strong>${delivery.drNumber}</strong></td>
                <td>${delivery.customerName}</td>
                <td>${delivery.vendorNumber || 'N/A'}</td>
                <td><span class="badge bg-info">${delivery.origin}</span></td>
                <td>${delivery.destination}</td>
                <td>${delivery.truck || 'N/A'}</td>
                <td>
                    <div class="status-dropdown-container">
                        <span class="badge ${statusInfo.class} status-clickable" 
                              data-delivery-id="${delivery.id}" 
                              data-current-status="${delivery.status}"
                              onclick="event.stopPropagation(); toggleStatusDropdown('${delivery.id}')">
                            <i class="bi ${statusInfo.icon}"></i> ${delivery.status}
                            <i class="bi bi-chevron-down ms-1" style="font-size: 0.8em;"></i>
                        </span>
                        <div class="status-dropdown" id="statusDropdown-${delivery.id}" style="display: none;">
                            ${generateStatusOptions(delivery.status, delivery.id)}
                        </div>
                    </div>
                </td>
                <td>${deliveryDate}</td>
                <td>₱${delivery.additionalCosts.toFixed(2)}</td>
                <td>${delivery.itemNumber || ''}</td>
                <td>${delivery.mobileNumber || ''}</td>
                <td>${delivery.itemDescription || ''}</td>
                <td>${delivery.serialNumber || ''}</td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tableRows;
    
    // Update counter if exists
    const activeCount = document.getElementById('activeDeliveriesCount');
    if (activeCount) {
        activeCount.textContent = window.activeDeliveries.length.toString();
    }
    
    console.log('✅ UNIFIED table populated successfully');
}

// =============================================================================
// 5. UTILITY FUNCTIONS
// =============================================================================

function normalizeDeliveryArray(deliveries) {
    if (!Array.isArray(deliveries)) return [];
    
    return deliveries.map(delivery => {
        // Ensure consistent field names
        return {
            ...delivery,
            id: delivery.id || delivery.delivery_id || generateId(),
            drNumber: delivery.drNumber || delivery.dr_number,
            customerName: delivery.customerName || delivery.customer_name,
            vendorNumber: delivery.vendorNumber || delivery.vendor_number,
            truckType: delivery.truckType || delivery.truck_type,
            truckPlateNumber: delivery.truckPlateNumber || delivery.truck_plate_number,
            additionalCosts: delivery.additionalCosts || delivery.additional_costs || 0,
            createdBy: delivery.createdBy || delivery.created_by,
            createdAt: delivery.createdAt || delivery.created_at
        };
    });
}

function generateId() {
    return 'delivery_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getStatusInfo(status) {
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

function generateStatusOptions(currentStatus, deliveryId) {
    const statuses = ['On Schedule', 'In Transit', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'];
    
    return statuses.map(status => {
        const isCurrent = status === currentStatus;
        return `
            <div class="status-option ${isCurrent ? 'current' : ''}" 
                 onclick="changeDeliveryStatus('${deliveryId}', '${status}')">
                ${status}
            </div>
        `;
    }).join('');
}

// =============================================================================
// 6. EXCEL UPLOAD INTEGRATION FIX
// =============================================================================

// Override the confirmDRUpload function to ensure proper data flow
const originalConfirmDRUpload = window.confirmDRUpload;

window.confirmDRUpload = async function() {
    console.log('🔧 ENHANCED confirmDRUpload called');
    
    try {
        // Call original function
        if (originalConfirmDRUpload) {
            await originalConfirmDRUpload();
        }
        
        // Enhanced refresh sequence
        console.log('🔄 Enhanced refresh sequence starting...');
        
        // Step 1: Force data reload from source
        await loadActiveDeliveriesFromSource(true);
        
        // Step 2: Normalize data
        normalizeActiveDeliveriesData();
        
        // Step 3: Populate table
        await populateActiveDeliveriesTableUnified();
        
        // Step 4: Switch to Active Deliveries view
        if (typeof window.switchToActiveDeliveriesView === 'function') {
            setTimeout(() => {
                window.switchToActiveDeliveriesView();
                console.log('✅ Switched to Active Deliveries view');
            }, 500);
        }
        
        console.log('✅ Enhanced confirmDRUpload completed');
        
    } catch (error) {
        console.error('❌ Error in enhanced confirmDRUpload:', error);
    }
};

// =============================================================================
// 7. STATUS DROPDOWN FUNCTIONS
// =============================================================================

window.toggleStatusDropdown = function(deliveryId) {
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

window.changeDeliveryStatus = function(deliveryId, newStatus) {
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
    populateActiveDeliveriesTableUnified();
    
    // Close dropdown
    const dropdown = document.getElementById(`statusDropdown-${deliveryId}`);
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    console.log('✅ Status changed successfully');
};

// =============================================================================
// 8. INITIALIZATION
// =============================================================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Active Deliveries Display Fix initialized');
    
    // Ensure arrays exist
    if (!window.activeDeliveries) {
        window.activeDeliveries = [];
    }
    
    // Load initial data
    setTimeout(() => {
        window.loadActiveDeliveries();
    }, 1000);
});

console.log('✅ Active Deliveries Display Fix loaded successfully');
