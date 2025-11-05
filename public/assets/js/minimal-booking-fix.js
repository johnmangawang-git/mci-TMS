// Minimal Booking System Fix
// This creates the essential functions needed for booking to work

console.log('Loading minimal booking fix...');

// Initialize global arrays
if (typeof window.activeDeliveries === 'undefined') {
    window.activeDeliveries = [];
    console.log('✅ Initialized window.activeDeliveries');
}

if (typeof window.deliveryHistory === 'undefined') {
    window.deliveryHistory = [];
    console.log('✅ Initialized window.deliveryHistory');
}

// Load existing data from localStorage
try {
    const savedActive = localStorage.getItem('mci-active-deliveries');
    if (savedActive) {
        window.activeDeliveries = JSON.parse(savedActive);
        console.log(`✅ Loaded ${window.activeDeliveries.length} active deliveries from localStorage`);
    }
    
    const savedHistory = localStorage.getItem('mci-delivery-history');
    if (savedHistory) {
        window.deliveryHistory = JSON.parse(savedHistory);
        console.log(`✅ Loaded ${window.deliveryHistory.length} delivery history from localStorage`);
    }
} catch (error) {
    console.error('Error loading from localStorage:', error);
}

// Use the main saveBooking function from booking.js that properly saves to Supabase

// Minimal loadActiveDeliveries function
window.minimalLoadActiveDeliveries = function() {
    console.log('🔄 Minimal loadActiveDeliveries called');
    
    try {
        const tableBody = document.getElementById('activeDeliveriesTableBody');
        if (!tableBody) {
            console.log('⚠️ activeDeliveriesTableBody not found');
            return;
        }
        
        console.log(`📊 Loading ${window.activeDeliveries.length} deliveries`);
        
        if (window.activeDeliveries.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-5">
                        <i class="bi bi-truck" style="font-size: 3rem; opacity: 0.3;"></i>
                        <h4 class="mt-3">No active deliveries found</h4>
                        <p class="text-muted">Create a booking to see it here</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Generate table rows with clickable status dropdown using field mapper
        tableBody.innerHTML = window.activeDeliveries.map(delivery => {
            const statusInfo = getStatusInfo(delivery.status);
            
            // Use global field mapper for consistent field access
            const getField = window.getFieldValue || ((obj, field) => obj[field]);
            
            const drNumber = getField(delivery, 'drNumber') || getField(delivery, 'dr_number') || 'N/A';
            const customerName = getField(delivery, 'customerName') || getField(delivery, 'customer_name') || 'N/A';
            const vendorNumber = getField(delivery, 'vendorNumber') || getField(delivery, 'vendor_number') || 'N/A';
            const origin = getField(delivery, 'origin') || 'N/A';
            const destination = getField(delivery, 'destination') || 'N/A';
            
            const truckType = getField(delivery, 'truckType') || getField(delivery, 'truck_type') || '';
            const truckPlate = getField(delivery, 'truckPlateNumber') || getField(delivery, 'truck_plate_number') || '';
            const truckInfo = (truckType && truckPlate) ? `${truckType} (${truckPlate})` : (truckPlate || 'N/A');
            
            const deliveryDate = getField(delivery, 'deliveryDate') || getField(delivery, 'created_date') || 
                               getField(delivery, 'timestamp') || getField(delivery, 'created_at') || 'N/A';
            
            return `
                <tr>
                    <td><input type="checkbox" class="form-check-input delivery-checkbox" data-delivery-id="${delivery.id}"></td>
                    <td><strong>${drNumber}</strong></td>
                    <td>${customerName}</td>
                    <td>${vendorNumber}</td>
                    <td>${origin}</td>
                    <td>${destination}</td>
                    <td>${truckInfo}</td>
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
                </tr>
            `;
        }).join('');
        
        console.log('✅ Table populated successfully');
        
    } catch (error) {
        console.error('❌ Error in minimal loadActiveDeliveries:', error);
    }
};

// Enhanced loadActiveDeliveries that works with existing data
window.loadActiveDeliveries = async function() {
    console.log('🔄 Enhanced loadActiveDeliveries called');
    
    // Ensure Supabase is initialized
    if (typeof window.initSupabase === 'function') {
        console.log('🔧 Initializing Supabase client...');
        window.initSupabase();
    }
    
    // SUPABASE FIRST: Central database is the source of truth
    try {
        // Load from Supabase first (central database)
        if (window.dataService && typeof window.dataService.getDeliveries === 'function') {
            console.log('🔧 Attempting to load deliveries from Supabase...');
            const deliveries = await window.dataService.getDeliveries();
            console.log('🔧 Supabase response:', deliveries);
            
            if (deliveries && deliveries.length > 0) {
                // Normalize field names using global field mapper
                const normalizedDeliveries = window.normalizeDeliveryArray ? 
                    window.normalizeDeliveryArray(deliveries) : deliveries;
                
                window.activeDeliveries = normalizedDeliveries.filter(d => d.status !== 'Completed');
                console.log(`📊 Loaded ${window.activeDeliveries.length} deliveries from Supabase (central database)`);
                return;
            } else {
                console.log('📊 Supabase returned empty, checking localStorage...');
            }
        } else {
            console.log('📊 DataService not available, using localStorage...');
        }
        
        // Fallback to localStorage only if Supabase fails or is empty
        const saved = localStorage.getItem('mci-active-deliveries');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) {
                // Normalize localStorage data
                const normalizedParsed = window.normalizeDeliveryArray ? 
                    window.normalizeDeliveryArray(parsed) : parsed;
                
                window.activeDeliveries = normalizedParsed;
                console.log(`📊 Loaded ${parsed.length} deliveries from localStorage (fallback)`);
            }
        }
    } catch (error) {
        console.error('Error in enhanced loadActiveDeliveries:', error);
    }
    
    // Filter out only truly completed items (not Pending)
    const activeItems = window.activeDeliveries.filter(d => 
        d.status !== 'Completed' && d.status !== 'Signed'
    );
    
    console.log(`📊 Showing ${activeItems.length} active items from ${window.activeDeliveries.length} total`);
    
    // Use filtered items for display but don't modify the original array
    const displayArray = window.activeDeliveries;
    window.activeDeliveries = activeItems;
    
    // Call minimal version
    window.minimalLoadActiveDeliveries();
    
    // Restore original array
    window.activeDeliveries = displayArray;
    
    // Save back to localStorage to ensure persistence
    localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
};

