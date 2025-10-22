// Initialize global data arrays for Supabase-centric delivery system
if (typeof window.activeDeliveries === 'undefined') {
    window.activeDeliveries = [];
    console.log('✅ Initialized window.activeDeliveries array (Supabase-centric)');
}

if (typeof window.deliveryHistory === 'undefined') {
    window.deliveryHistory = [];
    console.log('✅ Initialized window.deliveryHistory array (Supabase-centric)');
}

// SUPABASE-CENTRIC: Clear any existing localStorage data to prevent conflicts
try {
    // Clear old localStorage keys that might interfere with Supabase data
    const localStorageKeys = [
        'mci-active-deliveries',
        'mci-delivery-history', 
        'deliveries',
        'deliveryHistory',
        'activeDeliveries',
        'completedDeliveries'
    ];
    
    localStorageKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ Cleared localStorage key: ${key}`);
        }
    });
    
    console.log('✅ localStorage cleared - app is now fully Supabase-centric');
} catch (error) {
    console.warn('Warning clearing localStorage:', error);
}

// Data will be loaded from Supabase when needed
console.log('📡 App configured for Supabase-only data source');

// Main application initialization
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all views
    const views = {
        booking: document.getElementById('bookingView'),
        analytics: document.getElementById('analyticsView'),
        'active-deliveries': document.getElementById('activeDeliveriesView'),
        'delivery-history': document.getElementById('deliveryHistoryView'),
        customers: document.getElementById('customersView'),
        'warehouse-map': document.getElementById('warehouseMapView'),
        settings: document.getElementById('settingsView'),
        'e-pod': document.getElementById('ePodView')
    };

    // Initialize sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const sidebar = document.querySelector('.sidebar');

    // Remove any existing event listeners to prevent duplicates
    const newMobileToggle = mobileToggle ? mobileToggle.cloneNode(true) : null;
    if (newMobileToggle && mobileToggle) {
        mobileToggle.parentNode.replaceChild(newMobileToggle, mobileToggle);
        newMobileToggle.addEventListener('click', function () {
            sidebar.classList.toggle('show');
        });
    }

    // Sidebar navigation with proper event listener cleanup
    sidebarLinks.forEach(link => {
        // Remove existing event listeners by cloning
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Update active state in sidebar
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Hide all views
            Object.values(views).forEach(view => {
                if (view) view.classList.remove('active');
            });

            // Show selected view
            const viewName = this.dataset.view;
            console.log('Switching to view:', viewName);
            if (views[viewName]) {
                console.log('View element found:', views[viewName]);
                views[viewName].classList.add('active');
                console.log('View is now active:', views[viewName].classList.contains('active'));

                // Special handling for analytics view
                if (viewName === 'analytics') {
                    // Initialize charts when analytics view is shown
                    initAnalyticsCharts('day');
                }

                // Special handling for settings view
                if (viewName === 'settings') {
                    // Ensure logout button is properly connected when Settings view is shown
                    setTimeout(function() {
                        const logoutBtn = document.getElementById('logoutBtn');
                        console.log('🔍 Settings view active - checking logout button:', logoutBtn);
                        
                        if (logoutBtn && !logoutBtn.hasAttribute('data-logout-attached')) {
                            console.log('✅ Attaching direct logout event listener');
                            logoutBtn.setAttribute('data-logout-attached', 'true');
                            
                            logoutBtn.addEventListener('click', function(e) {
                                console.log('🔴 LOGOUT BUTTON CLICKED (DIRECT)!');
                                e.preventDefault();
                                e.stopPropagation();
                                logout();
                            });
                        }
                    }, 100);
                }

                // Special handling for active deliveries view
                if (viewName === 'active-deliveries') {
                    // Don't reload data, just refresh the display to preserve status changes
                    if (typeof populateActiveDeliveriesTable === 'function') {
                        populateActiveDeliveriesTable();
                    } else {
                        // Only load data if no data exists
                        if (!window.activeDeliveries || window.activeDeliveries.length === 0) {
                            loadActiveDeliveries();
                        }
                    }
                    // Initialize E-POD functionality for E-Signature button
                    initEPod();
                }

                // Special handling for delivery history view
                if (viewName === 'delivery-history') {
                    loadDeliveryHistory();
                }

                // Special handling for E-POD view
                if (viewName === 'e-pod') {
                    console.log('EPOD tab clicked, loading EPOD deliveries');
                    initEPod();
                }
                
                // Special handling for Customers view
                if (viewName === 'customers') {
                    loadCustomers();
                }

                // Special handling for Warehouse Map view
                if (viewName === 'warehouse-map') {
                    loadWarehouses();
                }
            }

            // Close sidebar on mobile after selection
            if (window.innerWidth < 768) {
                sidebar.classList.remove('show');
            }
        });
    });

    // Initialize calendar
    initCalendar();

    // Initialize booking modal interactions
    initBookingModal();

    // Initialize settings panels
    if (window.initSettingsPanels) {
        initSettingsPanels();
    }

    // Initialize analytics charts (only if analytics view is visible initially)
    if (views.analytics && views.analytics.classList.contains('active')) {
        initAnalyticsCharts('day');
    }

    // Initialize user session
    initAuth();
    
    // Initialize profile form when settings modal is opened
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.addEventListener('show.bs.modal', function() {
            const savedUser = localStorage.getItem('mci-user');
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    const firstNameEl = document.getElementById('profileFirstName');
                    const lastNameEl = document.getElementById('profileLastName');
                    const emailEl = document.getElementById('profileEmail');
                    
                    if (userData.name) {
                        const nameParts = userData.name.split(' ');
                        if (firstNameEl) firstNameEl.value = nameParts[0] || '';
                        if (lastNameEl) lastNameEl.value = nameParts.slice(1).join(' ') || '';
                    }
                    if (emailEl && userData.email) emailEl.value = userData.email;
                } catch (error) {
                    console.error('Error loading user data into profile form:', error);
                }
            }
        });
    }

    // Initialize customers data
    loadCustomers();

    // Initialize Supabase integration
    if (typeof window.initSupabase === 'function') {
        window.initSupabase();
        
        // Auto-migrate data if this is first time using Supabase
        setTimeout(async () => {
            if (window.dataService && window.isSupabaseOnline && window.isSupabaseOnline()) {
                const hasLocalData = localStorage.getItem('mci-active-deliveries') || 
                                   localStorage.getItem('mci-delivery-history') || 
                                   localStorage.getItem('mci-customers');
                
                if (hasLocalData) {
                    console.log('🔄 Detected local data, starting migration...');
                    const migrated = await window.dataService.migrateLocalStorageToSupabase();
                    if (migrated) {
                        console.log('✅ Data migration completed');
                        // Refresh views to show migrated data
                        if (typeof loadActiveDeliveries === 'function') loadActiveDeliveries();
                        if (typeof loadCustomers === 'function') loadCustomers();
                    }
                }
            }
        }, 2000);
    }

    // Ensure signature pad is initialized for E-Signature functionality
    if (document.getElementById('signaturePad')) {
        ensureSignaturePadInitialized();
    }

    // Calendar view toggle buttons with proper event listener cleanup
    document.querySelectorAll('.calendar-controls .btn').forEach(button => {
        // Remove existing event listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function () {
            document.querySelectorAll('.calendar-controls .btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Add customer button with proper event listener cleanup
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    if (addCustomerBtn) {
        // Remove existing event listeners by cloning
        const newAddCustomerBtn = addCustomerBtn.cloneNode(true);
        addCustomerBtn.parentNode.replaceChild(newAddCustomerBtn, addCustomerBtn);
        
        newAddCustomerBtn.addEventListener('click', function () {
            const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
            
            // Properly handle modal events
            const modalElement = addCustomerModal._element;
            // Remove any existing event listeners
            const newModalElement = modalElement.cloneNode(true);
            modalElement.parentNode.replaceChild(newModalElement, modalElement);
            
            newModalElement.addEventListener('hidden.bs.modal', function () {
                // Reset form when modal is closed
                const form = document.getElementById('addCustomerForm');
                if (form) form.reset();
                
                // Reset save button to default state
                const saveBtn = document.getElementById('saveCustomerBtn');
                if (saveBtn) {
                    saveBtn.textContent = 'Save Customer';
                    // Remove existing event listeners by cloning
                    const newSaveBtn = saveBtn.cloneNode(true);
                    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                    newSaveBtn.onclick = function() {
                        saveCustomer();
                        const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
                        if (modal) modal.hide();
                    };
                }
                
                // Force remove modal backdrop if it remains
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
                
                // Re-enable body scrolling
                document.body.style.overflow = 'auto';
                document.body.style.paddingRight = '0';
            });
            
            const newModal = new bootstrap.Modal(newModalElement);
            newModal.show();
        });
    }

    // Save customer button with proper event listener cleanup
    const saveCustomerBtn = document.getElementById('saveCustomerBtn');
    if (saveCustomerBtn) {
        // Remove existing event listeners by cloning
        const newSaveCustomerBtn = saveCustomerBtn.cloneNode(true);
        saveCustomerBtn.parentNode.replaceChild(newSaveCustomerBtn, saveCustomerBtn);
        
        newSaveCustomerBtn.addEventListener('click', function () {
            saveCustomer();
            const addCustomerModal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
            if (addCustomerModal) addCustomerModal.hide();
        });
    }

    // Setup logout button functionality using event delegation (more reliable)
    console.log('🔍 Setting up logout button event delegation...');
    
    // Use event delegation on document to catch logout button clicks
    document.addEventListener('click', function(e) {
        // Check if the clicked element is the logout button
        if (e.target && e.target.id === 'logoutBtn') {
            console.log('🔴 LOGOUT BUTTON CLICKED!');
            e.preventDefault();
            e.stopPropagation();
            
            // Call logout function
            try {
                logout();
            } catch (error) {
                console.error('Error calling logout function:', error);
            }
        }
    });
    
    console.log('✅ Logout button event delegation setup complete');
    
    // Also try to attach direct listener with retry mechanism
    function attachLogoutListener() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn && !logoutBtn.hasAttribute('data-logout-attached')) {
            console.log('✅ Found logout button, attaching direct listener');
            logoutBtn.setAttribute('data-logout-attached', 'true');
            
            logoutBtn.addEventListener('click', function(e) {
                console.log('🔴 LOGOUT BUTTON CLICKED (DIRECT ATTACH)!');
                e.preventDefault();
                e.stopPropagation();
                logout();
            });
            
            return true; // Success
        }
        return false; // Not found yet
    }
    
    // Try immediately
    if (!attachLogoutListener()) {
        // If not found, retry periodically
        const retryInterval = setInterval(function() {
            if (attachLogoutListener()) {
                clearInterval(retryInterval);
                console.log('✅ Logout button listener attached successfully');
            }
        }, 500);
        
        // Stop trying after 10 seconds
        setTimeout(function() {
            clearInterval(retryInterval);
        }, 10000);
    }
});

// Global functions
function showToast(message, type = 'success') {
    // In a real implementation, this would show a toast notification
    console.log(`Toast: ${message} [${type}]`);
}

function showError(message) {
    showToast(message, 'error');
}

// Global signature pad instance
let globalSignaturePad = null;

// Function to ensure signature pad is initialized
function ensureSignaturePadInitialized() {
    console.log('ensureSignaturePadInitialized called');
    
    // Check if SignaturePad library is loaded
    if (typeof SignaturePad === 'undefined') {
        console.error('SignaturePad library is not loaded');
        return null;
    }
    
    try {
        // Get canvas element
        const canvas = document.getElementById('signaturePad');
        if (!canvas) {
            console.error('Canvas element not found');
            return null;
        }
        
        console.log('Canvas element found:', canvas);
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        console.log('Canvas parent element:', canvas.parentElement);
        
        // Ensure canvas has proper dimensions
        const container = canvas.parentElement;
        if (container) {
            const width = Math.min(container.offsetWidth, 600);
            const height = 300;
            
            console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
            console.log('Setting canvas dimensions to:', width, 'x', height);
            
            // Only set dimensions if they're different to avoid clearing
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                console.log('Canvas dimensions updated');
            }
        }
        
        // Destroy existing instance if it exists
        if (globalSignaturePad) {
            console.log('Destroying existing SignaturePad instance');
            globalSignaturePad.off();
            globalSignaturePad = null;
        }
        
        // Create new SignaturePad instance with proper configuration
        console.log('Creating new SignaturePad instance');
        globalSignaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 1,
            maxWidth: 3,
            throttle: 0, // Disable throttling for better responsiveness
            velocityFilterWeight: 0.7
        });
        
        console.log('SignaturePad instance created:', globalSignaturePad);
        
        // Add event listeners for debugging
        canvas.addEventListener('mousedown', function(e) {
            console.log('Canvas mousedown event:', e);
        });
        
        canvas.addEventListener('touchstart', function(e) {
            console.log('Canvas touchstart event:', e);
        });
        
        canvas.addEventListener('mousemove', function(e) {
            console.log('Canvas mousemove event:', e);
        });
        
        canvas.addEventListener('touchmove', function(e) {
            console.log('Canvas touchmove event:', e);
        });
        
        console.log('SignaturePad initialized successfully');
        
        // Setup clear button
        setupClearSignatureButton();
        
        // Setup save button
        setupSaveSignatureButton();
        
        return globalSignaturePad;
        
    } catch (error) {
        console.error('Failed to initialize SignaturePad:', error);
        return null;
    }
}

// Function to setup the clear signature button
function setupClearSignatureButton() {
    const clearBtn = document.getElementById('clearSignatureBtn');
    if (clearBtn) {
        console.log('Clear button found, setting up event listener');
        
        // Remove any existing event listeners to prevent duplicates
        const newClearBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
        
        // Add click event listener
        newClearBtn.addEventListener('click', function(e) {
            console.log('Clear button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            if (globalSignaturePad) {
                globalSignaturePad.clear();
                console.log('Signature cleared');
            } else {
                console.warn('SignaturePad instance not available');
            }
        });
        
        console.log('Clear button setup completed');
    } else {
        console.warn('Clear button not found');
    }
}

// Function to setup the save signature button event listener
async function setupSaveSignatureButton() {
    const saveSignatureBtn = document.getElementById('saveSignatureBtn');
    if (saveSignatureBtn) {
        // Remove any existing event listeners to prevent duplicates
        const newSaveBtn = saveSignatureBtn.cloneNode(true);
        saveSignatureBtn.parentNode.replaceChild(newSaveBtn, saveSignatureBtn);
        
        // Add click event listener
        newSaveBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!globalSignaturePad) {
                showError('Signature pad not initialized');
                return;
            }
            
            if (globalSignaturePad.isEmpty()) {
                showError('Please provide a signature before saving');
                return;
            }
            
            // Get signature data URL
            const signatureData = globalSignaturePad.toDataURL('image/png');
            console.log('Signature data captured');
            
            // Get delivery details
            const drNumber = document.getElementById('ePodDrNumber').value;
            const customerName = document.getElementById('ePodCustomerName').value;
            const customerContact = document.getElementById('ePodCustomerContact').value;
            const truckPlate = document.getElementById('ePodTruckPlate').value;
            const deliveryRoute = document.getElementById('ePodDeliveryRoute').value;
            
            // Check if we're handling multiple DR numbers
            if (window.multipleDRNumbers && window.multipleDRNumbers.length > 0) {
                // Handle multiple DR numbers
                const drNumbers = window.multipleDRNumbers;
                
                // Create E-POD records for each DR number using Supabase
                const savePromises = drNumbers.map(async (drNum) => {
                    const deliveryDetails = {
                        origin: deliveryRoute.split(' to ')[0] || 'Unknown Origin',
                        destination: deliveryRoute.split(' to ')[1] || 'Unknown Destination'
                    };
                    
                    // Create E-POD record with complete data
                    const ePodRecord = {
                        dr_number: drNum,
                        customer_name: customerName,
                        customer_contact: customerContact,
                        vendor_number: customerContact,
                        truck_plate: truckPlate,
                        origin: deliveryDetails.origin,
                        destination: deliveryDetails.destination,
                        signature_data: signatureData,
                        status: 'Completed',
                        signed_at: new Date().toISOString()
                    };
                    
                    // Save to Supabase using dataService
                    if (window.dataService) {
                        try {
                            await window.dataService.saveEPodRecord(ePodRecord);
                            console.log(`✅ E-POD record saved to Supabase for DR: ${drNum}`);
                        } catch (error) {
                            console.error(`❌ Failed to save E-POD to Supabase for DR ${drNum}:`, error);
                            // Fallback to localStorage
                            const ePodRecords = JSON.parse(localStorage.getItem('ePodRecords') || '[]');
                            ePodRecords.push(ePodRecord);
                            localStorage.setItem('ePodRecords', JSON.stringify(ePodRecords));
                        }
                    } else {
                        // Fallback to localStorage
                        const ePodRecords = JSON.parse(localStorage.getItem('ePodRecords') || '[]');
                        ePodRecords.push(ePodRecord);
                        localStorage.setItem('ePodRecords', JSON.stringify(ePodRecords));
                    }
                    
                    // Update delivery status in active deliveries
                    updateDeliveryStatus(drNum, 'Completed');
                });
                
                // Wait for all saves to complete
                await Promise.all(savePromises);
                
                // Show success message
                showToast(`${drNumbers.length} E-PODs saved successfully`, 'success');
            } else {
                // Handle single DR number (original functionality)
                // In a real app, you would fetch the complete delivery details from your data source
                // For now, we'll use placeholder data
                const deliveryDetails = {
                    origin: deliveryRoute.split(' to ')[0] || 'Unknown Origin',
                    destination: deliveryRoute.split(' to ')[1] || 'Unknown Destination'
                };
                
                // Create E-POD record with complete data
                const ePodRecord = {
                    dr_number: drNumber,
                    customer_name: customerName,
                    customer_contact: customerContact,
                    vendor_number: customerContact,
                    truck_plate: truckPlate,
                    origin: deliveryDetails.origin,
                    destination: deliveryDetails.destination,
                    signature_data: signatureData,
                    status: 'Completed',
                    signed_at: new Date().toISOString()
                };
                
                // Save to Supabase using dataService
                if (window.dataService) {
                    try {
                        await window.dataService.saveEPodRecord(ePodRecord);
                        console.log('✅ E-POD record saved to Supabase successfully');
                    } catch (error) {
                        console.error('❌ Failed to save E-POD to Supabase:', error);
                        // Fallback to localStorage
                        const ePodRecords = JSON.parse(localStorage.getItem('ePodRecords') || '[]');
                        ePodRecords.push(ePodRecord);
                        localStorage.setItem('ePodRecords', JSON.stringify(ePodRecords));
                    }
                } else {
                    // Fallback to localStorage
                    const ePodRecords = JSON.parse(localStorage.getItem('ePodRecords') || '[]');
                    ePodRecords.push(ePodRecord);
                    localStorage.setItem('ePodRecords', JSON.stringify(ePodRecords));
                }
                
                // Update delivery status in active deliveries
                updateDeliveryStatus(drNumber, 'Completed');
                
                // Show success message
                showToast('E-POD saved successfully', 'success');
            }
            
            // Close the modal
            const eSignatureModal = bootstrap.Modal.getInstance(document.getElementById('eSignatureModal'));
            if (eSignatureModal) {
                eSignatureModal.hide();
            }
            
            // Refresh all relevant views
            if (typeof loadActiveDeliveries === 'function') {
                loadActiveDeliveries();
            }
            if (typeof loadEPodDeliveries === 'function') {
                loadEPodDeliveries();
            }
        });
        
        console.log('Save button setup completed');
    } else {
        console.warn('Save button not found');
    }
}

// Public function to open the signature pad modal for single DR
function openSignaturePad(drNumber = '', customerName = '', customerContact = '', truckPlate = '', deliveryRoute = '') {
    console.log('openSignaturePad called with:', { drNumber, customerName, customerContact, truckPlate, deliveryRoute });
    
    // Set delivery details in modal
    const drNumberField = document.getElementById('ePodDrNumber');
    const customerNameField = document.getElementById('ePodCustomerName');
    const customerContactField = document.getElementById('ePodCustomerContact');
    const truckPlateField = document.getElementById('ePodTruckPlate');
    const deliveryRouteField = document.getElementById('ePodDeliveryRoute');
    
    console.log('Setting field values in original implementation:', {
        drNumber: drNumber || '',
        customerName: customerName || '',
        customerContact: customerContact || '',
        truckPlate: truckPlate || '',
        deliveryRoute: deliveryRoute || ''
    });
    
    if (drNumberField) drNumberField.value = drNumber || '';
    if (customerNameField) customerNameField.value = customerName || '';
    if (customerContactField) customerContactField.value = customerContact || '';
    if (truckPlateField) truckPlateField.value = truckPlate || '';
    if (deliveryRouteField) deliveryRouteField.value = deliveryRoute || '';
    
    // Clear any existing multiple DR data
    delete window.multipleDRNumbers;
    delete window.deliveryDetails;
    
    // Show modal
    const eSignatureModal = new bootstrap.Modal(document.getElementById('eSignatureModal'));
    console.log('Showing E-Signature modal');
    eSignatureModal.show();
    
    // Initialize signature pad after modal is shown
    const modalElement = document.getElementById('eSignatureModal');
    
    const handleModalShown = function() {
        console.log('E-Signature modal shown event triggered');
        // Use a small delay to ensure everything is rendered
        setTimeout(() => {
            ensureSignaturePadInitialized();
        }, 100);
        
        // Remove event listener to prevent duplicates
        modalElement.removeEventListener('shown.bs.modal', handleModalShown);
    };
    
    console.log('Adding shown.bs.modal event listener');
    // Add event listener for when the modal is fully shown
    modalElement.addEventListener('shown.bs.modal', handleModalShown);
}

// Public function to open the signature pad modal for multiple DRs
function openSignaturePadMultiple(drNumber = '', customerName = '', customerContact = '', truckPlate = '', deliveryRoute = '', drNumbers = []) {
    console.log('openSignaturePadMultiple called with:', { drNumber, customerName, customerContact, truckPlate, deliveryRoute, drNumbers });
    
    // Set delivery details in modal
    const drNumberField = document.getElementById('ePodDrNumber');
    const customerNameField = document.getElementById('ePodCustomerName');
    const customerContactField = document.getElementById('ePodCustomerContact');
    const truckPlateField = document.getElementById('ePodTruckPlate');
    const deliveryRouteField = document.getElementById('ePodDeliveryRoute');
    
    console.log('Setting field values in original implementation for multiple DRs:', {
        drNumber: drNumber || '',
        customerName: customerName || '',
        customerContact: customerContact || '',
        truckPlate: truckPlate || '',
        deliveryRoute: deliveryRoute || ''
    });
    
    if (drNumberField) drNumberField.value = drNumber || '';
    if (customerNameField) customerNameField.value = customerName || '';
    if (customerContactField) customerContactField.value = customerContact || '';
    if (truckPlateField) truckPlateField.value = truckPlate || '';
    if (deliveryRouteField) deliveryRouteField.value = deliveryRoute || '';
    
    // Store the multiple DR numbers for saving
    window.multipleDRNumbers = drNumbers;
    
    // Show modal
    const eSignatureModal = new bootstrap.Modal(document.getElementById('eSignatureModal'));
    console.log('Showing E-Signature modal for multiple DRs');
    eSignatureModal.show();
    
    // Initialize signature pad after modal is shown
    const modalElement = document.getElementById('eSignatureModal');
    
    const handleModalShown = function() {
        console.log('E-Signature modal shown event triggered for multiple DRs');
        // Use a small delay to ensure everything is rendered
        setTimeout(() => {
            ensureSignaturePadInitialized();
        }, 100);
        
        // Remove event listener to prevent duplicates
        modalElement.removeEventListener('shown.bs.modal', handleModalShown);
    };
    
    console.log('Adding shown.bs.modal event listener for multiple DRs');
    // Add event listener for when the modal is fully shown
    modalElement.addEventListener('shown.bs.modal', handleModalShown);
}

// Public function to get signature data
function getSignatureData() {
    if (globalSignaturePad && !globalSignaturePad.isEmpty()) {
        return globalSignaturePad.toDataURL('image/png');
    }
    return null;
}

// Public function to clear signature
function clearSignature() {
    if (globalSignaturePad) {
        globalSignaturePad.clear();
    }
}

// Public function to check if signature pad has content
function hasSignature() {
    return globalSignaturePad && !globalSignaturePad.isEmpty();
}

// Make signature pad functions globally accessible
window.openSignaturePad = openSignaturePad;
window.openSignaturePadMultiple = openSignaturePadMultiple;
window.getSignatureData = getSignatureData;
window.clearSignature = clearSignature;
window.hasSignature = hasSignature;
window.ensureSignaturePadInitialized = ensureSignaturePadInitialized;

// Function to update booking view dashboard cards with real data
function updateBookingViewDashboard() {
    try {
        // Get the actual data from global variables
        const activeDeliveries = window.activeDeliveries || [];
        const deliveryHistory = window.deliveryHistory || [];
        
        // Calculate metrics from actual data
        const totalBookings = activeDeliveries.length + deliveryHistory.length;
        const activeDeliveriesCount = activeDeliveries.length;
        

        
        // Update the booking view dashboard cards
        const bookingView = document.getElementById('bookingView');
        if (bookingView) {
            // Booked Deliveries card (total bookings)
            const bookedDeliveriesCard = bookingView.querySelector('.dashboard-cards .card:nth-child(1) .stat-value');
            if (bookedDeliveriesCard) {
                bookedDeliveriesCard.textContent = totalBookings;
            }
            
            // Active Deliveries card
            const activeDeliveriesCard = bookingView.querySelector('.dashboard-cards .card:nth-child(2) .stat-value');
            if (activeDeliveriesCard) {
                activeDeliveriesCard.textContent = activeDeliveriesCount;
            }
            

        }
        
        console.log('Booking view dashboard updated:', {
            totalBookings,
            activeDeliveriesCount
        });
    } catch (error) {
        console.error('Error updating booking view dashboard:', error);
    }
}

// Expose function globally
window.updateBookingViewDashboard = updateBookingViewDashboard;

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main.js: DOMContentLoaded event fired');
    
    // Add event listeners for search inputs
    const drSearchInput = document.getElementById('drSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const drSearchHistoryInput = document.getElementById('drSearchHistoryInput');
    const clearHistorySearchBtn = document.getElementById('clearHistorySearchBtn');
    const selectAllActive = document.getElementById('selectAllActive');
    const eSignatureBtn = document.getElementById('eSignatureBtn');
    const exportActiveDeliveriesBtn = document.getElementById('exportActiveDeliveriesBtn');
    const exportDeliveryHistoryBtn = document.getElementById('exportDeliveryHistoryBtn');
    
    if (drSearchInput) {
        drSearchInput.addEventListener('input', function() {
            currentSearchTerm = this.value;
            loadActiveDeliveries();
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            if (drSearchInput) {
                drSearchInput.value = '';
                currentSearchTerm = '';
                loadActiveDeliveries();
            }
        });
    }
    
    if (drSearchHistoryInput) {
        drSearchHistoryInput.addEventListener('input', function() {
            currentHistorySearchTerm = this.value;
            loadDeliveryHistory();
        });
    }
    
    if (clearHistorySearchBtn) {
        clearHistorySearchBtn.addEventListener('click', function() {
            if (drSearchHistoryInput) {
                drSearchHistoryInput.value = '';
                currentHistorySearchTerm = '';
                loadDeliveryHistory();
            }
        });
    }
    
    if (selectAllActive) {
        selectAllActive.addEventListener('change', function() {
            document.querySelectorAll('#activeDeliveriesTableBody tr input.delivery-checkbox').forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            
            // Enable/disable E-Signature button based on selection
            if (eSignatureBtn) {
                eSignatureBtn.disabled = !this.checked;
            }
        });
    }
    
    // Add event delegation for delivery checkboxes
    document.addEventListener('change', function(e) {
        if (e.target && e.target.classList.contains('delivery-checkbox')) {
            // Update select all checkbox state for Active Deliveries
            if (selectAllActive) {
                const allCheckboxes = document.querySelectorAll('#activeDeliveriesTableBody tr input.delivery-checkbox');
                const checkedCheckboxes = document.querySelectorAll('#activeDeliveriesTableBody tr input.delivery-checkbox:checked');
                selectAllActive.checked = allCheckboxes.length === checkedCheckboxes.length;
            }
            
            // Enable/disable E-Signature button based on selection for Active Deliveries
            if (eSignatureBtn) {
                const anyChecked = document.querySelectorAll('#activeDeliveriesTableBody tr input.delivery-checkbox:checked').length > 0;
                eSignatureBtn.disabled = !anyChecked;
            }
        }
    });
    
    if (eSignatureBtn) {
        eSignatureBtn.addEventListener('click', function() {
            // Get selected deliveries
            const selectedDeliveries = Array.from(document.querySelectorAll('#activeDeliveriesTableBody tr input.delivery-checkbox:checked'))
                .map(checkbox => checkbox.dataset.deliveryId);
            
            if (selectedDeliveries.length === 0) {
                showToast('Please select at least one delivery', 'warning');
                return;
            }
            
            if (selectedDeliveries.length > 1) {
                showToast('Please select only one delivery for E-Signature', 'warning');
                return;
            }
            
            // Show E-Signature modal for the first selected delivery
            const deliveryId = selectedDeliveries[0];
            const delivery = activeDeliveries.find(d => d.id === deliveryId);
            if (delivery) {
                showESignatureModal(delivery.drNumber);
            }
        });
    }
    
    if (exportActiveDeliveriesBtn) {
        exportActiveDeliveriesBtn.addEventListener('click', exportActiveDeliveriesToExcel);
    }
    
    if (exportDeliveryHistoryBtn) {
        exportDeliveryHistoryBtn.addEventListener('click', exportDeliveryHistoryToExcel);
    }
    
    // Profile settings save button
    const saveProfileChangesBtn = document.getElementById('saveProfileChangesBtn');
    if (saveProfileChangesBtn) {
        saveProfileChangesBtn.addEventListener('click', saveProfileSettings);
    }

    // User dropdown functionality - Add logout option to Logistics Manager text
    const userRole = document.getElementById('userRole');
    const userDropdown = document.getElementById('userDropdown');
    const logoutOption = document.getElementById('logoutOption');
    
    if (userRole && userDropdown && logoutOption) {
        // Show dropdown when clicking on user role
        userRole.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = userDropdown.style.display === 'block';
            userDropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        // Handle logout option click
        logoutOption.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            userDropdown.style.display = 'none';
            
            // Call the existing logout function
            if (typeof logout === 'function') {
                logout();
            } else {
                // Fallback logout - redirect to login page
                localStorage.removeItem('mci-user');
                localStorage.removeItem('mci-activeDeliveries');
                localStorage.removeItem('mci-deliveryHistory');
                localStorage.removeItem('mci-customers');
                localStorage.removeItem('ePodRecords');
                localStorage.removeItem('mci-user-profile');
                sessionStorage.clear();
                window.location.href = '/login.html';
            }
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userRole.contains(e.target)) {
                userDropdown.style.display = 'none';
            }
        });
    }

    console.log('Main.js: Event listeners added');
});

// Filter E-POD deliveries based on search term
function filterEPodDeliveries(searchTerm) {
    // Get E-POD records from localStorage
    let ePodRecords = [];
    try {
        const ePodData = localStorage.getItem('ePodRecords');
        if (ePodData) {
            ePodRecords = JSON.parse(ePodData);
        }
    } catch (error) {
        console.error('Error loading EPOD records:', error);
    }
    
    // Filter records based on search term
    const filteredRecords = searchTerm ? 
        ePodRecords.filter(record => 
            record.drNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ) : 
        ePodRecords;
    
    // Update search results info
    const searchResultsInfo = document.getElementById('ePodSearchResultsInfo');
    if (searchResultsInfo) {
        if (searchTerm) {
            searchResultsInfo.innerHTML = `
                <div class="alert alert-info mb-0">
                    <i class="bi bi-info-circle me-2"></i>
                    Found ${filteredRecords.length} E-POD record${filteredRecords.length !== 1 ? 's' : ''} 
                    matching "${searchTerm}"
                </div>
            `;
            searchResultsInfo.style.display = 'block';
        } else {
            searchResultsInfo.style.display = 'none';
        }
    }
    
    // Re-render the filtered records using the card layout
    renderEPodDeliveries(filteredRecords);
}

// Export E-POD records as PDF
function exportEPodToPdf() {
    try {
        // Get E-POD records from localStorage
        let ePodRecords = JSON.parse(localStorage.getItem('ePodRecords') || '[]');
        
        // Check if any checkboxes are selected
        const selectedCheckboxes = document.querySelectorAll('#ePodTableBody tr input.delivery-checkbox:checked');
        
        // If checkboxes are selected, filter records to only include selected ones
        if (selectedCheckboxes.length > 0) {
            const selectedDRNumbers = Array.from(selectedCheckboxes).map(cb => cb.dataset.drNumber);
            ePodRecords = ePodRecords.filter(record => selectedDRNumbers.includes(record.drNumber));
        }
        
        // Filter records based on search term - FIXED: Use correct field names
        ePodRecords = ePodRecords.filter(record => 
            (record.dr_number || record.drNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Further filter by selected DR numbers - FIXED: Use correct field names
        ePodRecords = ePodRecords.filter(record => 
            selectedDRNumbers.includes(record.dr_number || record.drNumber || '')
        );

        if (ePodRecords.length === 0) {
            showToast('No E-POD records to export', 'warning');
            return;
        }

        // Create a new window for the PDF content
        const printWindow = window.open('', '_blank');
        
        // Generate HTML content for the PDF
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>E-POD Records</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    margin: 0;
                    color: #333;
                }
                .record {
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                .record-title {
                    background-color: #f5f5f5;
                    padding: 10px;
                    border-radius: 3px;
                    margin: -15px -15px 15px -15px;
                    font-weight: bold;
                }
                .field {
                    margin-bottom: 10px;
                }
                .field-label {
                    font-weight: bold;
                    display: inline-block;
                    width: 150px;
                }
                .signature-container {
                    margin: 20px 0;
                    text-align: center;
                }
                .signature-image {
                    max-width: 300px;
                    max-height: 100px;
                    border: 1px solid #ccc;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 1px solid #ccc;
                    font-size: 12px;
                    color: #666;
                }
                .status-completed {
                    color: #198754;
                    font-weight: bold;
                    -webkit-animation: pulse 2s infinite;
                    animation: pulse 2s infinite;
                }
                @-webkit-keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>E-POD Records</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
        `;

        // Add each record to the HTML content
        for (let i = 0; i < ePodRecords.length; i++) {
            const record = ePodRecords[i];
            const signedDate = record.signedAt ? new Date(record.signedAt).toLocaleString() : 'N/A';
            const signatureHtml = record.signature ? 
                `<img src="${record.signature}" class="signature-image" alt="Signature">` : 
                '<div>No signature available</div>';
                
            // Format status with animation if completed
            let statusHtml = record.status || 'N/A';
            if (record.status === 'Completed') {
                statusHtml = `<span class="status-completed">${record.status}</span>`;
            }
                
            htmlContent += `
            <div class="record">
                <div class="record-title">Record #${i + 1}</div>
                <div class="field">
                    <span class="field-label">DR Number:</span>
                    <span>${record.drNumber || record.dr_number || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Customer Name:</span>
                    <span>${record.customerName || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Vendor Number:</span>
                    <span>${record.customerContact || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Truck Plate:</span>
                    <span>${record.truckPlate || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Origin:</span>
                    <span>${record.origin || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Destination:</span>
                    <span>${record.destination || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Signed Date:</span>
                    <span>${signedDate}</span>
                </div>
                <div class="field">
                    <span class="field-label">Status:</span>
                    <span>${statusHtml}</span>
                </div>
                <div class="signature-container">
                    <div><strong>Signature:</strong></div>
                    ${signatureHtml}
                </div>
            </div>
            `;
        }

        htmlContent += `
            <div class="footer">
                <p>Document generated by MCI Delivery Tracker System</p>
            </div>
        </body>
        </html>
        `;

        // Write content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then trigger print
        printWindow.onload = function() {
            // Give it a small delay to ensure everything is rendered
            setTimeout(() => {
                printWindow.print();
                // Close the window after printing (optional)
                // printWindow.close();
            }, 500);
        };

        showToast(`Exporting ${ePodRecords.length} E-POD records to PDF. Please check your print dialog to save as PDF.`, 'success');
    } catch (error) {
        console.error('Error exporting E-POD records to PDF:', error);
        showToast('Error exporting E-POD records to PDF. Please try again.', 'error');
    }
}

