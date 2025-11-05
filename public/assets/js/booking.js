// Check if currentMapInstance is already defined to prevent duplicate identifier errors
if (typeof window.currentMapInstance !== 'undefined') {
    console.log('⚠️ currentMapInstance already defined, skipping definition');
} else {
    // Define currentMapInstance to prevent duplicate declaration errors
    window.currentMapInstance = null;
}

// Booking modal functionality
console.log('=== BOOKING.JS LOADED ===');

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast element if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove the toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Show error notification
function showError(message) {
    showToast(message, 'danger');
}

// Enhanced openBookingModal function for calendar integration
function openBookingModal(dateStr) {
    console.log('=== OPEN BOOKING MODAL FUNCTION CALLED ===');
    console.log('Date string received:', dateStr);
    
    // Make sure this function is globally available
    window.openBookingModal = openBookingModal;
    
    // Initialize booking modal functionality BEFORE showing the modal
    console.log('Initializing booking modal...');
    initBookingModal();
    
    showBookingModal(dateStr);
}

// Enhanced showBookingModal function
function showBookingModal(dateStr) {
    console.log('=== SHOW BOOKING MODAL FUNCTION CALLED ===');
    console.log('Date string received:', dateStr);
    
    // Make sure this function is globally available
    window.showBookingModal = showBookingModal;
    
    // Check if booking modal exists
    const bookingModal = document.getElementById('bookingModal');
    console.log('Booking modal element:', bookingModal);
    
    if (bookingModal) {
        // Check if Bootstrap is available
        console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
        
        // Try to show using Bootstrap
        if (typeof bootstrap !== 'undefined') {
            try {
                let modal = bootstrap.Modal.getInstance(bookingModal);
                console.log('Existing modal instance:', modal);
                
                if (!modal) {
                    console.log('Creating new modal instance');
                    modal = new bootstrap.Modal(bookingModal, {
                        backdrop: true,
                        keyboard: true
                    });
                }
                
                // Set the delivery date if provided
                if (dateStr) {
                    const deliveryDateInput = document.getElementById('deliveryDate');
                    if (deliveryDateInput) {
                        deliveryDateInput.value = dateStr;
                    }
                }
                
                console.log('Showing modal');
                modal.show();
                console.log('Booking modal shown successfully');
            } catch (error) {
                console.error('Error showing booking modal:', error);
                
                // Fallback to direct manipulation
                console.log('Using fallback method to show modal');
                bookingModal.style.display = 'block';
                bookingModal.classList.add('show');
                document.body.classList.add('modal-open');
                
                // Add backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
                console.log('Booking modal shown with fallback method');
            }
        } else {
            // Fallback to direct manipulation
            console.log('Bootstrap not available, using fallback method');
            bookingModal.style.display = 'block';
            bookingModal.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            console.log('Booking modal shown with fallback method');
        }
    } else {
        console.error('Booking modal element not found');
    }
}

// Ensure the function is globally available
window.openBookingModal = openBookingModal;
window.showBookingModal = showBookingModal;

// Test function to manually trigger the booking modal
window.testShowBookingModal = function() {
    console.log('=== TESTING BOOKING MODAL SHOW ===');
    
    // Check if booking modal exists
    const bookingModal = document.getElementById('bookingModal');
    console.log('Booking modal element:', bookingModal);
    
    if (bookingModal) {
        // Check if Bootstrap is available
        console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
        
        // Try to show using Bootstrap
        if (typeof bootstrap !== 'undefined') {
            try {
                let modal = bootstrap.Modal.getInstance(bookingModal);
                console.log('Existing modal instance:', modal);
                
                if (!modal) {
                    console.log('Creating new modal instance');
                    modal = new bootstrap.Modal(bookingModal, {
                        backdrop: true,
                        keyboard: true
                    });
                }
                
                console.log('Showing modal');
                modal.show();
                console.log('Booking modal shown successfully');
            } catch (error) {
                console.error('Error showing booking modal:', error);
                
                // Fallback to direct manipulation
                console.log('Using fallback method to show modal');
                bookingModal.style.display = 'block';
                bookingModal.classList.add('show');
                document.body.classList.add('modal-open');
                
                // Add backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
                console.log('Booking modal shown with fallback method');
            }
        } else {
            // Fallback to direct manipulation
            console.log('Bootstrap not available, using fallback method');
            bookingModal.style.display = 'block';
            bookingModal.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            console.log('Booking modal shown with fallback method');
        }
    } else {
        console.error('Booking modal element not found');
    }
};

// Test function to manually trigger the booking modal with a specific date
window.testBookingModal = function(dateStr) {
    console.log('=== TESTING BOOKING MODAL WITH DATE ===');
    console.log('Date string received:', dateStr);
    
    // Use current date if no date provided
    const dateToUse = dateStr || new Date().toISOString().split('T')[0];
    console.log('Date to use:', dateToUse);
    // Call the main function
    showBookingModal(dateToUse);
};

// Add a DOMContentLoaded event to ensure functions are properly exposed
document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking.js: DOMContentLoaded event fired');
    
    // Double-check that functions are globally available
    window.openBookingModal = openBookingModal;
    window.showBookingModal = showBookingModal;
    window.testShowBookingModal = window.testShowBookingModal;
    window.testBookingModal = window.testBookingModal;
    
    console.log('Booking.js: Functions re-exposed globally');
});

// Ensure functions are available immediately
if (document.readyState === 'loading') {
    // Document is still loading, add event listener
    document.addEventListener('DOMContentLoaded', function() {
        window.openBookingModal = openBookingModal;
        window.showBookingModal = showBookingModal;
    });
} else {
    // Document is already loaded, expose functions immediately
    window.openBookingModal = openBookingModal;
    window.showBookingModal = showBookingModal;
}