// Set up confirm booking button
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Setting up minimal booking fix...');
    
    setTimeout(() => {
        const confirmBtn = document.getElementById('confirmBookingBtn');
        if (confirmBtn) {
            // Remove existing listeners
            const newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
            
            // Add new listener - use main saveBooking function that saves to Supabase
            newBtn.addEventListener('click', async function() {
                console.log('🔘 Confirm booking clicked (using main saveBooking with Supabase)');
                if (typeof window.saveBooking === 'function') {
                    await window.saveBooking();
                } else {
                    console.error('❌ Main saveBooking function not available');
                }
            });
            
            console.log('✅ Confirm booking button set up');
        } else {
            console.log('⚠️ Confirm booking button not found');
        }
        
        // Try to load existing deliveries
        window.loadActiveDeliveries();
        
    }, 2000);
});

// Status dropdown functions
function getStatusInfo(status) {
    switch (status) {
        case 'In Transit':
            return { class: 'bg-warning', icon: 'bi-truck' };
        case 'On Schedule':
            return { class: 'bg-success', icon: 'bi-check-circle' };
        case 'Delayed':
            return { class: 'bg-danger', icon: 'bi-exclamation-triangle' };
        case 'Completed':
            return { class: 'bg-success', icon: 'bi-check-circle-fill' };
        case 'Signed':
            return { class: 'bg-primary', icon: 'bi-pen-fill' };
        default:
            return { class: 'bg-secondary', icon: 'bi-question-circle' };
    }
}

function generateStatusOptions(currentStatus, deliveryId) {
    const availableStatuses = ['In Transit', 'On Schedule', 'Delayed'];
    
    // Don't allow changing from Completed or Signed status
    if (currentStatus === 'Completed' || currentStatus === 'Signed') {
        return '<div class="status-option disabled">Status cannot be changed</div>';
    }
    
    return availableStatuses.map(status => {
        const isSelected = status === currentStatus ? 'selected' : '';
        const statusInfo = getStatusInfo(status);
        return `
            <div class="status-option ${isSelected}" 
                 onclick="event.stopPropagation(); updateDeliveryStatusById('${deliveryId}', '${status}')">
                <i class="bi ${statusInfo.icon}"></i> ${status}
            </div>
        `;
    }).join('');
}