function updateDeliveryStatus(drNumber, newStatus) {
    // In a real app, this would update the backend
    console.log(`Updating DR ${drNumber} to status: ${newStatus}`);
    
    // Update UI if the delivery is in the active deliveries view
    const activeDeliveriesRows = document.querySelectorAll('#activeDeliveriesTableBody tr');
    activeDeliveriesRows.forEach(row => {
        const drCell = row.querySelector('td:nth-child(2)'); // DR Number is now in the second column (first is checkbox)
        if (drCell && drCell.textContent.trim() === drNumber) {
            const statusCell = row.querySelector('td:nth-child(9)'); // Status is now in the 9th column
            if (statusCell) {
                statusCell.innerHTML = `<span class="badge bg-success">
                    <i class="bi bi-check-circle"></i> ${newStatus}
                </span>`;
            }
            
            // Mark the row as signed
            row.classList.add('table-success');
        }
    });
    
    // Also update in the global activeDeliveries array if it exists
    console.log('Window activeDeliveries:', window.activeDeliveries);
    console.log('Window deliveryHistory:', window.deliveryHistory);
    
    if (window.activeDeliveries && Array.isArray(window.activeDeliveries)) {
        const deliveryIndex = window.activeDeliveries.findIndex(d => d.drNumber === drNumber);
        console.log('Delivery index found:', deliveryIndex);
        if (deliveryIndex !== -1) {
            const delivery = window.activeDeliveries[deliveryIndex];
            delivery.status = newStatus;
            delivery.completedDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Move to history if completed
            if (newStatus === 'Completed') {
                console.log('Moving delivery to history');
                // Add to delivery history
                if (window.deliveryHistory && Array.isArray(window.deliveryHistory)) {
                    // Create a clean copy for delivery history (without signature data)
                    const deliveryCopy = { ...delivery };
                    
                    // Remove signature data if it exists
                    delete deliveryCopy.signature;
                    
                    // Add the completed delivery to history
                    window.deliveryHistory.unshift(deliveryCopy);
                    console.log('Added to history, new history length:', window.deliveryHistory.length);
                    
                    // Remove from active deliveries
                    window.activeDeliveries.splice(deliveryIndex, 1);
                    console.log('Removed from active, new active length:', window.activeDeliveries.length);
                    
                    // Save to localStorage
                    if (window.saveToLocalStorage && typeof window.saveToLocalStorage === 'function') {
                        console.log('Saving to localStorage');
                        window.saveToLocalStorage();
                    }
                    
                    // Refresh both views
                    if (window.loadActiveDeliveries && typeof window.loadActiveDeliveries === 'function') {
                        console.log('Loading active deliveries');
                        window.loadActiveDeliveries();
                    }
                    if (window.loadDeliveryHistory && typeof window.loadDeliveryHistory === 'function') {
                        console.log('Loading delivery history');
                        window.loadDeliveryHistory();
                    }
                    
                    // Update dashboard metrics
                    if (typeof window.updateDashboardMetrics === 'function') {
                        window.updateDashboardMetrics();
                    }
                }
            }
        }
    }
}