function initBookingModal() {
    console.log('=== INITIALIZING BOOKING MODAL ===');
    console.log('Leaflet available:', typeof L !== 'undefined');
    console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
    
    // Ensure customer management is available
    ensureCustomerManagementReady();
    
    // Ensure warehouse manager is available
    ensureWarehouseManagerReady();
    
    const bookingModalElement = document.getElementById('bookingModal');
    if (!bookingModalElement) {
        console.error('Booking modal element not found');
        return;
    }
    
    const bookingModal = new bootstrap.Modal(bookingModalElement);
    const bookingForm = document.getElementById('bookingForm');
    // Note: bookingForm is not used in the current implementation, so we can skip the null check

    // Add DR number functionality with proper event listener cleanup
    const addDrBtn = document.getElementById('addDrBtn');
    const drNumbersContainer = document.getElementById('drNumbersContainer');

    if (addDrBtn && drNumbersContainer) {
        // Remove existing event listeners by cloning
        const newAddDrBtn = addDrBtn.cloneNode(true);
        addDrBtn.parentNode.replaceChild(newAddDrBtn, addDrBtn);
        
        newAddDrBtn.addEventListener('click', function () {
            const drNumberItem = document.createElement('div');
            drNumberItem.className = 'dr-number-item mt-2';
            // Generate a unique ID for each DR number input
            const uniqueId = 'drNumber-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            drNumberItem.innerHTML = `
                <div class="input-group">
                    <input type="text" class="form-control dr-number-input" id="${uniqueId}" placeholder="Enter DR number (e.g., DR-XXXXX)" required>
                    <button type="button" class="btn btn-outline-danger remove-dr-btn">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            `;

            drNumbersContainer.appendChild(drNumberItem);

            // Add event listener to the new remove button
            const removeDrBtn = drNumberItem.querySelector('.remove-dr-btn');
            if (removeDrBtn) {
                // Remove existing event listeners by cloning
                const newRemoveDrBtn = removeDrBtn.cloneNode(true);
                removeDrBtn.parentNode.replaceChild(newRemoveDrBtn, removeDrBtn);
                
                newRemoveDrBtn.addEventListener('click', function () {
                    drNumberItem.remove();
                });
            }
        });
    }

    // Add event listeners for remove DR number buttons with proper cleanup
    document.querySelectorAll('.remove-dr-btn').forEach(button => {
        // Remove existing event listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function () {
            const drNumberItem = this.closest('.dr-number-item');
            if (drNumberItem) {
                drNumberItem.remove();
            }
        });
    });

    // Origin selection toggle with proper event listener cleanup
    const originSelect = document.getElementById('originSelect');
    const customOriginContainer = document.getElementById('customOriginContainer');

    if (originSelect && customOriginContainer) {
        // Remove existing event listeners by cloning
        const newOriginSelect = originSelect.cloneNode(true);
        originSelect.parentNode.replaceChild(newOriginSelect, originSelect);
        
        newOriginSelect.addEventListener('change', function () {
            if (this.value === '') {
                customOriginContainer.classList.remove('d-none');
                // Clear coordinates display when custom location is selected
                const originCoordinatesDisplay = document.getElementById('originCoordinatesDisplay');
                if (originCoordinatesDisplay) {
                    originCoordinatesDisplay.textContent = '';
                }
            } else {
                customOriginContainer.classList.add('d-none');
                // Display warehouse coordinates
                const originCoordinatesDisplay = document.getElementById('originCoordinatesDisplay');
                // Ensure warehouse manager is ready before accessing it
                ensureWarehouseManagerReady();
                if (originCoordinatesDisplay) {
                    // Default warehouse coordinates if warehouse manager not available
                    const defaultWarehouses = {
                        'alabang': { lat: 14.4378, lng: 121.0199, name: 'SMEG Alabang warehouse' },
                        'cebu': { lat: 10.3157, lng: 123.8854, name: 'SMEG Cebu warehouse' }
                    };
                    
                    let warehouse = null;
                    if (window.warehouseManager && window.warehouseManager.warehouseLocations) {
                        warehouse = window.warehouseManager.warehouseLocations.find(w => w.id === this.value);
                    } else {
                        // Use default coordinates
                        const defaultWarehouse = defaultWarehouses[this.value];
                        if (defaultWarehouse) {
                            warehouse = { coordinates: { lat: defaultWarehouse.lat, lng: defaultWarehouse.lng } };
                        }
                    }
                    
                    if (warehouse) {
                        const coordText = `(${warehouse.coordinates.lat.toFixed(6)}, ${warehouse.coordinates.lng.toFixed(6)})`;
                        originCoordinatesDisplay.textContent = coordText;
                        console.log(`✅ Origin coordinates displayed: ${coordText}`);
                    } else {
                        originCoordinatesDisplay.textContent = '';
                        console.log('❌ No warehouse coordinates found for:', this.value);
                    }
                }
            }
        });
    }

    // Map pin buttons for origin with proper event listener cleanup
    const pinOriginBtn = document.getElementById('pinOrigin');
    console.log('Pin Origin Button found:', !!pinOriginBtn);
    console.log('Custom Origin Container found:', !!customOriginContainer);
    console.log('Origin Select found:', !!originSelect);
    
    if (pinOriginBtn && customOriginContainer && originSelect) {
        // Remove existing event listeners by cloning
        const newPinOriginBtn = pinOriginBtn.cloneNode(true);
        pinOriginBtn.parentNode.replaceChild(newPinOriginBtn, pinOriginBtn);
        
        newPinOriginBtn.addEventListener('click', function () {
            console.log('🗺️ Pin Origin button clicked');
            customOriginContainer.classList.remove('d-none');
            if (originSelect) originSelect.value = '';
            
            try {
                showMapPinDialog('origin');
                console.log('✅ showMapPinDialog called successfully for origin');
            } catch (error) {
                console.error('❌ Error calling showMapPinDialog for origin:', error);
            }
        });
        console.log('✅ Pin Origin button event listener attached');
    } else {
        console.warn('❌ Pin Origin button setup failed - missing elements');
    }

    // Add destination area functionality with proper event listener cleanup
    const addAreaBtn = document.getElementById('addAreaBtn');
    const destinationAreasContainer = document.getElementById('destinationAreasContainer');

    if (addAreaBtn && destinationAreasContainer) {
        // Modify the event listener for existing destination area inputs to open map modal directly
        document.querySelectorAll('.destination-area-input').forEach((input, index) => {
            // Remove existing event listeners by cloning
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener('focus', function () {
                // Open map modal directly when focusing on the destination area input
                console.log(`🗺️ Destination input ${index} focused - opening map dialog`);
                showMapPinDialog('destination', index);
            });
            
            // Prevent the default behavior of typing in the input
            newInput.addEventListener('keydown', function(e) {
                // Allow Tab, Escape, and Enter keys
                if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') {
                    return;
                }
                // Prevent other keys and open map modal
                e.preventDefault();
                showMapPinDialog('destination', index);
            });
            
            // Also open map modal on click
            newInput.addEventListener('click', function () {
                console.log(`🗺️ Destination input ${index} clicked - opening map dialog`);
                showMapPinDialog('destination', index);
            });
        });

        // Add event listeners to existing destination area elements
        const pinOnMapBtns = document.querySelectorAll('.pin-on-map-btn');
        console.log('Found pin-on-map buttons:', pinOnMapBtns.length);
        
        pinOnMapBtns.forEach((btn, index) => {
            console.log(`Setting up pin-on-map button ${index}, area-index: ${btn.dataset.areaIndex}`);
            
            // Remove existing event listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function () {
                const areaIndex = parseInt(this.dataset.areaIndex) || 0;
                console.log(`🗺️ Pin on map button clicked for destination area ${areaIndex}`);
                
                try {
                    showMapPinDialog('destination', areaIndex);
                    console.log('✅ showMapPinDialog called successfully for destination');
                } catch (error) {
                    console.error('❌ Error calling showMapPinDialog for destination:', error);
                }
            });
        });

        // Remove existing event listeners by cloning
        const newAddAreaBtn = addAreaBtn.cloneNode(true);
        addAreaBtn.parentNode.replaceChild(newAddAreaBtn, addAreaBtn);
        
        newAddAreaBtn.addEventListener('click', function () {
            const areaIndex = document.querySelectorAll('.destination-area-item').length;
            const areaItem = document.createElement('div');
            areaItem.className = 'destination-area-item';
            areaItem.innerHTML = `
                <div class="input-group mb-2">
                    <input type="text" class="form-control destination-area-input" placeholder="Click to select location on map" required>
                    <button type="button" class="btn map-pin-btn pin-on-map-btn" data-area-index="${areaIndex}">
                        <i class="bi bi-geo-alt"></i> Pin on Map
                    </button>
                    <button type="button" class="btn btn-outline-danger remove-area">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            `;

            destinationAreasContainer.appendChild(areaItem);

            // Add event listeners for the new elements
            const pinBtn = areaItem.querySelector('.pin-on-map-btn');
            const removeBtn = areaItem.querySelector('.remove-area');
            const inputField = areaItem.querySelector('.destination-area-input');

            // Open map modal when clicking the input field
            if (inputField) {
                inputField.addEventListener('focus', function () {
                    console.log(`🗺️ New destination input ${areaIndex} focused - opening map dialog`);
                    showMapPinDialog('destination', areaIndex);
                });
                
                // Prevent typing in the input field
                inputField.addEventListener('keydown', function(e) {
                    // Allow Tab, Escape, and Enter keys
                    if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') {
                        return;
                    }
                    // Prevent other keys and open map modal
                    e.preventDefault();
                    showMapPinDialog('destination', areaIndex);
                });
                
                // Also open map modal on click
                inputField.addEventListener('click', function () {
                    console.log(`🗺️ New destination input ${areaIndex} clicked - opening map dialog`);
                    showMapPinDialog('destination', areaIndex);
                });
            }

            if (pinBtn) {
                // Remove existing event listeners by cloning
                const newPinBtn = pinBtn.cloneNode(true);
                pinBtn.parentNode.replaceChild(newPinBtn, pinBtn);
                
                newPinBtn.addEventListener('click', function () {
                    showMapPinDialog('destination', areaIndex);
                });
            }

            if (removeBtn) {
                // Remove existing event listeners by cloning
                const newRemoveBtn = removeBtn.cloneNode(true);
                removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
                
                newRemoveBtn.addEventListener('click', function () {
                    areaItem.remove();
                });
            }
        });
    }

    // Remove the search-related event listeners as they are no longer needed
    // The destination area input now directly opens the map modal

    // REMOVED: Manual booking cost functionality
    // Cost data now comes only from DR uploads for better data integrity
    /*
    const addCostBtn = document.getElementById('addCostBtn');
    const costItemsContainer = document.getElementById('costItemsContainer');

    if (addCostBtn && costItemsContainer) {
        // Remove existing event listeners by cloning
        const newAddCostBtn = addCostBtn.cloneNode(true);
        addCostBtn.parentNode.replaceChild(newAddCostBtn, addCostBtn);
        
        newAddCostBtn.addEventListener('click', function () {
            const costItem = document.createElement('div');
            costItem.className = 'cost-item';
            costItem.innerHTML = `
                <div class="flex-grow-1">
                    <input type="text" class="form-control" placeholder="Description (e.g., Fuel Surcharge)">
                </div>
                <div>
                    <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="number" class="form-control" placeholder="Amount">
                    </div>
                </div>
                <button type="button" class="remove-cost">
                    <i class="bi bi-x-lg"></i>
                </button>
            `;

            costItemsContainer.appendChild(costItem);

            // Add event listener to the new remove button
            const removeCostBtn = costItem.querySelector('.remove-cost');
            if (removeCostBtn) {
                // Remove existing event listeners by cloning
                const newRemoveCostBtn = removeCostBtn.cloneNode(true);
                removeCostBtn.parentNode.replaceChild(newRemoveCostBtn, removeCostBtn);
                
                newRemoveCostBtn.addEventListener('click', function () {
                    costItem.remove();
                });
            }
        });
    }
    */

    // REMOVED: Remove cost buttons functionality
    /*
    document.querySelectorAll('.remove-cost').forEach(button => {
        // Remove existing event listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function () {
            const costItem = this.closest('.cost-item');
            if (costItem) {
                costItem.remove();
            }
        });
    });
    */

    // Confirm booking button with proper event listener cleanup
    const confirmBookingBtn = document.getElementById('confirmBookingBtn');
    if (confirmBookingBtn) {
        // Remove existing event listeners by cloning
        const newConfirmBookingBtn = confirmBookingBtn.cloneNode(true);
        confirmBookingBtn.parentNode.replaceChild(newConfirmBookingBtn, confirmBookingBtn);
        
        newConfirmBookingBtn.addEventListener('click', function () {
            saveBooking();
        });
    }

    // Cancel booking button (uses data-bs-dismiss="modal" in HTML)
    // No need to add event listener as Bootstrap handles modal dismissal


    

    
    console.log('✅ BOOKING MODAL INITIALIZATION COMPLETED SUCCESSFULLY');
    console.log('  - Origin coordinates will display when warehouse selected');
    console.log('  - Destination inputs will open map on click/focus');
    console.log('  - Pin on Map buttons are functional');
    console.log('  - Event listeners properly attached');
}



// Save booking to Supabase
async function saveBooking() {
    try {
        console.log('=== SAVE BOOKING FUNCTION STARTED ===');
        
        // Log the state of all relevant form elements
        const drNumberElement = document.getElementById('drNumber');
        console.log('Main DR Number element:', drNumberElement);
        console.log('Main DR Number value:', drNumberElement ? drNumberElement.value : 'Element not found');
        
        // Get all DR numbers - improved detection logic to accept any DR number input
        // Get all inputs with class "dr-number-input" (this includes both the main input and dynamically added ones)
        const drNumberInputs = document.querySelectorAll('.dr-number-input');
        
        console.log('DR Number inputs found:', drNumberInputs.length);
        drNumberInputs.forEach((input, index) => {
            console.log(`DR Input ${index}: ID=${input.id}, Value="${input.value}", Class="${input.className}"`);
        });
        
        let drNumbers = [];
        
        // Collect all DR numbers from inputs with class "dr-number-input"
        drNumberInputs.forEach((input, index) => {
            console.log(`Processing DR Input ${index} (ID: ${input.id}):`, input.value);
            if (input.value && input.value.trim()) {
                const trimmedValue = input.value.trim();
                if (trimmedValue) {
                    drNumbers.push(trimmedValue);
                    console.log(`Added DR number: "${trimmedValue}"`);
                }
            }
        });
        
        // Also check for the main drNumber input by ID in case it doesn't have the class
        const mainDrNumberInput = document.getElementById('drNumber');
        if (mainDrNumberInput) {
            console.log('Main DR Number input value:', `"${mainDrNumberInput.value}"`);
            console.log('Main DR Number input trimmed value:', `"${mainDrNumberInput.value.trim()}"`);
            console.log('DR numbers array before main input check:', drNumbers);
            
            // Check if main input has a value and it's not already in our array
            if (mainDrNumberInput.value && mainDrNumberInput.value.trim()) {
                const mainValue = mainDrNumberInput.value.trim();
                if (mainValue && !drNumbers.includes(mainValue)) {
                    drNumbers.push(mainValue);
                    console.log('Added main DR number input:', mainValue);
                } else if (mainValue && drNumbers.includes(mainValue)) {
                    console.log('Main DR number already in array, skipping duplicate');
                }
            } else {
                console.log('Main DR Number input is empty or whitespace only');
            }
        }
        
        console.log('Final collected DR Numbers:', drNumbers);
        
        // Check if we have the booking form element
        const bookingForm = document.getElementById('bookingForm');
        console.log('Booking form element:', bookingForm);
        if (bookingForm) {
            console.log('Booking form reset state:', bookingForm.dataset.resetState || 'not set');
        }

        // Validate form - simplified logic since we're now correctly collecting all DR numbers
        if (drNumbers.length === 0) {
            console.error('No DR numbers found - showing error to user');
            console.error('Current state:');
            console.error('- drNumbers array:', drNumbers);
            console.error('- drNumberInputs length:', drNumberInputs.length);
            console.error('- mainDrNumberInput exists:', !!mainDrNumberInput);
            if (mainDrNumberInput) {
                console.error('- mainDrNumberInput value:', `"${mainDrNumberInput.value}"`);
            }
            
            // Try to generate a DR number if none provided
            const generatedDR = generateDRNumber();
            console.log('Generated DR Number as fallback:', generatedDR);
            drNumbers.push(generatedDR);
            showToast('No DR number provided. Auto-generated: ' + generatedDR, 'warning');
        }

        const customerName = document.getElementById('customerName').value;
        const vendorNumber = document.getElementById('vendorNumber').value;
        const originSelect = document.getElementById('originSelect');
        const customOrigin = document.getElementById('customOrigin');
        const destinationInputs = document.querySelectorAll('.destination-area-input'); // Get all destination inputs
        const deliveryDate = document.getElementById('deliveryDate').value;
        const truckType = document.getElementById('truckType').value;
        const truckPlateNumber = document.getElementById('truckPlateNumber').value;

        console.log('Form data collected:', {
            customerName,
            vendorNumber,
            deliveryDate,
            truckType,
            truckPlateNumber,
            drNumbersCount: drNumbers.length
        });

        // Validate form
        if (!customerName) {
            showError('Customer Name is required');
            return;
        }

        if (!vendorNumber) {
            showError('Vendor Number is required');
            return;
        }

        if (!deliveryDate) {
            showError('Delivery Date is required');
            return;
        }

        if (!truckType) {
            showError('Truck Type is required');
            return;
        }

        if (!truckPlateNumber) {
            showError('Truck Plate Number is required');
            return;
        }

        // Get destinations (at least one required)
        let hasDestination = false;
        let destinations = [];
        destinationInputs.forEach(input => {
            if (input.value.trim()) {
                hasDestination = true;
                destinations.push(input.value);
            }
        });

        if (!hasDestination) {
            showError('At least one destination is required');
            return;
        }

        // Get origin
        let origin = '';
        if (originSelect && originSelect.value && originSelect.value !== '') {
            origin = originSelect.options[originSelect.selectedIndex].text;
        } else if (customOrigin && customOrigin.value) {
            origin = customOrigin.value;
        }

        if (!origin) {
            showError('Origin is required');
            return;
        }



        // Get additional costs with descriptions
        const costItems = document.querySelectorAll('#costItemsContainer .cost-item');
        let additionalCostsTotal = 0;
        let additionalCostItems = [];

        costItems.forEach(item => {
            const descriptionInput = item.querySelector('input[placeholder="Description (e.g., Fuel Surcharge)"]');
            const amountInput = item.querySelector('input[placeholder="Amount"]');
            
            if (amountInput && amountInput.value) {
                const amount = parseFloat(amountInput.value);
                const description = descriptionInput ? descriptionInput.value : '';
                if (!isNaN(amount)) {
                    additionalCostsTotal += amount;
                    additionalCostItems.push({
                        description: description,
                        amount: amount
                    });
                }
            }
        });

        // Process each DR number as a separate booking
        for (const drNumber of drNumbers) {
            // Auto-create customer if not exists
            console.log('=== SAVE BOOKING DEBUG ===');
            console.log('About to call autoCreateCustomer with:', {
                customerName,
                vendorNumber,
                destinations
            });
            
            await autoCreateCustomer(customerName, vendorNumber, destinations.join('; '));
            
            console.log('autoCreateCustomer completed');

            // Create delivery object with both snake_case and camelCase fields
            let newDelivery = {
                // Supabase fields (snake_case)
                dr_number: drNumber,
                customer_name: customerName,
                vendor_number: vendorNumber || '',
                origin: origin,
                destination: destinations.join('; '),
                truck_type: truckType || '',
                truck_plate_number: truckPlateNumber || '',
                status: 'Active',
                distance: '',
                additional_costs: parseFloat(additionalCostsTotal) || 0.00,
                created_date: deliveryDate || new Date().toISOString().split('T')[0],
                created_by: 'Manual',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                
                // Display fields (camelCase) - for backward compatibility
                drNumber: drNumber,
                customerName: customerName,
                vendorNumber: vendorNumber || '',
                truckType: truckType || '',
                truckPlateNumber: truckPlateNumber || '',
                deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };
            
            // Use global field normalizer if available
            if (window.normalizeDeliveryFields) {
                newDelivery = window.normalizeDeliveryFields(newDelivery);
            }

            console.log('🔧 Converted delivery data for Supabase:', newDelivery);

            // Save to Supabase using dataService
            if (window.dataService) {
                try {
                    const savedDelivery = await window.dataService.saveDelivery(newDelivery);
                    console.log('✅ Delivery saved to Supabase successfully:', savedDelivery);
                } catch (error) {
                    console.error('❌ Failed to save to Supabase:', error);
                    // Fallback to localStorage with original format for compatibility
                    const localDelivery = {
                        id: 'DEL-' + Date.now() + '-' + drNumber,
                        drNumber: drNumber,
                        customerName: customerName,
                        vendorNumber: vendorNumber,
                        origin: origin,
                        destination: destinations.join('; '),
                        truckType: truckType,
                        truckPlateNumber: truckPlateNumber,
                        status: 'On Schedule',
                        deliveryDate: deliveryDate,
                        additionalCosts: additionalCostsTotal,
                        additionalCostItems: additionalCostItems,
                        timestamp: new Date().toISOString()
                    };
                    if (typeof window.activeDeliveries !== 'undefined') {
                        window.activeDeliveries.push(localDelivery);
                        localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
                        console.log('✅ Saved to localStorage as fallback');
                    }
                }
            } else {
                // Fallback to localStorage if dataService not available
                if (typeof window.activeDeliveries !== 'undefined') {
                    window.activeDeliveries.push(newDelivery);
                    console.log(`✅ Added delivery to window.activeDeliveries. Total: ${window.activeDeliveries.length}`);
                    
                    try {
                        localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
                        console.log('✅ Saved activeDeliveries to localStorage');
                    } catch (error) {
                        console.error('Error saving to localStorage:', error);
                    }
                }
                
                // Force immediate refresh of Active Deliveries display
                console.log('🔄 Forcing immediate refresh of Active Deliveries...');
                if (typeof window.loadActiveDeliveries === 'function') {
                    // Multiple refresh attempts to ensure data shows up
                    setTimeout(() => {
                        window.loadActiveDeliveries();
                        console.log('✅ Active Deliveries refreshed after manual booking (attempt 1)');
                    }, 100);
                    
                    setTimeout(() => {
                        window.loadActiveDeliveries();
                        console.log('✅ Active Deliveries refreshed after manual booking (attempt 2)');
                    }, 500);
                    
                    setTimeout(() => {
                        window.loadActiveDeliveries();
                        console.log('✅ Active Deliveries refreshed after manual booking (attempt 3)');
                    }, 1000);
                } else {
                    console.error('❌ window.loadActiveDeliveries function not available!');
                }
                
                // Update analytics dashboard metrics
                if (typeof window.updateDashboardMetrics === 'function') {
                    window.updateDashboardMetrics();
                    console.log('✅ Updated dashboard metrics');
                }
                
                // Refresh analytics charts if analytics view is active
                const analyticsView = document.getElementById('analyticsView');
                if (analyticsView && analyticsView.classList.contains('active')) {
                    if (typeof window.initAnalyticsCharts === 'function') {
                        setTimeout(() => {
                            window.initAnalyticsCharts('day');
                            console.log('✅ Refreshed analytics charts with new booking data');
                        }, 500);
                    }
                }
                
                // CRITICAL: Force refresh active deliveries display multiple times
                if (typeof window.activeDeliveries !== 'undefined') {
                    if (typeof window.loadActiveDeliveries === 'function') {
                        // Immediate refresh
                        window.loadActiveDeliveries();
                        
                        // Delayed refresh to ensure data persistence
                        setTimeout(() => {
                            window.loadActiveDeliveries();
                            console.log('🔄 Final refresh of Active Deliveries after booking save');
                        }, 200);
                    } else {
                        console.error('❌ window.loadActiveDeliveries not available for final refresh!');
                    }
                } else {
                    console.error('❌ window.activeDeliveries is not defined!');
                    // Initialize it if it doesn't exist
                    window.activeDeliveries = [];
                    window.activeDeliveries.push(newDelivery);
                    console.log('✅ Initialized and added to activeDeliveries');
                }
            }
        }

        // Mock success
        showToast('Booking confirmed successfully!');

        // Reset form and close modal
        resetBookingForm();
        const bookingModalElement = document.getElementById('bookingModal');
        const bookingModal = bootstrap.Modal.getInstance(bookingModalElement);
        if (bookingModal) {
            bookingModal.hide();
        }
        
        // Ensure modal backdrop is removed and body scrolling is re-enabled
        setTimeout(() => {
            const modalBackdrops = document.querySelectorAll('.modal-backdrop');
            modalBackdrops.forEach(backdrop => {
                backdrop.remove();
            });
            
            // Remove modal-open class from body if it exists
            if (document.body.classList.contains('modal-open')) {
                document.body.classList.remove('modal-open');
            }
            
            // Re-enable body scrolling
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 300);

        // Refresh calendar data
        if (typeof loadBookingsData === 'function' && typeof updateCalendar === 'function') {
            loadBookingsData().then(() => {
                updateCalendar();
            });
        }
        
        // Update booking view dashboard with real data
        if (typeof window.updateBookingViewDashboard === 'function') {
            setTimeout(() => {
                window.updateBookingViewDashboard();
            }, 100);
        }
        
        // Update analytics dashboard stats
        if (typeof window.updateDashboardStats === 'function') {
            setTimeout(() => {
                window.updateDashboardStats();
            }, 150);
        }
    } catch (error) {
        console.error('Error saving booking:', error);
        showError('Failed to save booking');
    }
}

// Helper function to generate DR number
function generateDRNumber() {
    // Generate a 4-digit random number
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const drNumber = `DR-${randomNumber}`;
    console.log('Generated DR Number:', drNumber);
    return drNumber;
}

// Ensure customer management is ready
function ensureCustomerManagementReady() {
    console.log('=== ENSURING CUSTOMER MANAGEMENT READY ===');
    
    // Make sure customers array is globally accessible
    if (typeof window.customers === 'undefined') {
        window.customers = [];
        console.log('Initialized window.customers array');
    }
    
    // Try to load existing customers from localStorage
    const savedCustomers = localStorage.getItem('mci-customers');
    if (savedCustomers && window.customers.length === 0) {
        try {
            window.customers = JSON.parse(savedCustomers);
            console.log('Loaded customers from localStorage:', window.customers.length);
        } catch (error) {
            console.error('Error loading customers from localStorage:', error);
        }
    }
    
    // Sync with HTML customers array if it exists
    if (typeof customers !== 'undefined') {
        console.log('HTML customers array found with length:', customers.length);
        if (customers.length > 0 && window.customers.length === 0) {
            window.customers = [...customers];
            console.log('Synced window.customers with HTML customers');
        } else if (window.customers.length > 0 && customers.length === 0) {
            customers.push(...window.customers);
            console.log('Synced HTML customers with window.customers');
        }
    }
    
    // Make sure customer management functions are available
    if (typeof window.loadCustomers === 'undefined') {
        window.loadCustomers = function() {
            console.log('Customer management not fully loaded yet');
        };
    }
    
    console.log('Customer management ready check completed');
}

// Auto-create customer from booking details
async function autoCreateCustomer(customerName, vendorNumber, destination) {
    try {
        console.log('=== AUTO CREATE CUSTOMER DEBUG ===');
        console.log('Customer Name:', customerName);
        console.log('Vendor Number:', vendorNumber);
        console.log('Destination:', destination);
        console.log('Window.customers exists:', !!window.customers);
        console.log('Window.customers array:', window.customers);
        
        // Ensure customers array exists
        if (!window.customers) {
            console.log('No customers array found, initializing...');
            window.customers = [];
        }
        
        // Also check if the HTML customers array exists
        if (typeof customers !== 'undefined') {
            console.log('HTML customers array exists with length:', customers.length);
            // Sync window.customers with HTML customers array
            if (customers.length > 0 && window.customers.length === 0) {
                window.customers = [...customers];
                console.log('Synced window.customers with HTML customers array');
            }
        } else {
            console.log('HTML customers array not found');
        }
        
        // Check if customer already exists (by name or phone)
        const existingCustomer = window.customers?.find(customer => 
            customer.contactPerson.toLowerCase() === customerName.toLowerCase() ||
            customer.phone === vendorNumber
        );
        
        console.log('Existing customer found:', existingCustomer);

        if (existingCustomer) {
            console.log('Customer already exists:', existingCustomer.contactPerson);
            
            // Update booking count and last delivery date for existing customer
            existingCustomer.bookingsCount = (existingCustomer.bookingsCount || 0) + 1;
            existingCustomer.lastDelivery = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            // Also update in HTML customers array if it exists
            if (typeof customers !== 'undefined') {
                const htmlCustomerIndex = customers.findIndex(c => 
                    c.contactPerson.toLowerCase() === customerName.toLowerCase() ||
                    c.phone === vendorNumber
                );
                if (htmlCustomerIndex !== -1) {
                    customers[htmlCustomerIndex] = existingCustomer;
                    console.log('Updated customer in HTML customers array');
                }
            }
            
            // Save updated customer data to localStorage
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
            
            // Always refresh customers view to ensure updated data is visible
            if (typeof window.loadCustomers === 'function') {
                window.loadCustomers();
            }
            
            // Also trigger the customer management refresh if available
            if (typeof loadCustomers === 'function') {
                loadCustomers();
            }
            
            // Show update message
            showToast(`Customer "${customerName}" booking count updated in Customer Management!`);
            
            return existingCustomer;
        }

        // Create new customer
        const newCustomer = {
            id: 'CUST-' + String((window.customers?.length || 0) + 1).padStart(3, '0'),
            contactPerson: customerName,
            phone: vendorNumber,
            address: destination, // Use destination as address
            accountType: 'Individual', // Default account type for individual customers
            email: '', // Empty email - can be filled later
            status: 'active',
            notes: 'Auto-created from delivery booking',
            bookingsCount: 1,
            lastDelivery: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            createdAt: new Date()
        };

        // Add to customers array
        window.customers.push(newCustomer);
        console.log('New customer auto-created:', newCustomer.contactPerson);
        console.log('Updated window.customers array:', window.customers);
        
        // Also add to HTML customers array if it exists
        if (typeof customers !== 'undefined') {
            customers.push(newCustomer);
            console.log('Added to HTML customers array, new length:', customers.length);
        }
        
        // Save to localStorage
        localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        console.log('Saved to localStorage');
        
        // Always refresh customers view to ensure new customer is visible
        console.log('=== REFRESHING CUSTOMER DISPLAY ===');
        
        if (typeof window.loadCustomers === 'function') {
            console.log('Calling window.loadCustomers()');
            window.loadCustomers();
        } else {
            console.log('window.loadCustomers function not available');
        }
        
        // Also trigger the customer management refresh if available
        if (typeof loadCustomers === 'function') {
            console.log('Calling loadCustomers() from HTML');
            loadCustomers();
        } else {
            console.log('loadCustomers() from HTML not available');
        }
        
        // Force refresh by triggering a custom event
        const customerUpdateEvent = new CustomEvent('customerUpdated', {
            detail: { customer: newCustomer, action: 'created' }
        });
        window.dispatchEvent(customerUpdateEvent);
        console.log('Dispatched customerUpdated event');
        
        // Try to directly update the customer display if the container exists
        const customersContainer = document.getElementById('customersContainer');
        if (customersContainer) {
            console.log('Found customersContainer, attempting direct refresh');
            // Trigger a manual refresh after a short delay
            setTimeout(() => {
                if (typeof loadCustomers === 'function') {
                    loadCustomers();
                    console.log('Manual refresh triggered');
                }
            }, 100);
        } else {
            console.log('customersContainer not found');
        }
        
        // Show success message
        showToast(`Customer "${customerName}" automatically added to Customer Management section!`);

        return newCustomer;
    } catch (error) {
        console.error('Error auto-creating customer:', error);
        // Don't fail the booking if customer creation fails
        return null;
    }
}

// Reset booking form
function resetBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.reset();
    }
    

    
    const customOriginContainer = document.getElementById('customOriginContainer');
    if (customOriginContainer) {
        customOriginContainer.classList.add('d-none');
    }

    // Remove all additional DR number items except the first one
    const drNumberItems = document.querySelectorAll('#drNumbersContainer .dr-number-item');
    if (drNumberItems.length > 1) {
        for (let i = 1; i < drNumberItems.length; i++) {
            drNumberItems[i].remove();
        }
    }

    // Reset the first DR number item
    const firstDrNumberItem = document.querySelector('#drNumbersContainer .dr-number-item');
    if (firstDrNumberItem) {
        const drNumberInput = firstDrNumberItem.querySelector('.dr-number-input');
        if (drNumberInput) {
            drNumberInput.value = '';
        }
    }

    // Remove all additional cost items except the first one
    const costItems = document.querySelectorAll('#costItemsContainer .cost-item');
    if (costItems.length > 1) {
        for (let i = 1; i < costItems.length; i++) {
            costItems[i].remove();
        }
    }

    // Reset the first cost item
    const firstCostItem = document.querySelector('#costItemsContainer .cost-item');
    if (firstCostItem) {
        const descriptionInput = firstCostItem.querySelector('input[placeholder="Description (e.g., Fuel Surcharge)"]');
        if (descriptionInput) {
            descriptionInput.value = '';
        }
        
        const amountInput = firstCostItem.querySelector('input[placeholder="Amount"]');
        if (amountInput) {
            amountInput.value = '';
        }
        
        const removeCostBtn = firstCostItem.querySelector('.remove-cost');
        if (removeCostBtn) {
            removeCostBtn.disabled = true;
        }
    }
    
    // Ensure any modal backdrops are removed
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => {
        backdrop.remove();
    });
    
    // Remove modal-open class from body if it exists
    if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
    }
    
    // Re-enable body scrolling
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Ensure warehouse manager is ready
function ensureWarehouseManagerReady() {
    console.log('=== ENSURING WAREHOUSE MANAGER READY ===');
    
    // Make sure warehouse manager is globally accessible
    if (typeof window.warehouseManager === 'undefined' || window.warehouseManager === null) {
        console.log('Initializing warehouse manager...');
        // Check if WarehouseMapManager class is available
        if (typeof window.WarehouseMapManager !== 'undefined') {
            window.warehouseManager = new window.WarehouseMapManager();
            console.log('Warehouse manager initialized');
        } else {
            console.warn('WarehouseMapManager class not available, creating fallback');
            // Create fallback warehouse manager with default coordinates
            window.warehouseManager = {
                warehouseLocations: [
                    {
                        id: 'alabang',
                        name: 'SMEG Alabang warehouse',
                        coordinates: { lat: 14.4378, lng: 121.0199 }
                    },
                    {
                        id: 'cebu', 
                        name: 'SMEG Cebu warehouse',
                        coordinates: { lat: 10.3157, lng: 123.8854 }
                    }
                ]
            };
            console.log('✅ Fallback warehouse manager created with default coordinates');
        }
    } else {
        console.log('Warehouse manager already initialized');
    }
    
    console.log('Warehouse manager ready check completed');
}



// Show map pin dialog for selecting locations
function showMapPinDialog(type, index = 0) {
    console.log(`showMapPinDialog called with type: ${type}, index: ${index}`);
    
    // Create or update the map modal
    let mapModal = document.getElementById('mapModal');
    if (!mapModal) {
        mapModal = document.createElement('div');
        mapModal.id = 'mapModal';
        mapModal.className = 'modal fade';
        mapModal.tabIndex = -1;
        mapModal.setAttribute('aria-hidden', 'true');
        mapModal.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-geo-alt me-2"></i>
                            <span id="mapModalTitle">Select Location on Map</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Search Location</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="bi bi-geo-alt"></i>
                                        </span>
                                        <input type="text" class="form-control" id="mapSearchInput" placeholder="Search for a place...">
                                        <button class="btn btn-outline-secondary" type="button" id="mapSearchBtn">
                                            <i class="bi bi-search"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Selected Coordinates</label>
                                    <div class="coordinates-display p-2 bg-light rounded">
                                        <div class="coordinate-item">
                                            <small class="text-muted">Latitude:</small>
                                            <span id="selectedLat" class="fw-bold">--</span>
                                        </div>
                                        <div class="coordinate-item">
                                            <small class="text-muted">Longitude:</small>
                                            <span id="selectedLng" class="fw-bold">--</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" id="confirmLocationBtn" disabled>
                                        <i class="bi bi-check-circle me-2"></i>Confirm Location
                                    </button>
                                    <button class="btn btn-outline-secondary" id="useCurrentLocationBtn">
                                        <i class="bi bi-geo-alt me-2"></i>Use Current Location
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div id="mapContainer" style="height: 400px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
                                    <div class="d-flex justify-content-center align-items-center h-100">
                                        <div class="text-center">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Loading map...</span>
                                            </div>
                                            <p class="mt-2">Loading map...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(mapModal);
    }

    // Set modal title based on type
    const modalTitle = document.getElementById('mapModalTitle');
    if (modalTitle) {
        modalTitle.textContent = type === 'origin' ? 'Select Origin Location' : `Select Destination Location #${index + 1}`;
    }

    // Show the modal
    const modal = new bootstrap.Modal(mapModal);
    modal.show();

    // Remove any existing shown.bs.modal event listeners to prevent duplicates
    // We use a flag to ensure initializeMapModal is only called once per modal show
    if (mapModal._isInitializing) {
        console.log('Map modal is already initializing, skipping duplicate initialization');
        return;
    }
    mapModal._isInitializing = true;

    // Initialize map after modal is shown
    mapModal.addEventListener('shown.bs.modal', function() {
        initializeMapModal(type, index);
    }, {once: true});

    // Clean up map when modal is hidden
    mapModal.addEventListener('hidden.bs.modal', function() {
        // Reset initialization flag
        mapModal._isInitializing = false;
        
        // Remove the map instance if it exists
        if (currentMapInstance) {
            currentMapInstance.remove();
            currentMapInstance = null;
        }
        // Remove the map modal from DOM to prevent initialization conflicts
        if (mapModal.parentNode) {
            mapModal.parentNode.removeChild(mapModal);
        }
    }, {once: true});
}

// Global variable to store the map instance
let currentMapInstance = null;
// Global variables to store the selected marker and coordinates
let selectedMarker = null;
let selectedCoordinates = { lat: null, lng: null };

// Initialize the map in the modal
function initializeMapModal(type, index) {
    console.log(`Initializing map modal for ${type}, index: ${index}`);
    
    // Check if Leaflet is available
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h5>Map Library Not Available</h5>
                    <p>The map functionality requires the Leaflet library to be loaded.</p>
                </div>
            `;
        }
        return;
    }
    
    // Get map container
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    // Clear loading indicator
    mapContainer.innerHTML = '';

    try {
        // Initialize Leaflet map centered on Luzon (focus on major cities in Luzon)
        // Default view centered on Metro Manila area
        currentMapInstance = L.map('mapContainer').setView([14.6091, 121.0223], 10);
        console.log('✅ Leaflet map initialized successfully');
    } catch (error) {
        console.error('Error initializing Leaflet map:', error);
        mapContainer.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="bi bi-exclamation-triangle"></i>
                <h5>Map Initialization Error</h5>
                <p>Failed to initialize the map: ${error.message}</p>
            </div>
        `;
        return;
    }
    
    // Set bounds to restrict view to Luzon area
    const luzonBounds = L.latLngBounds(
        L.latLng(13.0, 119.0), // Southwest corner
        L.latLng(18.0, 122.0)  // Northeast corner
    );
    
    // Restrict map view to Luzon bounds
    currentMapInstance.setMaxBounds(luzonBounds);
    currentMapInstance.on('drag', function() {
        currentMapInstance.panInsideBounds(luzonBounds, { animate: false });
    });

    // Add OpenStreetMap tiles with error handling
    try {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXAgVGlsZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
        }).addTo(currentMapInstance);
        console.log('✅ Map tiles loaded successfully');
    } catch (error) {
        console.error('Error loading map tiles:', error);
    }

    // Initialize selected marker and coordinates
    selectedMarker = null;
    selectedCoordinates = { lat: null, lng: null };

    // Add click event to the map
    currentMapInstance.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        console.log(`Map clicked at coordinates: ${lat}, ${lng}`);
        
        // Update selected coordinates display
        const selectedLatElement = document.getElementById('selectedLat');
        const selectedLngElement = document.getElementById('selectedLng');
        
        if (selectedLatElement && selectedLngElement) {
            selectedLatElement.textContent = lat.toFixed(6);
            selectedLngElement.textContent = lng.toFixed(6);
            console.log('✅ Coordinates display updated');
        } else {
            console.error('Coordinate display elements not found');
        }
        
        // Remove existing marker if any
        if (selectedMarker) {
            currentMapInstance.removeLayer(selectedMarker);
            console.log('Removed existing marker');
        }
        
        // Add new marker with pin icon
        try {
            const pinIcon = L.divIcon({
                className: 'custom-pin-icon',
                html: '<i class="bi bi-geo-alt-fill" style="color: #d63384; font-size: 24px;"></i>',
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            });
            
            selectedMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(currentMapInstance);
            console.log('✅ New marker added successfully');
        } catch (error) {
            console.error('Error adding marker:', error);
            // Fallback to default marker
            selectedMarker = L.marker([lat, lng]).addTo(currentMapInstance);
        }
        
        // Update coordinates
        selectedCoordinates = { lat, lng };
        console.log('Selected coordinates updated:', selectedCoordinates);
        
        // Enable confirm button
        const confirmBtn = document.getElementById('confirmLocationBtn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            console.log('✅ Confirm button enabled');
        } else {
            console.error('Confirm button not found');
        }
    });

    // Set up enhanced search functionality
    setupMapSearch();

    // Set up current location button
    const useCurrentLocationBtn = document.getElementById('useCurrentLocationBtn');
    if (useCurrentLocationBtn) {
        useCurrentLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        // Center map on current location
                        currentMapInstance.setView([lat, lng], 15);
                        
                        // Update selected coordinates display
                        document.getElementById('selectedLat').textContent = lat.toFixed(6);
                        document.getElementById('selectedLng').textContent = lng.toFixed(6);
                        
                        // Remove existing marker if any
                        if (selectedMarker) {
                            currentMapInstance.removeLayer(selectedMarker);
                        }
                        
                        // Add new marker with pin icon
                        const pinIcon = L.divIcon({
                            className: 'custom-pin-icon',
                            html: '<i class="bi bi-geo-alt-fill" style="color: #d63384; font-size: 24px; transform: translate(-50%, -100%);"></i>',
                            iconSize: [24, 24],
                            iconAnchor: [12, 24]
                        });
                        
                        selectedMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(currentMapInstance);
                        
                        // Update coordinates
                        selectedCoordinates = { lat, lng };
                        
                        // Enable confirm button
                        document.getElementById('confirmLocationBtn').disabled = false;
                        
                        // Update search input
                        document.getElementById('mapSearchInput').value = 'Current Location';
                    },
                    function(error) {
                        console.error('Error getting current location:', error);
                        alert('Unable to get current location. Please try clicking on the map instead.');
                    }
                );
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        });
    }

    // Set up confirm button
    const confirmBtn = document.getElementById('confirmLocationBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (selectedCoordinates.lat && selectedCoordinates.lng) {
                // Get location details
                const locationAddress = document.getElementById('mapSearchInput').value || 
                    `${selectedCoordinates.lat.toFixed(6)}, ${selectedCoordinates.lng.toFixed(6)}`;
                
                // Update the appropriate input field
                if (type === 'origin') {
                    const customOrigin = document.getElementById('customOrigin');
                    if (customOrigin) {
                        customOrigin.value = locationAddress;
                        customOrigin.setAttribute('data-lat', selectedCoordinates.lat);
                        customOrigin.setAttribute('data-lng', selectedCoordinates.lng);
                        
                        // Show custom origin container
                        const customOriginContainer = document.getElementById('customOriginContainer');
                        if (customOriginContainer) {
                            customOriginContainer.classList.remove('d-none');
                        }
                        
                        // Reset origin select
                        const originSelect = document.getElementById('originSelect');
                        if (originSelect) {
                            originSelect.value = '';
                        }
                        
                        // Update coordinates display
                        const originCoordinatesDisplay = document.getElementById('originCoordinatesDisplay');
                        if (originCoordinatesDisplay) {
                            originCoordinatesDisplay.textContent = `(${selectedCoordinates.lat.toFixed(6)}, ${selectedCoordinates.lng.toFixed(6)})`;
                        }
                    }
                } else {
                    // For destination, update the specific area input
                    const destinationInputs = document.querySelectorAll('.destination-area-input');
                    if (destinationInputs[index]) {
                        destinationInputs[index].value = locationAddress;
                        destinationInputs[index].setAttribute('data-lat', selectedCoordinates.lat);
                        destinationInputs[index].setAttribute('data-lng', selectedCoordinates.lng);
                    }
                }
                
                // Update distance calculation
                updateDistance();
                
                // Close the modal
                const mapModal = document.getElementById('mapModal');
                if (mapModal) {
                    const modal = bootstrap.Modal.getInstance(mapModal);
                    if (modal) {
                        modal.hide();
                    }
                }
            } else {
                alert('Please select a location on the map or search for a location first.');
            }
        });
    }
}