function toggleStatusDropdown(deliveryId) {
    // Close all other dropdowns first
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
}

// Status update function now handled by ultimate-status-fix.js
// Removed conflicting updateDeliveryStatusById function

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.status-dropdown-container')) {
        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }
});

// SENIOR QA FIX: Override all conflicting e-signature implementations
console.log('🔧 SENIOR QA: Applying comprehensive e-signature fix...');

// Force override showESignatureModal to prevent conflicts
window.showESignatureModal = function(drNumber) {
    console.log(`🖊️ SENIOR QA: E-Signature modal requested for DR: ${drNumber}`);
    
    // Use the robust signature pad if available
    if (typeof window.openRobustSignaturePad === 'function') {
        // Try to get delivery data
        let customerName = '';
        let customerContact = '';
        let truckPlate = '';
        let deliveryRoute = '';
        
        // Find delivery in activeDeliveries
        if (window.activeDeliveries) {
            const delivery = window.activeDeliveries.find(d => d.drNumber === drNumber);
            if (delivery) {
                customerName = delivery.customerName || '';
                customerContact = delivery.vendorNumber || '';
                truckPlate = delivery.truckPlateNumber || '';
                deliveryRoute = `${delivery.origin || ''} to ${delivery.destination || ''}`;
                console.log(`🖊️ SENIOR QA: Found delivery data for ${drNumber}`);
            } else {
                console.log(`⚠️ SENIOR QA: No delivery data found for ${drNumber}`);
            }
        }
        
        console.log(`🖊️ SENIOR QA: Opening signature pad for ${drNumber}`);
        window.openRobustSignaturePad(drNumber, customerName, customerContact, truckPlate, deliveryRoute);
    } else {
        console.error('❌ SENIOR QA: openRobustSignaturePad function not available');
        console.log('Available functions:', Object.keys(window).filter(key => key.includes('signature') || key.includes('Signature')));
        alert('E-signature functionality is not available. Please refresh the page and try again.');
    }
};

// SENIOR QA FIX: Aggressive button override to prevent conflicts
function setupESignatureButtonOverride() {
    console.log('🔧 SENIOR QA: Setting up e-signature button override...');
    
    const eSignatureBtn = document.getElementById('eSignatureBtn');
    if (!eSignatureBtn) {
        console.log('⚠️ SENIOR QA: E-Signature button not found');
        return;
    }
    
    // CRITICAL FIX: Force enable the button (it starts disabled in HTML)
    eSignatureBtn.disabled = false;
    console.log('🔓 SENIOR QA: Force enabled e-signature button');
    
    // Remove ALL existing event listeners by cloning
    const newBtn = eSignatureBtn.cloneNode(true);
    eSignatureBtn.parentNode.replaceChild(newBtn, eSignatureBtn);
    
    // CRITICAL FIX: Ensure new button is also enabled
    newBtn.disabled = false;
    newBtn.style.opacity = '1';
    newBtn.style.pointerEvents = 'auto';
    
    // Add our definitive event listener
    newBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('🖊️ SENIOR QA: E-Signature button clicked (override)');
        
        // Get selected deliveries using multiple selectors to catch all checkboxes
        let selectedCheckboxes = document.querySelectorAll('.delivery-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            selectedCheckboxes = document.querySelectorAll('input.delivery-checkbox:checked');
        }
        if (selectedCheckboxes.length === 0) {
            selectedCheckboxes = document.querySelectorAll('#activeDeliveriesTableBody input:checked');
        }
        
        console.log(`🔍 SENIOR QA: Found ${selectedCheckboxes.length} selected deliveries`);
        
        if (selectedCheckboxes.length === 0) {
            alert('Please select a delivery for E-Signature');
            return;
        }
        
        if (selectedCheckboxes.length > 1) {
            alert('Please select only one delivery for E-Signature');
            return;
        }
        
        // Get the delivery ID and find the DR number
        const deliveryId = selectedCheckboxes[0].getAttribute('data-delivery-id');
        console.log(`🔍 SENIOR QA: Selected delivery ID: ${deliveryId}`);
        
        const delivery = window.activeDeliveries.find(d => d.id === deliveryId);
        
        if (delivery) {
            console.log(`✅ SENIOR QA: Found delivery: ${delivery.drNumber}`);
            window.showESignatureModal(delivery.drNumber);
        } else {
            console.error(`❌ SENIOR QA: Could not find delivery with ID: ${deliveryId}`);
            console.log('Available deliveries:', window.activeDeliveries.map(d => ({id: d.id, drNumber: d.drNumber})));
            alert('Could not find delivery data. Please try again.');
        }
    });
    
    // SENIOR QA FIX: Override any attempts to disable the button
    const originalDisabledSetter = Object.getOwnPropertyDescriptor(HTMLButtonElement.prototype, 'disabled').set;
    Object.defineProperty(newBtn, 'disabled', {
        set: function(value) {
            console.log(`🛡️ SENIOR QA: Attempt to set button disabled to ${value} - BLOCKED`);
            // Always keep it enabled
            originalDisabledSetter.call(this, false);
        },
        get: function() {
            return false; // Always report as enabled
        }
    });
    
    console.log('✅ SENIOR QA: E-Signature button override complete with anti-disable protection');
}