// Initialize auth
function initAuth() {
    // Clear any existing user data to force recreation with new name
    localStorage.removeItem('mci-user');
    
    // Check if user is logged in
    let user = localStorage.getItem('mci-user');
    
    // For testing purposes, create mock user data if none exists
    if (!user) {
        const mockUser = {
            name: 'John Mangawang',
            role: 'Administrator',
            email: 'admin@mci.com'
        };
        localStorage.setItem('mci-user', JSON.stringify(mockUser));
        user = JSON.stringify(mockUser);
        console.log('Created mock user for testing');
    }
    
    if (user) {
        const userData = JSON.parse(user);
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        const userAvatarEl = document.getElementById('userAvatar');
        const profileNameEl = document.getElementById('profileName');
        const profileRoleEl = document.getElementById('profileRole');
        const firstNameEl = document.getElementById('firstName');
        const lastNameEl = document.getElementById('lastName');
        const emailEl = document.getElementById('email');
        
        if (userNameEl) userNameEl.textContent = userData.name;
        if (userRoleEl) userRoleEl.textContent = userData.role;
        if (userAvatarEl) userAvatarEl.textContent = getInitials(userData.name);
        if (profileNameEl) profileNameEl.textContent = userData.name;
        if (profileRoleEl) profileRoleEl.textContent = userData.role;
        if (firstNameEl) firstNameEl.value = userData.name.split(' ')[0];
        if (lastNameEl) lastNameEl.value = userData.name.split(' ')[1] || '';
        if (emailEl) emailEl.value = userData.email;
    }
}