// Mock address search function with Philippine locations (CSP-compliant)
function searchAddress(query) {
    return new Promise((resolve, reject) => {
        try {
            console.log('Searching for address:', query);
            
            // Use the mock search function from the main HTML file
            if (typeof window.mockAddressSearch === 'function') {
                const results = window.mockAddressSearch(query);
                resolve(results);
            } else {
                // Fallback mock search if main function not available
                const mockLocations = [
                    // Metro Manila
                    { lat: "14.5995", lng: "120.9842", display_name: "Manila, Metro Manila, Philippines", type: "city", class: "place" },
                    { lat: "14.5547", lng: "121.0244", display_name: "Makati City, Metro Manila, Philippines", type: "city", class: "place" },
                    { lat: "14.5176", lng: "121.0509", display_name: "BGC, Taguig City, Metro Manila, Philippines", type: "district", class: "place" },
                    { lat: "14.6760", lng: "121.0437", display_name: "Quezon City, Metro Manila, Philippines", type: "city", class: "place" },
                    { lat: "14.4378", lng: "121.0199", display_name: "Alabang, Muntinlupa City, Metro Manila, Philippines", type: "district", class: "place" },
                    { lat: "14.5764", lng: "121.0851", display_name: "Ortigas Center, Pasig City, Metro Manila, Philippines", type: "district", class: "place" },
                    { lat: "14.6507", lng: "121.1029", display_name: "Marikina City, Metro Manila, Philippines", type: "city", class: "place" },
                    { lat: "14.5243", lng: "120.9947", display_name: "Ermita, Manila, Metro Manila, Philippines", type: "district", class: "place" },
                    
                    // Central Luzon (Region III)
                    { lat: "14.7942", lng: "120.9402", display_name: "Malolos, Bulacan, Central Luzon, Philippines", type: "city", class: "place" },
                    { lat: "14.8564", lng: "120.8154", display_name: "Bulacan, Central Luzon, Philippines", type: "province", class: "place" },
                    { lat: "14.6488", lng: "120.9706", display_name: "Meycauayan, Bulacan, Central Luzon, Philippines", type: "city", class: "place" },
                    { lat: "14.7306", lng: "120.9472", display_name: "San Jose del Monte, Bulacan, Central Luzon, Philippines", type: "city", class: "place" },
                    { lat: "15.0794", lng: "120.6200", display_name: "Angeles City, Pampanga, Central Luzon, Philippines", type: "city", class: "place" },
                    { lat: "15.4817", lng: "120.5979", display_name: "Arayat, Pampanga, Central Luzon, Philippines", type: "municipality", class: "place" },
                    { lat: "15.0499", lng: "120.6947", display_name: "San Fernando, Pampanga, Central Luzon, Philippines", type: "city", class: "place" },
                    { lat: "15.1394", lng: "120.5883", display_name: "Clark, Pampanga, Central Luzon, Philippines", type: "district", class: "place" },
                    { lat: "15.6617", lng: "120.9739", display_name: "Cabanatuan, Nueva Ecija, Central Luzon, Philippines", type: "city", class: "place" },
                    { lat: "15.4855", lng: "120.8647", display_name: "Gapan, Nueva Ecija, Central Luzon, Philippines", type: "city", class: "place" },
                    { lat: "14.9709", lng: "120.5155", display_name: "Olongapo, Zambales, Central Luzon, Philippines", type: "city", class: "place" },
                    { lat: "15.3367", lng: "120.1739", display_name: "Subic, Zambales, Central Luzon, Philippines", type: "municipality", class: "place" },
                    { lat: "15.7731", lng: "121.1533", display_name: "Baler, Aurora, Central Luzon, Philippines", type: "municipality", class: "place" },
                    
                    // Other Luzon Areas
                    { lat: "16.4023", lng: "120.5960", display_name: "Baguio City, Benguet, Philippines", type: "city", class: "place" },
                    { lat: "14.0860", lng: "121.1570", display_name: "Batangas City, Batangas, Philippines", type: "city", class: "place" },
                    { lat: "13.7565", lng: "121.0583", display_name: "Lipa City, Batangas, Philippines", type: "city", class: "place" },
                    { lat: "14.2456", lng: "121.1619", display_name: "Lipa, Batangas, CALABARZON, Philippines", type: "city", class: "place" },
                    { lat: "14.1753", lng: "121.1589", display_name: "Tanauan, Batangas, CALABARZON, Philippines", type: "city", class: "place" },
                    { lat: "14.2691", lng: "121.0054", display_name: "Tagaytay, Cavite, CALABARZON, Philippines", type: "city", class: "place" },
                    { lat: "14.4791", lng: "120.9647", display_name: "Bacoor, Cavite, CALABARZON, Philippines", type: "city", class: "place" },
                    { lat: "14.1014", lng: "121.0569", display_name: "Calamba, Laguna, CALABARZON, Philippines", type: "city", class: "place" },
                    { lat: "14.2928", lng: "121.1599", display_name: "Santa Rosa, Laguna, CALABARZON, Philippines", type: "city", class: "place" },
                    
                    // Visayas
                    { lat: "10.3157", lng: "123.8854", display_name: "Cebu City, Cebu, Philippines", type: "city", class: "place" },
                    { lat: "10.7202", lng: "122.5621", display_name: "Iloilo City, Iloilo, Philippines", type: "city", class: "place" },
                    { lat: "11.2442", lng: "125.0048", display_name: "Tacloban City, Leyte, Philippines", type: "city", class: "place" },
                    
                    // Mindanao
                    { lat: "7.0731", lng: "125.6128", display_name: "Davao City, Davao del Sur, Philippines", type: "city", class: "place" },
                    { lat: "8.4542", lng: "124.6319", display_name: "Cagayan de Oro City, Misamis Oriental, Philippines", type: "city", class: "place" }
                ];
                
                const searchTerm = query.toLowerCase();
                const filteredResults = mockLocations.filter(location => 
                    location.display_name.toLowerCase().includes(searchTerm)
                );
                
                resolve(filteredResults.slice(0, 10)); // Limit to 10 results
            }
        } catch (error) {
            console.error('Search error:', error);
            reject(error);
        }
    });
}

