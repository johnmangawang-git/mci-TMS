/**
 * CONFLICT RESOLUTION FIX
 * Resolves conflicts between multiple loadActiveDeliveries functions
 * and ensures proper data flow
 */

console.log('🔧 Loading Conflict Resolution Fix...');

// =============================================================================
// 1. DISABLE CONFLICTING FUNCTIONS
// =============================================================================

// Disable data persistence fix that blocks reloads
if (window.pendingStatusChanges) {
    window.pendingStatusChanges.clear();
    console.log('🔧 Cleared pending status changes');
}

// Disable ultimate status fix that blocks reloads
window.statusUpdateInProgress = false;
window.lastStatusUpdate = null;
console.log('🔧 Disabled status update blocking');

// =============================================================================
// 2. UNIFIED FUNCTION OVERRIDES
// =============================================================================

// Override all conflicting loadActiveDeliveries functions
const conflictingFunctions = [
    'loadActiveDeliveries',
    'minimalLoadActiveDeliveries',
    'enhancedLoadActiveDeliveries'
];

conflictingFunctions.forEach(funcName => {
    if (window[funcName]) {
        console.log(`🔧 Disabling conflicting function: ${funcName}`);
        // Store original before disabling
        window[`original${funcName}Conflict`] = window[funcName];
        window[funcName] = null;
    }
});

// =============================================================================
// 3. CLEAN DATA LOADING
// =============================================================================

window.loadActiveDeliveries = async function(forceReload = false) {
    console.log('🔄 CLEAN loadActiveDeliveries called - forceReload:', forceReload);
    
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
                await populateActiveDeliveriesTableClean();
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
                await populateActiveDeliveriesTableClean();
                return;
            }
        }
        
        // Step 3: Initialize empty
        window.activeDeliveries = [];
        await populateActiveDeliveriesTableClean();
        
    } catch (error) {
        console.error('❌ Error in CLEAN loadActiveDeliveries:', error);
        
        // Fallback: try to display existing data
        if (window.activeDeliveries && window.activeDeliveries.length > 0) {
            await populateActiveDeliveriesTableClean();
        }
    }
};

// =============================================================================
// 4. CLEAN TABLE POPULATION
// =============================================================================

async function populateActiveDeliveriesTableClean() {
    console.log('🔄 CLEAN populateActiveDeliveriesTable called');
    
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
        const statusInfo = getStatusInfo(status);
        
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
                              onclick="event.stopPropagation(); toggleStatusDropdown('${delivery.id}')">
                            <i class="bi ${statusInfo.icon}"></i> ${status}
                            <i class="bi bi-chevron-down ms-1" style="font-size: 0.8em;"></i>
                        </span>
                        <div class="status-dropdown" id="statusDropdown-${delivery.id}" style="display: none;">
                            ${generateStatusOptions(status, delivery.id)}
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
    
    console.log('✅ CLEAN table populated successfully');
}

// =============================================================================
// 5. UTILITY FUNCTIONS
// =============================================================================

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
// 6. STATUS MANAGEMENT
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
    populateActiveDeliveriesTableClean();
    
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
    console.log('🔧 Conflict Resolution Fix initialized');
    
    // Ensure arrays exist
    if (!window.activeDeliveries) {
        window.activeDeliveries = [];
    }
    
    // Load initial data
    setTimeout(() => {
        window.loadActiveDeliveries();
    }, 1000);
});

console.log('✅ Conflict Resolution Fix loaded successfully');