// Customer Management Functions
// Note: customers array is declared in HTML file

// Load customers data
async function loadCustomers() {
    console.log('Loading customers...');
    
    // Use the existing customers array from HTML
    if (typeof window.customers === 'undefined') {
        window.customers = [];
    }
    
    // Use dataService to load customers if available
    if (typeof window.dataService !== 'undefined') {
        try {
            const customers = await window.dataService.getCustomers();
            // Update the global customers array
            window.customers.length = 0; // Clear existing
            window.customers.push(...customers);
            
            // Merge duplicate customers based on name and phone number
            await mergeDuplicateCustomers();
        } catch (error) {
            console.error('Error loading customers from dataService:', error);
            // Fallback to current implementation
            await fallbackLoadCustomers();
        }
    } else {
        // Fallback to current implementation
        await fallbackLoadCustomers();
    }
    
    // If no customers, create some mock customers for demo
    if (window.customers.length === 0) {
        const mockCustomers = [
            {
                id: 'CUST-001',
                contactPerson: 'Juan Dela Cruz',
                phone: '+63 917 123 4567',
                address: '123 Main St, Makati City',
                accountType: 'Individual',
                email: 'juan@email.com',
                status: 'active',
                notes: 'Regular customer',
                bookingsCount: 5,
                lastDelivery: 'Dec 15, 2024',
                createdAt: new Date('2024-01-15')
            },
            {
                id: 'CUST-002',
                contactPerson: 'Maria Santos',
                phone: '+63 918 987 6543',
                address: '456 Business Ave, BGC, Taguig',
                accountType: 'Corporate',
                email: 'maria@company.com',
                status: 'active',
                notes: 'Corporate account',
                bookingsCount: 12,
                lastDelivery: 'Dec 20, 2024',
                createdAt: new Date('2024-02-10')
            }
        ];
        window.customers.push(...mockCustomers);
        
        // Save to dataService or localStorage
        if (typeof window.dataService !== 'undefined') {
            for (const customer of mockCustomers) {
                await window.dataService.saveCustomer(customer);
            }
        } else if (typeof window.saveCustomer === 'function') {
            for (const customer of mockCustomers) {
                await window.saveCustomer(customer);
            }
        } else {
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        }
    }
    
    // Make loadCustomers globally accessible
    window.loadCustomers = loadCustomers;
    window.mergeDuplicateCustomers = mergeDuplicateCustomers;
    
    // Call the existing displayCustomers function if it exists
    if (typeof displayCustomers === 'function') {
        displayCustomers();
    } else if (typeof window.displayCustomers === 'function') {
        window.displayCustomers();
    }
}