// SENIOR QA FIX: Checkbox monitoring to keep button enabled
function monitorCheckboxes() {
    const checkboxes = document.querySelectorAll('.delivery-checkbox, input.delivery-checkbox, #activeDeliveriesTableBody input[type="checkbox"]');
    console.log(`🔍 SENIOR QA: Found ${checkboxes.length} checkboxes to monitor`);
    
    checkboxes.forEach((checkbox, index) => {
        console.log(`🔍 SENIOR QA: Setting up checkbox ${index} with data-delivery-id: ${checkbox.getAttribute('data-delivery-id')}`);
        
        checkbox.addEventListener('change', function(event) {
            event.stopPropagation(); // Prevent event bubbling
            
            const eSignatureBtn = document.getElementById('eSignatureBtn');
            if (eSignatureBtn) {
                // FORCE ENABLE regardless of selection
                eSignatureBtn.disabled = false;
                console.log(`🔓 SENIOR QA: Checkbox ${this.getAttribute('data-delivery-id')} changed, keeping e-signature button enabled`);
            }
            
            // CRITICAL: Prevent any table refresh that might be triggered by checkbox change
            console.log('🛡️ SENIOR QA: Checkbox change handled, preventing unwanted refreshes');
        });
    });
}

// SENIOR QA FIX: Table refresh handling (now handled by ultimate-status-fix.js)
// Removed conflicting originalLoadActiveDeliveries declaration

// SENIOR QA FIX: Periodic button enabler
function keepButtonEnabled() {
    const eSignatureBtn = document.getElementById('eSignatureBtn');
    if (eSignatureBtn && eSignatureBtn.disabled) {
        eSignatureBtn.disabled = false;
        console.log('🔓 SENIOR QA: Periodic re-enable of e-signature button');
    }
}

// SENIOR QA FIX: Multiple setup attempts to ensure it works
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 SENIOR QA: DOM loaded, setting up e-signature...');
    
    // Immediate setup
    setTimeout(setupESignatureButtonOverride, 1000);
    setTimeout(monitorCheckboxes, 1500);
    
    // Delayed setup to override other scripts
    setTimeout(setupESignatureButtonOverride, 3000);
    setTimeout(monitorCheckboxes, 3500);
    
    // Final setup to ensure it works
    setTimeout(setupESignatureButtonOverride, 5000);
    setTimeout(monitorCheckboxes, 5500);
    
    // Periodic enabler every 2 seconds
    setInterval(keepButtonEnabled, 2000);
});

// SENIOR QA FIX: Also setup when window loads
window.addEventListener('load', function() {
    console.log('🔧 SENIOR QA: Window loaded, final e-signature setup...');
    setTimeout(setupESignatureButtonOverride, 1000);
    setTimeout(monitorCheckboxes, 1500);
});

// Export functions globally (updateDeliveryStatusById now handled by ultimate-status-fix.js)
window.getStatusInfo = getStatusInfo;
window.generateStatusOptions = generateStatusOptions;
window.toggleStatusDropdown = toggleStatusDropdown;
// window.updateDeliveryStatusById = updateDeliveryStatusById; // Handled by ultimate fix

console.log('✅ Minimal booking fix loaded successfully with status dropdown functionality');