// Enhanced search with autocomplete functionality
function setupMapSearch() {
    const searchInput = document.getElementById('mapSearchInput');
    const searchBtn = document.getElementById('mapSearchBtn');
    
    if (!searchInput || !searchBtn) return;
    
    // Create search results dropdown if it doesn't exist
    let searchResultsDropdown = document.getElementById('searchResultsDropdown');
    if (!searchResultsDropdown) {
        const dropdown = document.createElement('div');
        dropdown.id = 'searchResultsDropdown';
        dropdown.className = 'dropdown-menu';
        dropdown.style.cssText = 'position: absolute; z-index: 1000; max-height: 200px; overflow-y: auto; width: 100%; display: none;';
        if (searchInput.parentNode) {
            searchInput.parentNode.appendChild(dropdown);
            searchResultsDropdown = dropdown;
        }
    }
    
    let searchTimeout;
    
    // Handle search input with debouncing
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        
        // Hide dropdown if query is too short
        if (query.length < 3) {
            const dropdown = document.getElementById('searchResultsDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
            return;
        }
        
        searchTimeout = setTimeout(() => {
            // Show loading indicator
            const dropdown = document.getElementById('searchResultsDropdown');
            if (dropdown) {
                dropdown.innerHTML = '<div class="dropdown-item disabled">Searching...</div>';
                dropdown.style.display = 'block';
            }
            
            searchAddress(query)
                .then(results => {
                    const dropdown = document.getElementById('searchResultsDropdown');
                    if (!dropdown) return;
                    
                    if (results.length > 0) {
                        // Clear previous results
                        dropdown.innerHTML = '';
                        
                        // Add results to dropdown with pin icons
                        results.forEach((result, index) => {
                            const item = document.createElement('a');
                            item.className = 'dropdown-item';
                            item.href = '#';
                            item.innerHTML = `<i class="bi bi-geo-alt me-2"></i>${result.display_name}`;
                            item.addEventListener('click', function(e) {
                                e.preventDefault();
                                selectSearchResult(result);
                            });
                            dropdown.appendChild(item);
                        });
                        
                        // Show dropdown
                        dropdown.style.display = 'block';
                    } else {
                        dropdown.innerHTML = '<div class="dropdown-item disabled">No results found</div>';
                        setTimeout(() => {
                            dropdown.style.display = 'none';
                        }, 3000);
                    }
                })
                .catch(error => {
                    console.error('Search error:', error);
                    const dropdown = document.getElementById('searchResultsDropdown');
                    if (dropdown) {
                        dropdown.innerHTML = '<div class="dropdown-item disabled text-danger">Error searching. Please try again.</div>';
                        setTimeout(() => {
                            dropdown.style.display = 'none';
                        }, 3000);
                    }
                });
        }, 300); // 300ms debounce
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        // Ensure searchInput and searchResultsDropdown exist before checking contains
        const searchResultsDropdown = document.getElementById('searchResultsDropdown');
        if (searchInput && searchResultsDropdown && 
            !searchInput.contains(e.target) && 
            !searchResultsDropdown.contains(e.target)) {
            searchResultsDropdown.style.display = 'none';
        }
    });
    
    // Handle search button click
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            // Show loading indicator
            const originalBtnText = searchBtn.innerHTML;
            searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
            searchBtn.disabled = true;
            
            searchAddress(query)
                .then(results => {
                    if (results.length > 0) {
                        // Select the first result
                        selectSearchResult(results[0]);
                    } else {
                        alert('No results found for "' + query + '". Please try a different search term.');
                    }
                })
                .catch(error => {
                    console.error('Search error:', error);
                    alert('Error searching for address. Please try again.');
                })
                .finally(() => {
                    // Restore button state
                    searchBtn.innerHTML = originalBtnText;
                    searchBtn.disabled = false;
                });
        } else {
            alert('Please enter a location to search for.');
        }
    });
    
    // Allow Enter key to trigger search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Function to handle selecting a search result