// Fallback implementation for loading customers
async function fallbackLoadCustomers() {
    // Load from database or localStorage
    if (typeof window.getCustomers === 'function') {
        try {
            const customers = await window.getCustomers();
            // Update the global customers array
            window.customers.length = 0; // Clear existing
            window.customers.push(...customers);
            
            // Merge duplicate customers based on name and phone number
            await mergeDuplicateCustomers();
        } catch (error) {
            console.error('Error loading customers:', error);
            // Fallback to localStorage
            const savedCustomers = localStorage.getItem('mci-customers');
            if (savedCustomers) {
                const parsedCustomers = JSON.parse(savedCustomers);
                // Update the global customers array
                window.customers.length = 0; // Clear existing
                window.customers.push(...parsedCustomers);
                
                // Merge duplicate customers based on name and phone number
                await mergeDuplicateCustomers();
            }
        }
    } else {
        // Fallback to localStorage
        const savedCustomers = localStorage.getItem('mci-customers');
        if (savedCustomers) {
            const parsedCustomers = JSON.parse(savedCustomers);
            // Update the global customers array
            window.customers.length = 0; // Clear existing
            window.customers.push(...parsedCustomers);
            
            // Merge duplicate customers based on name and phone number
            await mergeDuplicateCustomers();
        }
    }
}

// Function to merge duplicate customers based on name and phone number
async function mergeDuplicateCustomers() {
    console.log('=== MERGE DUPLICATE CUSTOMERS FUNCTION CALLED ===');
    console.log('Customers before merge:', window.customers.length);
    
    // Create a map to group customers by name and phone
    const customerGroups = new Map();
    
    // Group customers by name and phone number
    window.customers.forEach(customer => {
        const key = `${customer.contactPerson.toLowerCase()}|${customer.phone}`;
        if (!customerGroups.has(key)) {
            customerGroups.set(key, []);
        }
        customerGroups.get(key).push(customer);
    });
    
    // Process groups to merge duplicates
    const mergedCustomers = [];
    let mergeCount = 0;
    
    customerGroups.forEach((group, key) => {
        if (group.length === 1) {
            // No duplicates, just add the customer
            mergedCustomers.push(group[0]);
        } else {
            // Merge duplicates
            console.log(`Merging ${group.length} duplicate customers for: ${key}`);
            mergeCount += group.length - 1;
            
            // Sort by createdAt to get the most recent one as the primary
            group.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Use the most recent customer as the base
            const primaryCustomer = { ...group[0] };
            
            // Merge data from all duplicates
            let totalBookings = 0;
            let latestDeliveryDate = null;
            
            group.forEach(customer => {
                totalBookings += customer.bookingsCount || 0;
                
                // Get the latest delivery date
                if (customer.lastDelivery) {
                    const customerDate = new Date(customer.lastDelivery);
                    if (!latestDeliveryDate || customerDate > latestDeliveryDate) {
                        latestDeliveryDate = customerDate;
                    }
                }
                
                // Merge notes
                if (customer.notes && !primaryCustomer.notes.includes(customer.notes)) {
                    primaryCustomer.notes = primaryCustomer.notes ? 
                        `${primaryCustomer.notes}; ${customer.notes}` : 
                        customer.notes;
                }
                
                // Keep the most complete address if available
                if (customer.address && customer.address.length > (primaryCustomer.address?.length || 0)) {
                    primaryCustomer.address = customer.address;
                }
                
                // Keep the most complete email if available
                if (customer.email && customer.email.length > (primaryCustomer.email?.length || 0)) {
                    primaryCustomer.email = customer.email;
                }
            });
            
            // Update the primary customer with merged data
            primaryCustomer.bookingsCount = totalBookings;
            if (latestDeliveryDate) {
                primaryCustomer.lastDelivery = latestDeliveryDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
            
            mergedCustomers.push(primaryCustomer);
        }
    });
    
    // Update the global customers array
    window.customers = mergedCustomers;
    
    // Save to database or localStorage
    if (typeof window.saveCustomer === 'function') {
        try {
            // Save all merged customers
            for (const customer of mergedCustomers) {
                await window.saveCustomer(customer);
            }
        } catch (error) {
            console.error('Error saving merged customers:', error);
            // Fallback to localStorage
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        }
    } else {
        localStorage.setItem('mci-customers', JSON.stringify(window.customers));
    }
    
    console.log(`Merged ${mergeCount} duplicate customers`);
    console.log('Customers after merge:', window.customers.length);
    
    return mergeCount;
}

// Display customers in the card layout
function displayCustomers() {
    const customersContainer = document.getElementById('customersContainer');
    if (!customersContainer) {
        console.error('Customers container not found');
        return;
    }

    customersContainer.innerHTML = '';

    window.customers.forEach(customer => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title">${customer.contactPerson}</h5>
                            <p class="card-text text-muted">${customer.accountType} Account</p>
                        </div>
                        <span class="badge bg-${customer.status === 'active' ? 'success' : customer.status === 'pending' ? 'warning text-dark' : 'secondary'}">
                            ${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                    </div>
                    <div class="mt-3">
                        <div class="d-flex mb-2">
                            <i class="bi bi-geo-alt text-secondary me-2"></i>
                            <span class="small">${customer.address}</span>
                        </div>
                        <div class="d-flex mb-2">
                            <i class="bi bi-telephone text-secondary me-2"></i>
                            <span class="small">${customer.phone}</span>
                        </div>
                        <div class="d-flex">
                            <i class="bi bi-envelope text-secondary me-2"></i>
                            <span class="small">${customer.email || 'No email'}</span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mt-4">
                        <div>
                            <span class="text-muted small">Bookings:</span>
                            <strong>${customer.bookingsCount || 0}</strong>
                        </div>
                        <div>
                            <span class="text-muted small">Last Delivery:</span>
                            <strong class="small">${customer.lastDelivery || 'Never'}</strong>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0">
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="editCustomer('${customer.id}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer('${customer.id}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        customersContainer.appendChild(card);
    });

    console.log(`Displayed ${window.customers.length} customers`);
}

// Save new customer
async function saveCustomer() {
    const contactPerson = document.getElementById('contactPerson').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const accountType = document.getElementById('accountType').value;
    const email = document.getElementById('email').value.trim(); // Fixed: was 'email2'
    const notes = document.getElementById('notes').value.trim();

    if (!contactPerson || !phone || !address) {
        showError('Please fill in all required fields');
        return;
    }

    const newCustomer = {
        id: 'CUST-' + String(window.customers.length + 1).padStart(3, '0'),
        contactPerson,
        phone,
        address,
        accountType,
        email,
        status: 'active',
        notes,
        bookingsCount: 0,
        lastDelivery: null,
        createdAt: new Date()
    };

    window.customers.push(newCustomer);
    
    // Save to dataService or localStorage
    if (typeof window.dataService !== 'undefined') {
        try {
            await window.dataService.saveCustomer(newCustomer);
        } catch (error) {
            console.error('Error saving customer to dataService:', error);
            // Fallback to localStorage
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        }
    } else if (typeof window.saveCustomer === 'function') {
        try {
            await window.saveCustomer(newCustomer);
        } catch (error) {
            console.error('Error saving customer:', error);
            // Fallback to localStorage
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        }
    } else {
        localStorage.setItem('mci-customers', JSON.stringify(window.customers));
    }

    // Clear form
    document.getElementById('addCustomerForm').reset();

    // Refresh display
    displayCustomers();

    showToast('Customer added successfully!');
}

// Edit customer
function editCustomer(customerId) {
    const customer = window.customers.find(c => c.id === customerId);
    if (!customer) return;

    // Populate form with customer data
    document.getElementById('contactPerson').value = customer.contactPerson;
    document.getElementById('phone').value = customer.phone;
    document.getElementById('address').value = customer.address;
    document.getElementById('accountType').value = customer.accountType;
    document.getElementById('email').value = customer.email || ''; // Fixed: was 'email2'
    document.getElementById('notes').value = customer.notes || '';

    // Show modal
    const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    addCustomerModal.show();

    // Change save button to update
    const saveBtn = document.getElementById('saveCustomerBtn');
    saveBtn.textContent = 'Update Customer';
    saveBtn.onclick = function() {
        updateCustomer(customerId);
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
        modal.hide();
    };
}

// Update customer
async function updateCustomer(customerId) {
    const customerIndex = window.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return;

    window.customers[customerIndex] = {
        ...window.customers[customerIndex],
        contactPerson: document.getElementById('contactPerson').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        accountType: document.getElementById('accountType').value,
        email: document.getElementById('email').value.trim(), // Fixed: was 'email2'
        notes: document.getElementById('notes').value.trim()
    };

    // Save to dataService or localStorage
    if (typeof window.dataService !== 'undefined') {
        try {
            await window.dataService.saveCustomer(window.customers[customerIndex]);
        } catch (error) {
            console.error('Error updating customer in dataService:', error);
            // Fallback to localStorage
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        }
    } else if (typeof window.saveCustomer === 'function') {
        try {
            await window.saveCustomer(window.customers[customerIndex]);
        } catch (error) {
            console.error('Error updating customer:', error);
            // Fallback to localStorage
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        }
    } else {
        localStorage.setItem('mci-customers', JSON.stringify(window.customers));
    }

    // Reset save button
    const saveBtn = document.getElementById('saveCustomerBtn');
    saveBtn.textContent = 'Save Customer';
    saveBtn.onclick = function() {
        saveCustomer();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
        modal.hide();
    };

    // Clear form
    document.getElementById('addCustomerForm').reset();

    // Refresh display
    displayCustomers();

    showToast('Customer updated successfully!');
}

// Delete customer
async function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    const customerIndex = window.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return;

    window.customers.splice(customerIndex, 1);
    
    // Delete from dataService or localStorage
    if (typeof window.dataService !== 'undefined') {
        try {
            await window.dataService.deleteCustomer(customerId);
        } catch (error) {
            console.error('Error deleting customer from dataService:', error);
            // Fallback to localStorage
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        }
    } else if (typeof window.deleteCustomer === 'function') {
        try {
            await window.deleteCustomer(customerId);
        } catch (error) {
            console.error('Error deleting customer:', error);
            // Fallback to localStorage
            localStorage.setItem('mci-customers', JSON.stringify(window.customers));
        }
    } else {
        localStorage.setItem('mci-customers', JSON.stringify(window.customers));
    }

    displayCustomers();
    showToast('Customer deleted successfully!');
}

// View customer history
function viewCustomerHistory(customerId) {
    const customer = window.customers.find(c => c.id === customerId);
    if (!customer) return;

    showToast(`Viewing history for ${customer.contactPerson}`);
}

// Initialize Supabase authentication
function initSupabaseAuth() {
    // Check if Supabase is available
    if (typeof window.initSupabase === 'function') {
        window.initSupabase();
        
        // Set up auth state change listener
        if (typeof window.onAuthStateChange === 'function') {
            window.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                if (event === 'SIGNED_OUT') {
                    // Redirect to login or update UI
                    console.log('User signed out');
                    // Refresh the page to reset the UI
                    window.location.reload();
                } else if (event === 'SIGNED_IN') {
                    // Update UI with user info
                    console.log('User signed in');
                    updateUserInfo();
                }
            });
        }
        
        // Update user info on load
        updateUserInfo();
    } else {
        console.log('Supabase not available, using mock authentication');
    }
}