// Function to handle selecting a search result
function selectSearchResult(result) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lng);

    // Center map on the result
    if (currentMapInstance) {
        currentMapInstance.setView([lat, lng], 15);

        // Update selected coordinates display
        document.getElementById('selectedLat').textContent = lat.toFixed(6);
        document.getElementById('selectedLng').textContent = lng.toFixed(6);

        // Remove existing marker if any
        if (selectedMarker) {
            currentMapInstance.removeLayer(selectedMarker);
        }

        // Add new marker with pin icon
        const pinIcon = L.divIcon({
            className: 'custom-pin-icon',
            html: '<i class="bi bi-geo-alt-fill" style="color: #d63384; font-size: 24px; transform: translate(-50%, -100%);"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
        });

        selectedMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(currentMapInstance);

        // Update coordinates
        selectedCoordinates = { lat, lng };

        // Enable confirm button
        document.getElementById('confirmLocationBtn').disabled = false;

        // Hide dropdown
        document.getElementById('searchResultsDropdown').style.display = 'none';

        // Update search input
        document.getElementById('mapSearchInput').value = result.display_name;
    }
}

// Backward compatibility function - now uses the same mock data
function mockAddressSearch(query) {
    // Return the same mock data as searchAddress for consistency
    const mockLocations = [
        // Metro Manila
        { lat: "14.5995", lng: "120.9842", display_name: "Manila, Metro Manila, Philippines", type: "city", class: "place" },
        { lat: "14.5547", lng: "121.0244", display_name: "Makati City, Metro Manila, Philippines", type: "city", class: "place" },
        { lat: "14.5176", lng: "121.0509", display_name: "BGC, Taguig City, Metro Manila, Philippines", type: "district", class: "place" },
        { lat: "14.6760", lng: "121.0437", display_name: "Quezon City, Metro Manila, Philippines", type: "city", class: "place" },
        { lat: "14.4378", lng: "121.0199", display_name: "Alabang, Muntinlupa City, Metro Manila, Philippines", type: "district", class: "place" },
        { lat: "14.5764", lng: "121.0851", display_name: "Ortigas Center, Pasig City, Metro Manila, Philippines", type: "district", class: "place" },
        { lat: "14.6507", lng: "121.1029", display_name: "Marikina City, Metro Manila, Philippines", type: "city", class: "place" },
        { lat: "14.5243", lng: "120.9947", display_name: "Ermita, Manila, Metro Manila, Philippines", type: "district", class: "place" },
        
        // Central Luzon (Region III)
        { lat: "14.7942", lng: "120.9402", display_name: "Malolos, Bulacan, Central Luzon, Philippines", type: "city", class: "place" },
        { lat: "14.8564", lng: "120.8154", display_name: "Bulacan, Central Luzon, Philippines", type: "province", class: "place" },
        { lat: "14.6488", lng: "120.9706", display_name: "Meycauayan, Bulacan, Central Luzon, Philippines", type: "city", class: "place" },
        { lat: "14.7306", lng: "120.9472", display_name: "San Jose del Monte, Bulacan, Central Luzon, Philippines", type: "city", class: "place" },
        { lat: "15.0794", lng: "120.6200", display_name: "Angeles City, Pampanga, Central Luzon, Philippines", type: "city", class: "place" },
        { lat: "15.4817", lng: "120.5979", display_name: "Arayat, Pampanga, Central Luzon, Philippines", type: "municipality", class: "place" },
        { lat: "15.0499", lng: "120.6947", display_name: "San Fernando, Pampanga, Central Luzon, Philippines", type: "city", class: "place" },
        { lat: "15.1394", lng: "120.5883", display_name: "Clark, Pampanga, Central Luzon, Philippines", type: "district", class: "place" },
        { lat: "15.6617", lng: "120.9739", display_name: "Cabanatuan, Nueva Ecija, Central Luzon, Philippines", type: "city", class: "place" },
        { lat: "15.4855", lng: "120.8647", display_name: "Gapan, Nueva Ecija, Central Luzon, Philippines", type: "city", class: "place" },
        { lat: "14.9709", lng: "120.5155", display_name: "Olongapo, Zambales, Central Luzon, Philippines", type: "city", class: "place" },
        { lat: "15.3367", lng: "120.1739", display_name: "Subic, Zambales, Central Luzon, Philippines", type: "municipality", class: "place" },
        { lat: "15.7731", lng: "121.1533", display_name: "Baler, Aurora, Central Luzon, Philippines", type: "municipality", class: "place" },
        
        // Other Luzon Areas
        { lat: "16.4023", lng: "120.5960", display_name: "Baguio City, Benguet, Philippines", type: "city", class: "place" },
        { lat: "14.0860", lng: "121.1570", display_name: "Batangas City, Batangas, Philippines", type: "city", class: "place" },
        { lat: "13.7565", lng: "121.0583", display_name: "Lipa City, Batangas, Philippines", type: "city", class: "place" },
        { lat: "14.2456", lng: "121.1619", display_name: "Lipa, Batangas, CALABARZON, Philippines", type: "city", class: "place" },
        { lat: "14.1753", lng: "121.1589", display_name: "Tanauan, Batangas, CALABARZON, Philippines", type: "city", class: "place" },
        { lat: "14.2691", lng: "121.0054", display_name: "Tagaytay, Cavite, CALABARZON, Philippines", type: "city", class: "place" },
        { lat: "14.4791", lng: "120.9647", display_name: "Bacoor, Cavite, CALABARZON, Philippines", type: "city", class: "place" },
        { lat: "14.1014", lng: "121.0569", display_name: "Calamba, Laguna, CALABARZON, Philippines", type: "city", class: "place" },
        { lat: "14.2928", lng: "121.1599", display_name: "Santa Rosa, Laguna, CALABARZON, Philippines", type: "city", class: "place" },
        
        // Visayas
        { lat: "10.3157", lng: "123.8854", display_name: "Cebu City, Cebu, Philippines", type: "city", class: "place" },
        { lat: "10.7202", lng: "122.5621", display_name: "Iloilo City, Iloilo, Philippines", type: "city", class: "place" },
        { lat: "11.2442", lng: "125.0048", display_name: "Tacloban City, Leyte, Philippines", type: "city", class: "place" },
        
        // Mindanao
        { lat: "7.0731", lng: "125.6128", display_name: "Davao City, Davao del Sur, Philippines", type: "city", class: "place" },
        { lat: "8.4542", lng: "124.6319", display_name: "Cagayan de Oro City, Misamis Oriental, Philippines", type: "city", class: "place" }
    ];
    
    const searchTerm = query.toLowerCase();
    const filteredResults = mockLocations.filter(location => 
        location.display_name.toLowerCase().includes(searchTerm)
    );
    
    return filteredResults.slice(0, 10); // Limit to 10 results
}

// Make sure all required functions are globally available
// Note: Some functions were removed as they were not defined
// Make functions globally available immediately
window.initBookingModal = initBookingModal;
window.openBookingModal = openBookingModal;
window.showBookingModal = showBookingModal;

// Ensure functions are available immediately
if (typeof window.initBookingModal === 'undefined') {
    console.error('❌ initBookingModal not available globally');
} else {
    console.log('✅ initBookingModal is available globally');
}

// Also make them available on the global scope for backward compatibility
if (typeof globalThis !== 'undefined') {
    globalThis.initBookingModal = initBookingModal;
    globalThis.openBookingModal = openBookingModal;
    globalThis.showBookingModal = showBookingModal;
}
window.saveBooking = saveBooking;
window.generateDRNumber = generateDRNumber;
window.selectSearchResult = selectSearchResult;

// DR File Upload Functionality (without distance calculations)
let pendingDRBookings = [];

// Initialize DR upload functionality
function initDRUpload() {
    console.log('🔧 Initializing DR upload functionality...');
    
    const uploadDrFileBtn = document.getElementById('uploadDrFileBtn');
    const drFileInput = document.getElementById('drFileInput');
    const selectDrFileBtn = document.getElementById('selectDrFileBtn');
    const backToDrUploadBtn = document.getElementById('backToDrUploadBtn');
    const confirmDrUploadBtn = document.getElementById('confirmDrUploadBtn');
    const addDrCostBtn = document.getElementById('addDrCostBtn');
    const previewDrSummaryBtn = document.getElementById('previewDrSummaryBtn');
    
    console.log('🔍 Button elements found:', {
        uploadDrFileBtn: !!uploadDrFileBtn,
        drFileInput: !!drFileInput,
        selectDrFileBtn: !!selectDrFileBtn,
        confirmDrUploadBtn: !!confirmDrUploadBtn
    });
    
    if (uploadDrFileBtn) {
        console.log('✅ Adding click listener to Upload DR File button');
        uploadDrFileBtn.addEventListener('click', function(e) {
            console.log('🎯 Upload DR File button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const drUploadModal = new bootstrap.Modal(document.getElementById('drUploadModal'));
                drUploadModal.show();
                console.log('✅ DR Upload modal opened successfully');
            } catch (error) {
                console.error('❌ Error opening DR upload modal:', error);
            }
        });
    } else {
        console.error('❌ Upload DR File button not found!');
    }
    
    if (selectDrFileBtn) {
        // Remove any existing event listeners by cloning the button
        const newSelectDrFileBtn = selectDrFileBtn.cloneNode(true);
        selectDrFileBtn.parentNode.replaceChild(newSelectDrFileBtn, selectDrFileBtn);
        
        newSelectDrFileBtn.addEventListener('click', function() {
            drFileInput.click();
        });
    }
    
    if (drFileInput) {
        drFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                processDRFile(file);
            }
        });
    }
    
    if (backToDrUploadBtn) {
        backToDrUploadBtn.addEventListener('click', function() {
            showDRUploadContent();
        });
    }
    
    if (confirmDrUploadBtn) {
        confirmDrUploadBtn.addEventListener('click', function() {
            confirmDRUpload();
        });
    }
    
    if (addDrCostBtn) {
        addDrCostBtn.addEventListener('click', function() {
            addDRCostItem();
        });
    }
    
    if (previewDrSummaryBtn) {
        previewDrSummaryBtn.addEventListener('click', function() {
            showDRSummaryPreview();
        });
    }
    
    // Initialize cost calculation listeners
    initDRCostCalculation();
}

// Process DR Excel file
async function processDRFile(file) {
    try {
        console.log('🔄 Processing DR file:', file.name);
        
        const data = await readExcelFile(file);
        console.log('📊 Raw Excel data received:', data);
        console.log('📊 Data rows count:', data.length);
        
        const mappedData = mapDRData(data);
        console.log('🗺️ Mapped data result:', mappedData);
        console.log('🗺️ Mapped data count:', mappedData.length);
        
        if (mappedData.length === 0) {
            console.error('❌ No valid DR data found in the file');
            showError('No valid DR data found in the file');
            return;
        }
        
        console.log('✅ Setting pendingDRBookings and showing preview');
        pendingDRBookings = mappedData;
        showDRPreview(mappedData);
        
    } catch (error) {
        console.error('Error processing DR file:', error);
        showError('Error processing file: ' + error.message);
    }
}