// Helper function to get initials from name
function getInitials(name) {
    if (!name) return 'U';
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
}

// Update user info in the UI
async function updateUserInfo() {
    if (typeof window.getCurrentUser === 'function') {
        const user = await window.getCurrentUser();
        if (user) {
            // Update UI elements with user info
            const userNameElements = document.querySelectorAll('#userName, #profileName');
            userNameElements.forEach(el => {
                if (el) el.textContent = user.name || 'User';
            });
            
            const userRoleElements = document.querySelectorAll('#userRole, #profileRole');
            userRoleElements.forEach(el => {
                if (el) el.textContent = user.role || 'User';
            });
            
            // Update avatar with proper initials
            const avatarElement = document.getElementById('userAvatar');
            if (avatarElement) {
                const initials = getInitials(user.name);
                avatarElement.textContent = initials;
            }
            
            // Update profile settings form
            const firstNameEl = document.getElementById('profileFirstName');
            const lastNameEl = document.getElementById('profileLastName');
            const emailEl = document.getElementById('profileEmail');
            
            if (firstNameEl && lastNameEl && emailEl) {
                if (user.name) {
                    const nameParts = user.name.split(' ');
                    firstNameEl.value = nameParts[0] || '';
                    lastNameEl.value = nameParts.slice(1).join(' ') || '';
                }
                if (user.email) {
                    emailEl.value = user.email;
                }
            }
        }
    }
}

// Save profile settings
function saveProfileSettings() {
    const firstNameEl = document.getElementById('profileFirstName');
    const lastNameEl = document.getElementById('profileLastName');
    const emailEl = document.getElementById('profileEmail');
    
    if (firstNameEl && lastNameEl && emailEl) {
        const firstName = firstNameEl.value.trim();
        const lastName = lastNameEl.value.trim();
        const email = emailEl.value.trim();
        
        if (!firstName) {
            showToast('First name is required', 'error');
            return;
        }
        
        const fullName = lastName ? `${firstName} ${lastName}` : firstName;
        
        // Update user data
        const userData = {
            name: fullName,
            email: email,
            role: 'Administrator' // Keep existing role
        };
        
        // Save to localStorage
        localStorage.setItem('mci-user', JSON.stringify(userData));
        
        // Update UI immediately
        updateUIWithUserData(userData);
        
        // Show success message
        showToast('Profile updated successfully!', 'success');
        
        // Close modal if it exists
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            const modal = bootstrap.Modal.getInstance(settingsModal);
            if (modal) modal.hide();
        }
    }
}

// Update UI with user data
function updateUIWithUserData(userData) {
    const userNameElements = document.querySelectorAll('#userName, #profileName');
    userNameElements.forEach(el => {
        if (el) el.textContent = userData.name || 'User';
    });
    
    const userRoleElements = document.querySelectorAll('#userRole, #profileRole');
    userRoleElements.forEach(el => {
        if (el) el.textContent = userData.role || 'User';
    });
    
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
        const initials = getInitials(userData.name);
        avatarElement.textContent = initials;
    }
}

// Enhanced logout function
async function logout() {
    console.log('🔴 LOGOUT FUNCTION CALLED!');
    try {
        // Use Supabase logout if available (check for supabase client, not window.logout to avoid recursion)
        if (window.supabase && typeof window.supabase.auth.signOut === 'function') {
            console.log('Logging out from Supabase...');
            await window.supabase.auth.signOut();
        }
        
        // Clear all local storage data
        console.log('Clearing local storage...');
        localStorage.removeItem('mci-user');
        localStorage.removeItem('mci-activeDeliveries');
        localStorage.removeItem('mci-deliveryHistory');
        localStorage.removeItem('mci-customers');
        localStorage.removeItem('ePodRecords');
        localStorage.removeItem('mci-user-profile');
        
        // Clear any session storage as well
        sessionStorage.clear();
        
        console.log('Redirecting to login page...');
        // Redirect to login page
        window.location.href = '/login.html';
        
    } catch (error) {
        console.error('Error during logout:', error);
        // Still clear local data and redirect even if Supabase logout fails
        localStorage.removeItem('mci-user');
        localStorage.removeItem('mci-activeDeliveries');
        localStorage.removeItem('mci-deliveryHistory');
        localStorage.removeItem('mci-customers');
        localStorage.removeItem('ePodRecords');
        localStorage.removeItem('mci-user-profile');
        sessionStorage.clear();
        
        // Force redirect to login page
        window.location.href = '/login.html';
    }
}

// Make export functions globally accessible
window.exportEPodToPdf = exportEPodToPdf;