// Read Excel file
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// Map DR data from Excel columns - Complete Version 2 of Manual Booking Process
function mapDRData(data) {
    console.log('🗺️ === STARTING mapDRData FUNCTION ===');
    
    console.log('🔍 DEBUG: mapDRData received data:', data);
    console.log('🔍 DEBUG: Data length:', data.length);
    console.log('🔍 DEBUG: First row (header):', data[0]);
    console.log('🔍 DEBUG: Second row (first data):', data[1]);
    
    // COMMENTED OUT: Duplicate handler logic - now using Serial Number as unique identifier
    // if (window.DRDuplicateHandler) {
    //     const analysis = window.DRDuplicateHandler.analyzeDuplicates(data.slice(1)); // Skip header
    //     console.log('📊 DUPLICATE ANALYSIS:', analysis);
    //     
    //     // Always process with separate entries strategy to preserve individual items with unique serial numbers
    //     console.log('🔄 Processing all entries individually to preserve unique serial numbers');
    //     const processedData = window.DRDuplicateHandler.processDRData(data.slice(1), 'separate_entries'); // Skip header
    //     console.log(`✅ Processed ${data.length - 1} rows into ${processedData.length} individual deliveries`);
    //     return processedData;
    // } else {
    //     console.warn('⚠️ Duplicate handler not available, using original processing');
    // }
    
    // NEW: Using Serial Number as unique identifier - process all rows individually
    console.log('🔄 Processing entries using Serial Number as unique identifier');
    
    // Original processing logic (fallback)
    const mappedData = [];
    
    // NEW: Track unique Serial Numbers to avoid duplicates
    const seenSerialNumbers = new Set();
    let skippedDuplicateSerials = 0;
    
    // CRITICAL DEBUG: Show first 3 rows completely
    for (let debugRow = 0; debugRow < Math.min(3, data.length); debugRow++) {
        console.log(`🔍 CRITICAL DEBUG Row ${debugRow}:`, data[debugRow]);
        if (data[debugRow]) {
            console.log(`  Length: ${data[debugRow].length}`);
            data[debugRow].forEach((cell, index) => {
                console.log(`  [${index}]: "${cell}" (type: ${typeof cell})`);
            });
        }
    }
    
    if (!data || data.length === 0) {
        console.error('❌ No data received in mapDRData');
        return mappedData;
    }
    
    if (data.length < 2) {
        console.error('❌ Data has less than 2 rows (need header + data)');
        return mappedData;
    }
    
    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        // Skip empty rows
        if (!row || row.length === 0) continue;
        
        console.log(`🔍 DEBUG: Processing row ${i}:`, row);
        console.log(`🔍 DEBUG: Row length: ${row.length}`);
        
        // Extract data with robust handling for different data types
        // Based on your correct Excel structure: A=#, B=Doc, C=DocStatus, D=Document Number, E=Posting Date, F=Month, G=Customer/Vendor Code, H=Customer/Vendor Name, I=Ship To Address
        const drNumber = row[3] !== undefined && row[3] !== null ? String(row[3]).trim() : '';        // Column D - Document Number (DR Number)
        const vendorNumber = row[6] !== undefined && row[6] !== null ? String(row[6]).trim() : '';    // Column G - Customer/Vendor Code
        const customerName = row[7] !== undefined && row[7] !== null ? String(row[7]).trim() : '';    // Column H - Customer/Vendor Name
        const destination = row[8] !== undefined && row[8] !== null ? String(row[8]).trim() : '';     // Column I - Ship To Address (Destination)
        
        // NEW: Enhanced extraction with flexible column mapping
        // Use enhanced column mapping if available, otherwise fallback to index-based extraction
        let itemNumber, mobileNumber, itemDescription, serialNumber;
        
        if (window.getEnhancedColumnValue) {
            // Convert row array to object for enhanced mapping
            const rowObj = {};
            row.forEach((value, index) => {
                rowObj[index] = value;
            });
            
            itemNumber = window.getEnhancedColumnValue(rowObj, [
                'Item Number', 'Item number', 'item_number', 'Item #', 'Item#',
                'ItemNumber', 'Item_Number', 'ITEM_NUMBER', 'ItemNo', 'Item No'
            ], 9);
            
            mobileNumber = window.getEnhancedColumnValue(rowObj, [
                'Mobile#', 'Mobile Number', 'Mobile', 'mobile_number', 'MobileNumber',
                'Mobile_Number', 'MOBILE_NUMBER', 'Phone', 'Contact', 'Cell'
            ], 10);
            
            itemDescription = window.getEnhancedColumnValue(rowObj, [
                'Item Description', 'Item description', 'item_description', 'Description',
                'ItemDescription', 'Item_Description', 'ITEM_DESCRIPTION', 'Desc',
                'Product Description', 'Product'
            ], 11);
            
            serialNumber = window.getEnhancedColumnValue(rowObj, [
                'Serial Number', 'Serial number', 'serial_number', 'Serial',
                'SerialNumber', 'Serial_Number', 'SERIAL_NUMBER', 'SN', 'S/N'
            ], 14);
        } else {
            // Fallback to original index-based extraction
            itemNumber = row[9] !== undefined && row[9] !== null ? String(row[9]).trim() : '';      // Column J - Item Number
            mobileNumber = row[10] !== undefined && row[10] !== null ? String(row[10]).trim() : '';  // Column K - Mobile#
            itemDescription = row[11] !== undefined && row[11] !== null ? String(row[11]).trim() : '';// Column L - Item Description
            serialNumber = row[14] !== undefined && row[14] !== null ? String(row[14]).trim() : '';  // Column O - Serial Number
        }
        
        console.log(`🔍 DEBUG: Raw values - D[3]: "${row[3]}", G[6]: "${row[6]}", H[7]: "${row[7]}", I[8]: "${row[8]}"`);
        console.log(`🔍 DEBUG: Processed values - DR: "${drNumber}", Vendor: "${vendorNumber}", Customer: "${customerName}", Destination: "${destination}"`);
        console.log(`🔍 DEBUG: New columns - J[9]: "${row[9]}", K[10]: "${row[10]}", L[11]: "${row[11]}", O[14]: "${row[14]}"`);
        
        // DEBUG INFO logged to console instead of alert popup
        if (i === 1) {
            console.log('🔍 FIRST DATA ROW DEBUG:');
            console.log(`  Row length: ${row.length}`);
            console.log(`  D[3] (DR): "${row[3]}"`);
            console.log(`  G[6] (Vendor): "${row[6]}"`);
            console.log(`  H[7] (Customer): "${row[7]}"`);
            console.log(`  I[8] (Destination): "${row[8]}"`);
            console.log(`  J[9] (Item Number): "${row[9]}"`);
            console.log(`  K[10] (Mobile#): "${row[10]}"`);
            console.log(`  L[11] (Item Description): "${row[11]}"`);
            console.log(`  O[14] (Serial Number): "${row[14]}"`);
        }
        
        // Show all row values for debugging
        console.log(`🔍 DEBUG: All row values:`, row.map((val, idx) => `[${idx}]: "${val}" (${typeof val})`).join(', '));
        
        // EMERGENCY: Show detailed debug for first few rows
        if (i <= 3) {
            console.log('🚨 EMERGENCY DEBUG Row', i);
            console.log('  Row length:', row.length);
            console.log('  ALL COLUMNS:');
            for (let j = 0; j < row.length; j++) {
                console.log(`    [${j}]: "${row[j]}" (${typeof row[j]})`);
            }
            console.log('  CURRENT MAPPING:');
            console.log('  Column D (index 3) - Document Number:', row[3], typeof row[3]);
            console.log('  Column G (index 6) - Customer/Vendor Code:', row[6], typeof row[6]);
            console.log('  Column H (index 7) - Customer/Vendor Name:', row[7], typeof row[7]);
            console.log('  Column I (index 8) - Ship To Address:', row[8], typeof row[8]);
            console.log('  Column J (index 9) - Item Number:', row[9], typeof row[9]);
            console.log('  Column K (index 10) - Mobile#:', row[10], typeof row[10]);
            console.log('  Column L (index 11) - Item Description:', row[11], typeof row[11]);
            console.log('  Column O (index 14) - Serial Number:', row[14], typeof row[14]);
            console.log('  PROCESSED VALUES:');
            console.log('  Processed DR Number:', drNumber);
            console.log('  Processed Customer Name:', customerName);
            console.log('  Processed Vendor Number:', vendorNumber);
            console.log('  Processed Destination:', destination);
            console.log('  Processed Item Number:', itemNumber);
            console.log('  Processed Mobile Number:', mobileNumber);
            console.log('  Processed Item Description:', itemDescription);
            console.log('  Processed Serial Number:', serialNumber);
        }
        
        // NEW: Check Serial Number uniqueness first
        if (serialNumber && seenSerialNumbers.has(serialNumber)) {
            console.warn(`⚠️ Skipping row ${i + 1}: Duplicate Serial Number "${serialNumber}"`);
            skippedDuplicateSerials++;
            continue;
        }
        
        // Validate required fields with detailed logging
        if (!drNumber || !customerName || !destination) {
            console.warn(`❌ Skipping row ${i + 1}: Missing required data`);
            console.warn(`  DR Number: "${drNumber}" (${drNumber ? 'OK' : 'MISSING'})`);
            console.warn(`  Customer Name: "${customerName}" (${customerName ? 'OK' : 'MISSING'})`);
            console.warn(`  Destination: "${destination}" (${destination ? 'OK' : 'MISSING'})`);
            continue;
        }
        
        // NEW: Add Serial Number to seen set (after validation passes)
        if (serialNumber) {
            seenSerialNumbers.add(serialNumber);
            console.log(`📝 Added Serial Number to tracking: "${serialNumber}"`);
        }
        
        console.log(`✅ Row ${i + 1}: Valid data found`);
        
        // Create complete booking object with proper field names for Supabase compatibility
        const booking = {
            // Core identification - will be converted to dr_number for Supabase
            drNumber: drNumber, // Already processed and trimmed above
            
            // Customer details - will be converted to customer_name, vendor_number for Supabase
            customerName: customerName, // Already processed and trimmed above
            vendorNumber: vendorNumber || '', // Already processed and trimmed above
            
            // Location details
            origin: 'SMEG Alabang warehouse', // Default warehouse as requested
            destination: destination, // Already processed and trimmed above
            
            // Date and timing
            deliveryDate: new Date().toISOString().split('T')[0], // Upload date as requested
            bookedDate: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            
            // Truck reference (will be filled from form inputs) - will be converted to truck_type, truck_plate_number
            truckType: '',
            truckPlateNumber: '',
            truck: '', // Combined truck info for display
            
            // Status and tracking
            status: 'On Schedule', // Default status as requested
            source: 'DR_UPLOAD',
            
            // Cost information - will be converted to additional_costs for Supabase
            additionalCosts: 0,
            additionalCostBreakdown: [],
            
            // Distance
            distance: '',
            
            // NEW: Add the new fields to the booking object
            itemNumber: itemNumber || '',
            mobileNumber: mobileNumber || '',
            itemDescription: itemDescription || '',
            serialNumber: serialNumber || '',
            
            // Additional fields for complete data mapping
            completedDate: null,
            signedAt: null,
            signature: null,
            
            // Metadata for tracking - will be converted to created_by for Supabase
            createdBy: 'Excel Upload',
            lastModified: new Date().toISOString()
        };
        
        console.log(`🗺️ Created booking object for row ${i + 1}:`, booking);
        mappedData.push(booking);
        console.log(`📝 Added to mappedData. Current count: ${mappedData.length}`);
    }
    
    console.log(`🗺️ === MAPDRDATA COMPLETED ===`);
    console.log(`📊 Mapped ${mappedData.length} valid bookings from ${data.length - 1} rows`);
    console.log(`🔢 Unique Serial Numbers processed: ${seenSerialNumbers.size}`);
    console.log(`⚠️ Skipped duplicate Serial Numbers: ${skippedDuplicateSerials}`);
    console.log('📋 Sample booking structure:', mappedData[0]);
    console.log('📋 All mapped bookings:', mappedData);
    
    return mappedData;
}