// Export Delivery History to PDF with signatures
function exportDeliveryHistoryToPdf() {
    try {
        // Show loading state
        const exportBtn = document.getElementById('exportDeliveryHistoryPdfBtn');
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...';
        exportBtn.disabled = true;

        // Get EPOD records from localStorage to find signatures
        let ePodRecords = [];
        try {
            const ePodData = localStorage.getItem('ePodRecords');
            if (ePodData) {
                ePodRecords = JSON.parse(ePodData);
            }
        } catch (error) {
            console.error('Error loading EPOD records:', error);
        }

        // Get selected deliveries
        const selectedCheckboxes = document.querySelectorAll('#deliveryHistoryTableBody tr input.delivery-history-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            showToast('Please select at least one delivery to export', 'warning');
            resetExportButton(exportBtn, originalText);
            return;
        }

        // Get the delivery data for selected records
        const selectedDeliveries = [];
        selectedCheckboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const drNumber = row.querySelector('td:nth-child(3) strong').textContent;
            
            // Find the delivery in window.deliveryHistory
            const delivery = window.deliveryHistory.find(d => (d.drNumber || d.dr_number) === drNumber);
            if (delivery) {
                // Find signature if available - FIXED: Use correct field names
                const ePodRecord = ePodRecords.find(record => (record.dr_number || record.drNumber) === drNumber);
                selectedDeliveries.push({
                    ...delivery,
                    signature: ePodRecord ? (ePodRecord.signature_data || ePodRecord.signature) : null
                });
            }
        });

        if (selectedDeliveries.length === 0) {
            showToast('No delivery records found to export', 'warning');
            resetExportButton(exportBtn, originalText);
            return;
        }

        // Create a new window for the PDF content
        const printWindow = window.open('', '_blank');
        
        // Generate HTML content for the PDF
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Delivery History Records</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    margin: 0;
                    color: #333;
                }
                .record {
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                .record-title {
                    background-color: #f5f5f5;
                    padding: 10px;
                    border-radius: 3px;
                    margin: -15px -15px 15px -15px;
                    font-weight: bold;
                }
                .field {
                    margin-bottom: 10px;
                }
                .field-label {
                    font-weight: bold;
                    display: inline-block;
                    width: 150px;
                }
                .signature-container {
                    margin: 20px 0;
                    text-align: center;
                }
                .signature-image {
                    max-width: 300px;
                    max-height: 100px;
                    border: 1px solid #ccc;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 1px solid #ccc;
                    font-size: 12px;
                    color: #666;
                }
                .status-completed {
                    color: #198754;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Delivery History Records</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
        `;

        // Add each selected record to the HTML content
        for (let i = 0; i < selectedDeliveries.length; i++) {
            const record = selectedDeliveries[i];
            const completedDate = record.completedDate || 'N/A';
            const signatureHtml = record.signature ? 
                `<img src="${record.signature}" class="signature-image" alt="Signature">` : 
                '<div>No signature available</div>';
                
            htmlContent += `
            <div class="record">
                <div class="record-title">Record #${i + 1}</div>
                <div class="field">
                    <span class="field-label">Date:</span>
                    <span>${completedDate}</span>
                </div>
                <div class="field">
                    <span class="field-label">DR Number:</span>
                    <span>${record.drNumber || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Customer Name:</span>
                    <span>${record.customerName || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Vendor Number:</span>
                    <span>${record.vendorNumber || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Origin:</span>
                    <span>${record.origin || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Destination:</span>
                    <span>${record.destination || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Distance:</span>
                    <span>${record.distance || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Additional Costs:</span>
                    <span>${record.additionalCosts ? `₱${record.additionalCosts.toFixed(2)}` : '₱0.00'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Status:</span>
                    <span>${record.status || 'N/A'}</span>
                </div>
                <div class="signature-container">
                    <div><strong>Signature:</strong></div>
                    ${signatureHtml}
                </div>
            </div>
            `;
        }

        htmlContent += `
            <div class="footer">
                <p>Document generated by MCI Delivery Tracker System</p>
            </div>
        </body>
        </html>
        `;

        // Write content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then trigger print
        printWindow.onload = function() {
            // Give it a small delay to ensure everything is rendered
            setTimeout(() => {
                printWindow.print();
                // Reset export button
                resetExportButton(exportBtn, originalText);
            }, 500);
        };

        showToast(`Exporting ${selectedDeliveries.length} delivery records to PDF. Please check your print dialog to save as PDF.`, 'success');
    } catch (error) {
        console.error('Error exporting Delivery History records to PDF:', error);
        showToast('Error exporting delivery records to PDF. Please try again.', 'error');
        
        // Reset export button
        const exportBtn = document.getElementById('exportDeliveryHistoryPdfBtn');
        if (exportBtn) {
            const originalText = '<i class="bi bi-file-earmark-pdf"></i> Export PDF';
            resetExportButton(exportBtn, originalText);
        }
    }
}

// Function to toggle selection mode in Delivery History
function toggleDeliveryHistorySelection() {
    const selectAllCheckbox = document.getElementById('selectAllHistory');
    const checkboxes = document.querySelectorAll('.delivery-history-checkbox');
    const selectBtn = document.getElementById('selectDeliveryHistoryBtn');
    const exportPdfBtn = document.getElementById('exportDeliveryHistoryPdfBtn');
    
    // Check if we're currently in selection mode by checking if selectAllCheckbox is visible
    const isSelectionMode = selectAllCheckbox.style.display === 'block';
    
    if (!isSelectionMode) {
        // Enable selection mode
        selectAllCheckbox.style.display = 'block';
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'block';
        });
        selectBtn.innerHTML = '<i class="bi bi-x-circle"></i> Cancel';
        exportPdfBtn.style.display = 'inline-block';
    } else {
        // Disable selection mode
        selectAllCheckbox.style.display = 'none';
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'none';
            checkbox.checked = false;
        });
        selectBtn.innerHTML = '<i class="bi bi-list-check"></i> Select';
        exportPdfBtn.style.display = 'none';
        
        // Uncheck select all
        selectAllCheckbox.checked = false;
    }
}

// Initialize Delivery History view enhancements
function initDeliveryHistoryView() {
    // Add event listener for select button
    const selectBtn = document.getElementById('selectDeliveryHistoryBtn');
    if (selectBtn) {
        selectBtn.addEventListener('click', toggleDeliveryHistorySelection);
    }
    
    // Add event listener for PDF export button
    const exportPdfBtn = document.getElementById('exportDeliveryHistoryPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportDeliveryHistoryToPdf);
    }
    
    // Add event listener for select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllHistory');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.delivery-history-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
}

// Modify the loadDeliveryHistory function to add checkboxes
function enhanceDeliveryHistoryTable() {
    // Add event listener to the table body to handle checkbox changes
    const tableBody = document.getElementById('deliveryHistoryTableBody');
    if (tableBody) {
        // Add event delegation for checkbox changes
        tableBody.addEventListener('change', function(e) {
            if (e.target && e.target.classList.contains('delivery-history-checkbox')) {
                // Update select all checkbox state
                const selectAllCheckbox = document.getElementById('selectAllHistory');
                const allCheckboxes = tableBody.querySelectorAll('.delivery-history-checkbox');
                const checkedCheckboxes = tableBody.querySelectorAll('.delivery-history-checkbox:checked');
                
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = allCheckboxes.length === checkedCheckboxes.length;
                    selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
                }
            }
        });
    }
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initDeliveryHistoryView();
    enhanceDeliveryHistoryTable();
});

// Make functions globally accessible
window.exportDeliveryHistoryToPdf = exportDeliveryHistoryToPdf;
window.toggleDeliveryHistorySelection = toggleDeliveryHistorySelection;

// Switch to Active Deliveries view (for DR upload integration)
function switchToActiveDeliveriesView() {
    console.log('Switching to Active Deliveries view...');
    
    try {
        // Find the active deliveries navigation link
        const activeDeliveriesLink = document.querySelector('a[data-view="active-deliveries"]');
        
        if (activeDeliveriesLink) {
            // Simulate click on the Active Deliveries tab
            activeDeliveriesLink.click();
            console.log('✅ Successfully switched to Active Deliveries view');
        } else {
            console.warn('Active Deliveries navigation link not found');
            
            // Fallback: manually show the active deliveries view
            const views = document.querySelectorAll('.view');
            views.forEach(view => view.classList.remove('active'));
            
            const activeDeliveriesView = document.getElementById('activeDeliveriesView');
            if (activeDeliveriesView) {
                activeDeliveriesView.classList.add('active');
                console.log('✅ Manually switched to Active Deliveries view');
            }
        }
        
    } catch (error) {
        console.error('Error switching to Active Deliveries view:', error);
    }
}

// Make function globally available
window.switchToActiveDeliveriesView = switchToActiveDeliveriesView;

// Make functions available globally
window.logout = logout;
window.testLogout = function() {
    console.log('🧪 TEST LOGOUT CALLED');
    logout();
};

// Add a function to manually test logout button connection
window.testLogoutButton = function() {
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('🧪 TESTING LOGOUT BUTTON');
    console.log('Button found:', logoutBtn);
    console.log('Button visible:', logoutBtn ? window.getComputedStyle(logoutBtn).display !== 'none' : false);
    console.log('Button has listener:', logoutBtn ? logoutBtn.hasAttribute('data-logout-attached') : false);
    
    if (logoutBtn) {
        console.log('🧪 Simulating click...');
        logoutBtn.click();
    }
};
window.saveProfileSettings = saveProfileSettings;
window.getInitials = getInitials;
window.updateUIWithUserData = updateUIWithUserData;
// 
========================================
// CLEAN LOGOUT IMPLEMENTATION - REWRITTEN
// ========================================

// Simple, reliable logout function
function performLogout() {
    console.log('🔴 LOGOUT: Starting logout process...');
    
    try {
        // Clear all localStorage data
        console.log('🔴 LOGOUT: Clearing localStorage...');
        localStorage.removeItem('mci-user');
        localStorage.removeItem('mci-activeDeliveries');
        localStorage.removeItem('mci-deliveryHistory');
        localStorage.removeItem('mci-customers');
        localStorage.removeItem('ePodRecords');
        localStorage.removeItem('mci-user-profile');
        
        // Clear sessionStorage
        console.log('🔴 LOGOUT: Clearing sessionStorage...');
        sessionStorage.clear();
        
        // Try Supabase logout if available
        if (window.supabase && window.supabase.auth && typeof window.supabase.auth.signOut === 'function') {
            console.log('🔴 LOGOUT: Signing out from Supabase...');
            window.supabase.auth.signOut().then(() => {
                console.log('🔴 LOGOUT: Supabase signout complete');
            }).catch((error) => {
                console.log('🔴 LOGOUT: Supabase signout error (continuing anyway):', error);
            });
        }
        
        // Redirect to login page
        console.log('🔴 LOGOUT: Redirecting to login page...');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 100); // Small delay to ensure cleanup completes
        
    } catch (error) {
        console.error('🔴 LOGOUT: Error during logout:', error);
        // Force redirect even if there's an error
        window.location.href = '/login.html';
    }
}

// Setup logout functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔴 LOGOUT: Setting up logout functionality...');
    
    // Wait a bit to ensure all elements are loaded
    setTimeout(() => {
        // Setup Settings logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('🔴 LOGOUT: Found Settings logout button, attaching listener');
            
            // Remove any existing listeners
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            
            // Add new listener
            newLogoutBtn.addEventListener('click', function(e) {
                console.log('🔴 LOGOUT: Settings logout button clicked!');
                e.preventDefault();
                e.stopPropagation();
                performLogout();
            });
        } else {
            console.log('🔴 LOGOUT: Settings logout button not found');
        }
        
        // Setup user dropdown logout
        const userRole = document.getElementById('userRole');
        const userDropdown = document.getElementById('userDropdown');
        const logoutOption = document.getElementById('logoutOption');
        
        if (userRole && userDropdown && logoutOption) {
            console.log('🔴 LOGOUT: Found user dropdown elements, setting up...');
            
            // Show/hide dropdown when clicking user role
            userRole.addEventListener('click', function(e) {
                console.log('🔴 LOGOUT: User role clicked, toggling dropdown');
                e.stopPropagation();
                const isVisible = userDropdown.style.display === 'block';
                userDropdown.style.display = isVisible ? 'none' : 'block';
            });
            
            // Handle logout option click
            logoutOption.addEventListener('click', function(e) {
                console.log('🔴 LOGOUT: Dropdown logout option clicked!');
                e.preventDefault();
                e.stopPropagation();
                userDropdown.style.display = 'none';
                performLogout();
            });
            
            // Hide dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!userRole.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.style.display = 'none';
                }
            });
        } else {
            console.log('🔴 LOGOUT: User dropdown elements not found');
        }
        
        // Global event delegation as backup
        document.addEventListener('click', function(e) {
            if (e.target && (e.target.id === 'logoutBtn' || e.target.id === 'logoutOption')) {
                console.log('🔴 LOGOUT: Logout clicked via event delegation!');
                e.preventDefault();
                e.stopPropagation();
                performLogout();
            }
        });
        
        console.log('🔴 LOGOUT: Setup complete!');
        
    }, 500); // Wait 500ms for all elements to be ready
});

// Make logout function globally available
window.performLogout = performLogout;
window.logout = performLogout; // Alias for compatibility

// Test function for debugging
window.testLogout = function() {
    console.log('🧪 TEST: Testing logout functionality...');
    performLogout();
};

console.log('🔴 LOGOUT: Clean logout implementation loaded');