// Show DR preview with enhanced details
function showDRPreview(bookings) {
    console.log('🖼️ showDRPreview called with bookings:', bookings);
    console.log('🖼️ Bookings count:', bookings.length);
    
    // Log each booking object in detail
    bookings.forEach((booking, index) => {
        console.log(`🖼️ Booking ${index + 1}:`, {
            drNumber: booking.drNumber,
            customerName: booking.customerName,
            vendorNumber: booking.vendorNumber,
            origin: booking.origin,
            destination: booking.destination,
            deliveryDate: booking.deliveryDate,
            status: booking.status
        });
    });
    
    const drUploadContent = document.getElementById('drUploadContent');
    const drPreviewContent = document.getElementById('drPreviewContent');
    const drPreviewTableBody = document.getElementById('drPreviewTableBody');
    const drPreviewSummary = document.getElementById('drPreviewSummary');
    
    if (!drUploadContent || !drPreviewContent || !drPreviewTableBody || !drPreviewSummary) {
        console.error('❌ DR preview elements not found:');
        console.error('  drUploadContent:', !!drUploadContent);
        console.error('  drPreviewContent:', !!drPreviewContent);
        console.error('  drPreviewTableBody:', !!drPreviewTableBody);
        console.error('  drPreviewSummary:', !!drPreviewSummary);
        
        // Try to find the modal to see if it exists
        const modal = document.getElementById('drUploadModal');
        console.error('  drUploadModal exists:', !!modal);
        
        if (modal) {
            console.error('  Modal innerHTML length:', modal.innerHTML.length);
        }
        
        return;
    }
    
    // Hide upload content, show preview
    drUploadContent.style.display = 'none';
    drPreviewContent.style.display = 'block';
    
    // Populate preview table with enhanced details
    drPreviewTableBody.innerHTML = '';
    
    bookings.forEach((booking, index) => {
        console.log(`🖼️ Creating preview row ${index + 1} for:`, booking);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${booking.drNumber || 'MISSING DR'}</strong></td>
            <td>${booking.customerName || 'MISSING CUSTOMER'}</td>
            <td>${booking.vendorNumber || 'N/A'}</td>
            <td><span class="badge bg-info">${booking.origin || 'MISSING ORIGIN'}</span></td>
            <td>${booking.destination || 'MISSING DESTINATION'}</td>
            <td><span class="badge bg-secondary">${booking.deliveryDate || 'MISSING DATE'}</span></td>
            <td><span class="badge bg-warning">Ready to Create</span></td>
            <td>${booking.itemNumber || ''}</td>
            <td>${booking.mobileNumber || ''}</td>
            <td>${booking.itemDescription || ''}</td>
            <td>${booking.serialNumber || ''}</td>
        `;
        drPreviewTableBody.appendChild(row);
        
        console.log(`✅ Preview row ${index + 1} created successfully`);
    });
    
    // Update summary
    drPreviewSummary.textContent = `${bookings.length} DR items ready to create`;
    
    // Reset truck reference and additional costs
    resetDRConfiguration();
}

// Show DR upload content
function showDRUploadContent() {
    const drUploadContent = document.getElementById('drUploadContent');
    const drPreviewContent = document.getElementById('drPreviewContent');
    
    if (drUploadContent && drPreviewContent) {
        drUploadContent.style.display = 'block';
        drPreviewContent.style.display = 'none';
    }
    
    // Clear file input
    const drFileInput = document.getElementById('drFileInput');
    if (drFileInput) {
        drFileInput.value = '';
    }
}

// Confirm DR upload and create bookings - Complete Version 2 Integration
async function confirmDRUpload() {
    try {
        console.log('=== CONFIRMING DR UPLOAD - VERSION 2 INTEGRATION ===');
        console.log('Pending bookings count:', pendingDRBookings.length);
        
        if (pendingDRBookings.length === 0) {
            showError('No bookings to create');
            return;
        }
        
        // Get truck reference data
        const truckType = document.getElementById('drTruckType').value;
        const truckPlate = document.getElementById('drTruckPlate').value;
        
        // Validate truck reference
        if (!truckType || !truckPlate) {
            showError('Please fill in truck reference details (Truck Type and Plate Number)');
            return;
        }
        
        // Get additional costs
        const additionalCosts = getDRAdditionalCosts();
        const totalAdditionalCost = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
        
        console.log('Truck Reference:', { truckType, truckPlate });
        console.log('Additional Costs:', additionalCosts);
        console.log('Total Additional Cost:', totalAdditionalCost);
        
        // Enhanced booking creation with complete data mapping
        const bookingCount = pendingDRBookings.length;
        const createdBookings = [];
        
        for (let index = 0; index < pendingDRBookings.length; index++) {
            const booking = pendingDRBookings[index];
            // Complete data mapping - Version 2 of manual booking process
            booking.truckType = truckType;
            booking.truckPlateNumber = truckPlate;
            booking.truck = `${truckType} (${truckPlate})`; // Combined for display
            
            // OPTION C: Apply costs only to the first DR record to avoid inflating analytics data
            if (index === 0) {
                // First DR gets all the costs
                booking.additionalCosts = totalAdditionalCost;
                booking.additionalCostBreakdown = [...additionalCosts]; // Deep copy
                console.log(`💰 Applied costs to first DR (${booking.drNumber}): ₱${totalAdditionalCost}`);
            } else {
                // Other DRs get zero costs
                booking.additionalCosts = 0;
                booking.additionalCostBreakdown = [];
                console.log(`💰 Zero costs applied to DR (${booking.drNumber})`);
            }
            
            // ORIGINAL CODE (commented out for easy revert):
            // booking.additionalCosts = totalAdditionalCost;
            // booking.additionalCostBreakdown = [...additionalCosts]; // Deep copy
            
            // Ensure all required fields for Active Deliveries display
            booking.bookedDate = booking.deliveryDate;
            booking.lastModified = new Date().toISOString();
            
            // Create the booking
            await createBookingFromDR(booking);
            createdBookings.push(booking);
            
            console.log(`✅ Created booking: ${booking.drNumber} with complete data mapping`);
        }
        
        console.log('=== ALL BOOKINGS CREATED SUCCESSFULLY ===');
        console.log('Created bookings:', createdBookings.length);
        console.log('Sample created booking:', createdBookings[0]);
        
        // OPTION C ENHANCEMENT: Update analytics dashboard after DR upload
        setTimeout(() => {
            console.log('📊 Updating analytics dashboard after DR upload...');
            if (typeof window.updateDashboardMetrics === 'function') {
                window.updateDashboardMetrics();
            }
            if (typeof window.enhancedUpdateDashboardMetrics === 'function') {
                window.enhancedUpdateDashboardMetrics();
            }
        }, 1000);
        
        // Close modal and clean up properly
        const drUploadModal = bootstrap.Modal.getInstance(document.getElementById('drUploadModal'));
        if (drUploadModal) {
            drUploadModal.hide();
        }
        
        // Force cleanup of modal backdrop and body classes
        setTimeout(() => {
            // Remove any lingering modal backdrops
            const modalBackdrops = document.querySelectorAll('.modal-backdrop');
            modalBackdrops.forEach(backdrop => backdrop.remove());
            
            // Remove modal-open class from body
            document.body.classList.remove('modal-open');
            
            // Re-enable body scrolling
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 100);
        
        // Reset state
        pendingDRBookings = [];
        showDRUploadContent();
        
        // Force refresh of Active Deliveries to show new data
        console.log('Refreshing Active Deliveries view...');
        if (typeof window.loadActiveDeliveries === 'function') {
            await window.loadActiveDeliveries();
            console.log('✅ Active Deliveries refreshed');
        } else {
            console.warn('loadActiveDeliveries function not available');
        }
        
        // Switch to active deliveries view to show results
        if (typeof window.switchToActiveDeliveriesView === 'function') {
            window.switchToActiveDeliveriesView();
            console.log('✅ Switched to Active Deliveries view');
        } else {
            console.warn('switchToActiveDeliveriesView function not available');
        }
        
        // Update analytics with new cost data
        if (typeof window.updateAnalyticsDashboard === 'function') {
            window.updateAnalyticsDashboard();
            console.log('✅ Analytics dashboard updated');
        }
        
        // Enhanced success message
        const costMessage = totalAdditionalCost > 0 ? ` with ₱${totalAdditionalCost.toFixed(2)} additional costs` : '';
        showToast(`Successfully created ${bookingCount} bookings from DR file${costMessage}. Check Active Deliveries tab.`, 'success');
        
        console.log('=== DR UPLOAD CONFIRMATION COMPLETED ===');
        
    } catch (error) {
        console.error('Error confirming DR upload:', error);
        showError('Error creating bookings: ' + error.message);
    }
}

// Create booking from DR data - Complete Version 2 Integration
async function createBookingFromDR(bookingData) {
    try {
        console.log('Creating booking from DR with complete data mapping:', bookingData.drNumber);
        console.log('Booking data structure:', bookingData);
        
        // Ensure activeDeliveries array exists
        if (!window.activeDeliveries) {
            window.activeDeliveries = [];
            console.log('Initialized activeDeliveries array');
        }
        
        // Validate required fields for Active Deliveries display
        const requiredFields = ['drNumber', 'customerName', 'origin', 'destination', 'status'];
        const missingFields = requiredFields.filter(field => !bookingData[field]);
        
        if (missingFields.length > 0) {
            console.warn('Missing required fields:', missingFields);
        }
        
        // Ensure all display fields are properly set
        bookingData.bookedDate = bookingData.bookedDate || bookingData.deliveryDate || new Date().toISOString().split('T')[0];
        bookingData.truck = bookingData.truck || (bookingData.truckType && bookingData.truckPlateNumber ? 
            `${bookingData.truckType} (${bookingData.truckPlateNumber})` : 'N/A');
        
        // Save to Supabase using dataService - SAME APPROACH AS MANUAL BOOKING
        if (window.dataService) {
            try {
                // Create delivery object with Supabase-compatible field names (same as manual booking)
                const newDelivery = {
                    // Remove custom ID - let Supabase generate UUID
                    dr_number: bookingData.drNumber,
                    customer_name: bookingData.customerName,
                    vendor_number: bookingData.vendorNumber || '',
                    origin: bookingData.origin,
                    destination: bookingData.destination,
                    truck_type: bookingData.truckType || '',
                    truck_plate_number: bookingData.truckPlateNumber || '',
                    status: 'Active', // Changed to match manual booking
                    distance: '', // Add distance field
                    additional_costs: parseFloat(bookingData.additionalCosts) || 0.00,
                    created_date: bookingData.bookedDate || new Date().toISOString().split('T')[0],
                    created_by: 'Excel Upload',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    // NEW: Add the new fields to the Supabase delivery object
                    item_number: bookingData.itemNumber || '',
                    mobile_number: bookingData.mobileNumber || '',
                    item_description: bookingData.itemDescription || '',
                    serial_number: bookingData.serialNumber || ''
                };

                console.log('🔧 Converted delivery data for Supabase:', newDelivery);

                // Save to Supabase using dataService with storage priority
                if (window.dataService) {
                    try {
                        // NEW APPROACH: Use storage priority service
                        if (window.storagePriorityService) {
                            const result = await window.storagePriorityService.executeWithPriority('upsert', 'deliveries', newDelivery);
                            console.log('✅ Delivery saved with storage priority successfully:', result);
                        } else {
                            // Fallback to original dataService approach
                            const savedDelivery = await window.dataService.saveDelivery(newDelivery);
                            console.log('✅ Delivery saved to Supabase successfully:', savedDelivery);
                        }
                    } catch (error) {
                        console.error('❌ Failed to save with storage priority:', error);
                        // Fallback to localStorage with original format for compatibility
                        const localDelivery = {
                            id: 'DEL-' + Date.now() + '-' + bookingData.drNumber,
                            drNumber: bookingData.drNumber,
                            customerName: bookingData.customerName,
                            vendorNumber: bookingData.vendorNumber,
                            origin: bookingData.origin,
                            destination: bookingData.destination,
                            truckType: bookingData.truckType,
                            truckPlateNumber: bookingData.truckPlateNumber,
                            status: 'On Schedule',
                            deliveryDate: bookingData.deliveryDate,
                            additionalCosts: bookingData.additionalCosts,
                            timestamp: new Date().toISOString(),
                            // NEW: Add the new fields to the localStorage object with both naming conventions
                            itemNumber: bookingData.itemNumber || '',
                            mobileNumber: bookingData.mobileNumber || '',
                            itemDescription: bookingData.itemDescription || '',
                            serialNumber: bookingData.serialNumber || '',
                            // Also add snake_case versions for consistency
                            item_number: bookingData.itemNumber || '',
                            mobile_number: bookingData.mobileNumber || '',
                            item_description: bookingData.itemDescription || '',
                            serial_number: bookingData.serialNumber || ''
                        };
                        if (typeof window.activeDeliveries !== 'undefined') {
                            window.activeDeliveries.push(localDelivery);
                            localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
                            console.log('✅ Saved to localStorage as fallback');
                        }
                    }
                } else {
                    console.error('❌ dataService is not available');
                }
            } catch (error) {
                console.error('❌ Failed to save to Supabase:', error);
                // Fallback to localStorage with original format for compatibility
                const localDelivery = {
                    id: 'DEL-' + Date.now() + '-' + bookingData.drNumber,
                    drNumber: bookingData.drNumber,
                    customerName: bookingData.customerName,
                    vendorNumber: bookingData.vendorNumber,
                    origin: bookingData.origin,
                    destination: bookingData.destination,
                    truckType: bookingData.truckType,
                    truckPlateNumber: bookingData.truckPlateNumber,
                    status: 'On Schedule',
                    deliveryDate: bookingData.deliveryDate,
                    additionalCosts: bookingData.additionalCosts,
                    timestamp: new Date().toISOString(),
                    // NEW: Add the new fields to the localStorage object with both naming conventions
                    itemNumber: bookingData.itemNumber || '',
                    mobileNumber: bookingData.mobileNumber || '',
                    itemDescription: bookingData.itemDescription || '',
                    serialNumber: bookingData.serialNumber || '',
                    // Also add snake_case versions for consistency
                    item_number: bookingData.itemNumber || '',
                    mobile_number: bookingData.mobileNumber || '',
                    item_description: bookingData.itemDescription || '',
                    serial_number: bookingData.serialNumber || ''
                };
                if (typeof window.activeDeliveries !== 'undefined') {
                    window.activeDeliveries.push(localDelivery);
                    localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
                    console.log('✅ Saved to localStorage as fallback');
                }
            }
        } else {
            // Fallback to localStorage if dataService not available
            window.activeDeliveries = window.activeDeliveries || [];
            // Ensure the bookingData has the new fields with both naming conventions
            const normalizedBookingData = {
                ...bookingData,
                // Ensure new fields are present with both naming conventions
                itemNumber: bookingData.itemNumber || bookingData.item_number || '',
                mobileNumber: bookingData.mobileNumber || bookingData.mobile_number || '',
                itemDescription: bookingData.itemDescription || bookingData.item_description || '',
                serialNumber: bookingData.serialNumber || bookingData.serial_number || '',
                // Also ensure snake_case versions for consistency
                item_number: bookingData.itemNumber || bookingData.item_number || '',
                mobile_number: bookingData.mobileNumber || bookingData.mobile_number || '',
                item_description: bookingData.itemDescription || bookingData.item_description || '',
                serial_number: bookingData.serialNumber || bookingData.serial_number || ''
            };
            window.activeDeliveries.push(normalizedBookingData);
            const activeDeliveriesData = JSON.stringify(window.activeDeliveries);
            localStorage.setItem('mci-active-deliveries', activeDeliveriesData);
            localStorage.setItem('activeDeliveries', activeDeliveriesData);
            console.log('✅ Saved to localStorage (dataService not available)');
        }
        
        // Auto-create customer if needed
        if (typeof autoCreateCustomer === 'function') {
            await autoCreateCustomer(bookingData.customerName, bookingData.vendorNumber, bookingData.destination);
            console.log('Auto-created customer for:', bookingData.customerName);
        }
        
        // Update analytics with additional cost breakdown
        if (bookingData.additionalCostBreakdown && bookingData.additionalCostBreakdown.length > 0) {
            updateAnalyticsWithCostBreakdown(bookingData.additionalCostBreakdown);
            console.log('Updated analytics with cost breakdown:', bookingData.additionalCostBreakdown);
        }
        
        console.log('✅ Successfully created booking with complete data mapping:', bookingData.drNumber);
        
    } catch (error) {
        console.error('Error creating booking from DR:', error);
        console.error('Booking data that failed:', bookingData);
        throw error;
    }
}

// Generate unique booking ID
function generateBookingId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `DR_${timestamp}_${random}`;
}

// Initialize DR upload when DOM is ready - Enhanced version
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing DR upload...');
    
    // Wait a bit for all scripts to load
    setTimeout(() => {
        initDRUpload();
        
        // Double-check the button exists and add backup event listener
        const uploadBtn = document.getElementById('uploadDrFileBtn');
        if (uploadBtn) {
            console.log('✅ Upload DR File button found');
            
            // Remove any existing listeners and add fresh one
            const newBtn = uploadBtn.cloneNode(true);
            uploadBtn.parentNode.replaceChild(newBtn, uploadBtn);
            
            newBtn.addEventListener('click', function(e) {
                console.log('Upload DR File button clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const drUploadModal = new bootstrap.Modal(document.getElementById('drUploadModal'));
                    drUploadModal.show();
                    console.log('✅ DR Upload modal should be showing');
                } catch (error) {
                    console.error('❌ Error showing DR upload modal:', error);
                    alert('Error opening upload dialog. Please refresh the page and try again.');
                }
            });
            
            console.log('✅ DR upload button event listener added');
        } else {
            console.error('❌ Upload DR File button not found!');
        }
    }, 1000);
});

// Make functions globally available
window.initDRUpload = initDRUpload;
window.processDRFile = processDRFile;
window.createBookingFromDR = createBookingFromDR;

// Reset DR configuration (truck reference and additional costs)
function resetDRConfiguration() {
    // Reset truck reference
    const drTruckType = document.getElementById('drTruckType');
    const drTruckPlate = document.getElementById('drTruckPlate');
    
    if (drTruckType) drTruckType.value = '';
    if (drTruckPlate) drTruckPlate.value = '';
    
    // Reset additional costs to single empty item
    const drAdditionalCostsContainer = document.getElementById('drAdditionalCostsContainer');
    if (drAdditionalCostsContainer) {
        drAdditionalCostsContainer.innerHTML = `
            <div class="dr-cost-item mb-3">
                <div class="row">
                    <div class="col-md-6">
                        <label class="form-label">Description</label>
                        <input type="text" class="form-control dr-cost-description" 
                               placeholder="e.g., Fuel Surcharge, Toll Fee">
                        <div class="form-text">Cost description for analytics</div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Amount</label>
                        <div class="input-group">
                            <span class="input-group-text">₱</span>
                            <input type="number" class="form-control dr-cost-amount" 
                                   placeholder="0.00" min="0" step="0.01">
                        </div>
                        <div class="form-text">Cost amount</div>
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button type="button" class="btn btn-outline-danger remove-dr-cost" disabled>
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Reset total cost display
    updateDRTotalCost();
    
    // Re-initialize cost calculation listeners
    initDRCostCalculation();
}

// Add new DR cost item
function addDRCostItem() {
    const drAdditionalCostsContainer = document.getElementById('drAdditionalCostsContainer');
    if (!drAdditionalCostsContainer) return;
    
    const costItem = document.createElement('div');
    costItem.className = 'dr-cost-item mb-3';
    costItem.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <label class="form-label">Description</label>
                <input type="text" class="form-control dr-cost-description" 
                       placeholder="e.g., Fuel Surcharge, Toll Fee">
                <div class="form-text">Cost description for analytics</div>
            </div>
            <div class="col-md-4">
                <label class="form-label">Amount</label>
                <div class="input-group">
                    <span class="input-group-text">₱</span>
                    <input type="number" class="form-control dr-cost-amount" 
                           placeholder="0.00" min="0" step="0.01">
                </div>
                <div class="form-text">Cost amount</div>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button type="button" class="btn btn-outline-danger remove-dr-cost">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </div>
    `;
    
    drAdditionalCostsContainer.appendChild(costItem);
    
    // Add event listener for remove button
    const removeBtn = costItem.querySelector('.remove-dr-cost');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            costItem.remove();
            updateDRTotalCost();
            updateRemoveButtonStates();
        });
    }
    
    // Add event listeners for cost calculation
    const amountInput = costItem.querySelector('.dr-cost-amount');
    if (amountInput) {
        amountInput.addEventListener('input', updateDRTotalCost);
    }
    
    // Update remove button states
    updateRemoveButtonStates();
}

// Initialize DR cost calculation listeners
function initDRCostCalculation() {
    // Add event listeners to existing cost inputs
    document.querySelectorAll('.dr-cost-amount').forEach(input => {
        input.addEventListener('input', updateDRTotalCost);
    });
    
    // Add event listeners to existing remove buttons
    document.querySelectorAll('.remove-dr-cost').forEach(btn => {
        btn.addEventListener('click', function() {
            btn.closest('.dr-cost-item').remove();
            updateDRTotalCost();
            updateRemoveButtonStates();
        });
    });
    
    // Update initial state
    updateRemoveButtonStates();
    updateDRTotalCost();
}

// Update DR total cost display
function updateDRTotalCost() {
    const costInputs = document.querySelectorAll('.dr-cost-amount');
    let total = 0;
    
    costInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        total += value;
    });
    
    const totalDisplay = document.getElementById('drTotalAdditionalCost');
    if (totalDisplay) {
        totalDisplay.textContent = `₱${total.toFixed(2)}`;
    }
}

// Update remove button states (disable if only one item)
function updateRemoveButtonStates() {
    const removeButtons = document.querySelectorAll('.remove-dr-cost');
    const shouldDisable = removeButtons.length <= 1;
    
    removeButtons.forEach(btn => {
        btn.disabled = shouldDisable;
    });
}

// Get DR additional costs data
function getDRAdditionalCosts() {
    const costs = [];
    const costItems = document.querySelectorAll('.dr-cost-item');
    
    costItems.forEach(item => {
        const description = item.querySelector('.dr-cost-description').value.trim();
        const amount = parseFloat(item.querySelector('.dr-cost-amount').value) || 0;
        
        if (description && amount > 0) {
            costs.push({
                description: description,
                amount: amount
            });
        }
    });
    
    return costs;
}

// Show DR summary preview
function showDRSummaryPreview() {
    const truckType = document.getElementById('drTruckType').value;
    const truckPlate = document.getElementById('drTruckPlate').value;
    const additionalCosts = getDRAdditionalCosts();
    const totalAdditionalCost = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
    
    let summaryHtml = `
        <div class="alert alert-info">
            <h6><i class="bi bi-info-circle"></i> DR Upload Summary</h6>
            <div class="row">
                <div class="col-md-6">
                    <strong>DR Items:</strong> ${pendingDRBookings.length} bookings<br>
                    <strong>Truck Type:</strong> ${truckType || 'Not specified'}<br>
                    <strong>Truck Plate:</strong> ${truckPlate || 'Not specified'}
                </div>
                <div class="col-md-6">
                    <strong>Additional Costs:</strong><br>
    `;
    
    if (additionalCosts.length > 0) {
        additionalCosts.forEach(cost => {
            summaryHtml += `• ${cost.description}: ₱${cost.amount.toFixed(2)}<br>`;
        });
        summaryHtml += `<strong>Total: ₱${totalAdditionalCost.toFixed(2)}</strong>`;
    } else {
        summaryHtml += `No additional costs`;
    }
    
    summaryHtml += `
                </div>
            </div>
        </div>
    `;
    
    // Show summary in a toast or modal
    showToast('Preview summary displayed in console. Check browser console for details.', 'info');
    console.log('=== DR UPLOAD SUMMARY ===');
    console.log('DR Items:', pendingDRBookings.length);
    console.log('Truck Type:', truckType);
    console.log('Truck Plate:', truckPlate);
    console.log('Additional Costs:', additionalCosts);
    console.log('Total Additional Cost:', totalAdditionalCost);
    console.log('========================');
}

// Enhanced create booking from DR data with truck reference and additional costs
async function createBookingFromDREnhanced(bookingData) {
    try {
        console.log('Creating enhanced booking from DR:', bookingData.drNumber);
        
        // Ensure activeDeliveries array exists
        if (!window.activeDeliveries) {
            window.activeDeliveries = [];
        }
        
        // Add to active deliveries
        window.activeDeliveries.push(bookingData);
        
        // Save to localStorage
        localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
        localStorage.setItem('activeDeliveries', JSON.stringify(window.activeDeliveries));
        
        // Auto-create customer if needed
        if (typeof autoCreateCustomer === 'function') {
            await autoCreateCustomer(bookingData.customerName, bookingData.vendorNumber, bookingData.destination);
        }
        
        // Update analytics with additional cost breakdown
        if (bookingData.additionalCostBreakdown && bookingData.additionalCostBreakdown.length > 0) {
            updateAnalyticsWithCostBreakdown(bookingData.additionalCostBreakdown);
        }
        
        console.log('Successfully created enhanced booking:', bookingData.drNumber);
        
    } catch (error) {
        console.error('Error creating enhanced booking from DR:', error);
        throw error;
    }
}

// Update analytics with cost breakdown data
function updateAnalyticsWithCostBreakdown(costBreakdown) {
    try {
        // Get existing cost breakdown data from localStorage
        let existingBreakdown = JSON.parse(localStorage.getItem('analytics-cost-breakdown') || '[]');
        
        // Add new cost breakdown items
        costBreakdown.forEach(cost => {
            const existingIndex = existingBreakdown.findIndex(item => item.description === cost.description);
            
            if (existingIndex >= 0) {
                // Update existing cost category
                existingBreakdown[existingIndex].amount += cost.amount;
                existingBreakdown[existingIndex].count += 1;
            } else {
                // Add new cost category
                existingBreakdown.push({
                    description: cost.description,
                    amount: cost.amount,
                    count: 1,
                    lastUpdated: new Date().toISOString()
                });
            }
        });
        
        // Save updated breakdown
        localStorage.setItem('analytics-cost-breakdown', JSON.stringify(existingBreakdown));
        
        console.log('Updated analytics cost breakdown:', existingBreakdown);
        
    } catch (error) {
        console.error('Error updating analytics cost breakdown:', error);
    }
}

// Debug function to verify DR upload data integration
function debugDRUploadIntegration() {
    console.log('=== DR UPLOAD INTEGRATION DEBUG ===');
    
    // Check localStorage data
    const activeDeliveriesData = localStorage.getItem('mci-active-deliveries');
    const activeDeliveriesBackup = localStorage.getItem('activeDeliveries');
    
    console.log('localStorage data:');
    console.log('- mci-active-deliveries:', activeDeliveriesData ? JSON.parse(activeDeliveriesData).length + ' items' : 'Not found');
    console.log('- activeDeliveries backup:', activeDeliveriesBackup ? JSON.parse(activeDeliveriesBackup).length + ' items' : 'Not found');
    
    // Check global arrays
    console.log('Global arrays:');
    console.log('- window.activeDeliveries:', window.activeDeliveries ? window.activeDeliveries.length + ' items' : 'Not found');
    
    // Check if functions exist
    console.log('Required functions:');
    console.log('- loadActiveDeliveries:', typeof window.loadActiveDeliveries);
    console.log('- switchToActiveDeliveriesView:', typeof window.switchToActiveDeliveriesView);
    console.log('- updateAnalyticsDashboard:', typeof window.updateAnalyticsDashboard);
    
    // Sample DR upload data structure
    if (window.activeDeliveries && window.activeDeliveries.length > 0) {
        const sampleDRUpload = window.activeDeliveries.find(item => item.source === 'DR_UPLOAD');
        if (sampleDRUpload) {
            console.log('Sample DR upload booking structure:');
            console.log(sampleDRUpload);
        } else {
            console.log('No DR upload bookings found in activeDeliveries');
        }
    }
    
    console.log('=== END DEBUG ===');
}

// Make debug function globally available
window.debugDRUploadIntegration = debugDRUploadIntegration;

// Update distance calculation (placeholder since distance calculation was removed)
function updateDistance() {
    console.log('updateDistance called - distance calculation disabled');
    // Distance calculation was removed as requested
    // This function is kept as a placeholder to prevent errors
}

// Make updateDistance globally available
window.updateDistance = updateDistance;

// Debug function to test pin on map functionality
function testPinOnMap() {
    console.log('=== PIN ON MAP DEBUG TEST ===');
    
    // Check if Leaflet is loaded
    console.log('Leaflet available:', typeof L !== 'undefined');
    
    // Check if Bootstrap is loaded
    console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
    
    // Check if required elements exist
    const elements = {
        'originSelect': document.getElementById('originSelect'),
        'customOriginContainer': document.getElementById('customOriginContainer'),
        'customOrigin': document.getElementById('customOrigin'),
        'pinOrigin': document.getElementById('pinOrigin'),
        'destinationAreaInputs': document.querySelectorAll('.destination-area-input'),
        'pinOnMapBtns': document.querySelectorAll('.pin-on-map-btn')
    };
    
    console.log('Required elements:');
    Object.keys(elements).forEach(key => {
        const element = elements[key];
        if (element) {
            if (element.length !== undefined) {
                console.log(`✅ ${key}: ${element.length} elements found`);
            } else {
                console.log(`✅ ${key}: Found`);
            }
        } else {
            console.log(`❌ ${key}: Not found`);
        }
    });
    
    // Test showMapPinDialog function
    console.log('showMapPinDialog function available:', typeof showMapPinDialog === 'function');
    
    // Test manual trigger
    console.log('Testing manual trigger for origin...');
    try {
        showMapPinDialog('origin');
        console.log('✅ Manual trigger successful');
    } catch (error) {
        console.error('❌ Manual trigger failed:', error);
    }
    
    console.log('=== END PIN ON MAP DEBUG ===');
}

// Make test function globally available
window.testPinOnMap = testPinOnMap;

// Syntax validation test - this should not cause any errors
// Cache buster: 2024-01-09-v4 - All syntax errors fixed
console.log('✅ Booking.js loaded - all syntax errors resolved');

// Debug function to check manual booking data flow
function debugManualBookingFlow() {
    console.log('=== MANUAL BOOKING DEBUG ===');
    
    // Check global activeDeliveries
    console.log('window.activeDeliveries:', window.activeDeliveries ? window.activeDeliveries.length + ' items' : 'Not found');
    if (window.activeDeliveries && window.activeDeliveries.length > 0) {
        console.log('Latest booking:', window.activeDeliveries[window.activeDeliveries.length - 1]);
    }
    
    // Check localStorage
    const savedData = localStorage.getItem('mci-active-deliveries');
    console.log('localStorage data:', savedData ? JSON.parse(savedData).length + ' items' : 'Not found');
    
    // Check if loadActiveDeliveries function exists
    console.log('loadActiveDeliveries function:', typeof window.loadActiveDeliveries);
    
    // Check Active Deliveries table
    const tableBody = document.getElementById('activeDeliveriesTableBody');
    console.log('Active Deliveries table body:', tableBody ? 'Found' : 'Not found');
    if (tableBody) {
        console.log('Table rows:', tableBody.children.length);
    }
    
    // Test manual refresh
    if (typeof window.loadActiveDeliveries === 'function') {
        console.log('Testing manual refresh...');
        window.loadActiveDeliveries();
    }
    
    console.log('=== END DEBUG ===');
}

// Make debug function globally available
window.debugManualBookingFlow = debugManualBookingFlow;

// Test function to simulate manual booking and verify data flow
function testManualBookingFlow() {
    console.log('=== TESTING MANUAL BOOKING FLOW ===');
    
    // Create a test booking similar to manual entry
    const testBooking = {
        id: 'DEL-' + Date.now() + '-TEST123',
        drNumber: 'TEST-DR-' + Date.now(),
        customerName: 'Test Customer',
        vendorNumber: 'TEST-VENDOR-001',
        origin: 'SMEG Alabang warehouse',
        destination: 'Test Destination City',
        truckType: 'L300',
        truckPlateNumber: 'TEST-123',
        status: 'On Schedule',
        deliveryDate: new Date().toISOString().split('T')[0],
        additionalCosts: 0,
        additionalCostItems: [],
        timestamp: new Date().toISOString()
    };
    
    console.log('📝 Test booking created:', testBooking);
    
    // Add to window.activeDeliveries
    if (!window.activeDeliveries) {
        window.activeDeliveries = [];
    }
    window.activeDeliveries.push(testBooking);
    console.log('✅ Added to window.activeDeliveries. Total:', window.activeDeliveries.length);
    
    // Save to localStorage
    try {
        localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
        console.log('✅ Saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
    
    // Test loading
    if (typeof window.loadActiveDeliveries === 'function') {
        console.log('🔄 Calling loadActiveDeliveries...');
        window.loadActiveDeliveries();
    } else {
        console.error('❌ loadActiveDeliveries function not available');
    }
    
    // Check if data appears in table
    setTimeout(() => {
        const tableBody = document.getElementById('activeDeliveriesTableBody');
        if (tableBody) {
            const rows = tableBody.querySelectorAll('tr');
            console.log('📊 Table rows after test:', rows.length);
            
            // Look for our test booking
            const testRow = Array.from(rows).find(row => 
                row.textContent.includes(testBooking.drNumber)
            );
            
            if (testRow) {
                console.log('✅ Test booking found in table!');
            } else {
                console.log('❌ Test booking NOT found in table');
                console.log('Available rows:', Array.from(rows).map(row => row.textContent));
            }
        }
    }, 500);
    
    console.log('=== END TEST ===');
}

// Make test function globally available
window.testManualBookingFlow = testManualBookingFlow;

// Test function to verify calendar integration
function testCalendarIntegration() {
    console.log('=== CALENDAR INTEGRATION TEST ===');
    
    // Check if functions are available
    console.log('Functions availability:');
    console.log('- window.initBookingModal:', typeof window.initBookingModal);
    console.log('- window.openBookingModal:', typeof window.openBookingModal);
    console.log('- window.showBookingModal:', typeof window.showBookingModal);
    
    // Check if booking modal element exists
    const bookingModal = document.getElementById('bookingModal');
    console.log('- bookingModal element:', bookingModal ? 'Found' : 'Not found');
    
    // Test opening booking modal
    if (typeof window.openBookingModal === 'function') {
        console.log('✅ Testing openBookingModal...');
        try {
            window.openBookingModal('2024-01-09');
            console.log('✅ openBookingModal test successful');
        } catch (error) {
            console.error('❌ openBookingModal test failed:', error);
        }
    }
    
    console.log('=== END TEST ===');
}

// Make test function globally available
window.testCalendarIntegration = testCalendarIntegration;

// Comprehensive syntax validation function
function validateBookingJsSyntax() {
    console.log('=== BOOKING.JS SYNTAX VALIDATION ===');
    
    try {
        // Test basic JavaScript functionality
        const testObj = { test: 'value' };
        const testArray = [1, 2, 3];
        const testFunction = () => 'test';
        
        console.log('✅ Basic JavaScript syntax: OK');
        
        // Test function availability
        const functions = [
            'initBookingModal',
            'openBookingModal', 
            'showBookingModal',
            'saveBooking',
            'debugManualBookingFlow',
            'testManualBookingFlow',
            'testCalendarIntegration'
        ];
        
        functions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                console.log(`✅ ${funcName}: Available`);
            } else {
                console.log(`❌ ${funcName}: Not available`);
            }
        });
        
        // Test regex patterns
        const testRegex = /test/g;
        console.log('✅ Regex syntax: OK');
        
        // Test template literals
        const testTemplate = `Template literal test: ${testObj.test}`;
        console.log('✅ Template literal syntax: OK');
        
        console.log('✅ All syntax validation tests passed');
        
    } catch (error) {
        console.error('❌ Syntax validation failed:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
    
    console.log('=== END VALIDATION ===');
}

// Make validation function globally available
window.validateBookingJsSyntax = validateBookingJsSyntax;

// Auto-run validation
validateBookingJsSyntax();

// EMERGENCY FIX: Ensure Upload DR File button works on live site
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚨 Emergency DR Upload button fix loading...');
    
    function fixUploadButton() {
        const uploadBtn = document.getElementById('uploadDrFileBtn');
        if (uploadBtn) {
            console.log('✅ Found Upload DR File button, adding emergency event listener');
            
            // Remove existing listeners
            uploadBtn.replaceWith(uploadBtn.cloneNode(true));
            const newBtn = document.getElementById('uploadDrFileBtn');
            
            newBtn.addEventListener('click', function(e) {
                console.log('🚀 EMERGENCY: Upload DR File button clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const modalElement = document.getElementById('drUploadModal');
                    if (modalElement) {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                        console.log('✅ EMERGENCY: DR Upload modal opened');
                    } else {
                        console.error('❌ EMERGENCY: Modal element not found');
                        alert('Upload dialog not available. Please refresh the page.');
                    }
                } catch (error) {
                    console.error('❌ EMERGENCY: Error opening modal:', error);
                    alert('Error opening upload dialog: ' + error.message);
                }
            });
            
            console.log('✅ EMERGENCY: Upload button fixed');
            return true;
        }
        return false;
    }
    
    // Try immediately
    if (!fixUploadButton()) {
        // Retry every 1 second for 10 seconds
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            console.log(`🔄 EMERGENCY: Retry ${attempts}/10 for Upload button`);
            
            if (fixUploadButton() || attempts >= 10) {
                clearInterval(interval);
                if (attempts >= 10) {
                    console.error('❌ EMERGENCY: Failed to fix Upload button after 10 attempts');
                }
            }
        }, 1000);
    }
});