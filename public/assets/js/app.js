console.log('app.js loaded');
(function() {
    // CRITICAL FIX: Use window.activeDeliveries directly instead of local variables
    // This ensures data synchronization between booking.js and app.js
    
    // Initialize global arrays if they don't exist
    if (typeof window.activeDeliveries === 'undefined') {
        window.activeDeliveries = [];
    }
    if (typeof window.deliveryHistory === 'undefined') {
        window.deliveryHistory = [];
    }
    
    // Use references to global arrays (not local copies)
    let activeDeliveries = window.activeDeliveries;
    let deliveryHistory = window.deliveryHistory;
    let refreshInterval = null;
    let filteredDeliveries = [];
    let filteredHistory = [];
    let currentSearchTerm = '';
    let currentHistorySearchTerm = '';

    // Test function to check if modals are working
    function testModalFunctionality() {
        console.log('=== TESTING MODAL FUNCTIONALITY ===');
        
        // Check if Bootstrap is available
        console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
        
        // Check if modal utility functions are available
        console.log('showModal available:', typeof window.showModal === 'function');
        console.log('hideModal available:', typeof window.hideModal === 'function');
        console.log('cleanupAllBackdrops available:', typeof window.cleanupAllBackdrops === 'function');
        
        // Test each modal
        const modals = ['bookingModal', 'addCustomerModal', 'editCustomerModal', 'eSignatureModal'];
        modals.forEach(modalId => {
            const modalElement = document.getElementById(modalId);
            console.log(`${modalId} exists:`, !!modalElement);
            if (modalElement) {
                console.log(`${modalId} Bootstrap instance:`, bootstrap.Modal.getInstance(modalElement));
            }
        });
        
        console.log('=== MODAL TEST COMPLETE ===');
    }

    // Make test function globally available
    window.testModalFunctionality = testModalFunctionality;

    // Functions
    function getStatusInfo(status) {
        switch (status) {
            case 'On Schedule':
                return { class: 'bg-success', icon: 'bi-check-circle' };
            case 'In Transit':
                return { class: 'bg-primary', icon: 'bi-truck' };
            case 'Delayed':
                return { class: 'bg-warning', icon: 'bi-exclamation-triangle' };
            case 'Completed':
                return { class: 'bg-success', icon: 'bi-check-circle' };
            default:
                return { class: 'bg-secondary', icon: 'bi-question-circle' };
        }
    }

    // Generate status options based on current status and business rules
    function generateStatusOptions(currentStatus, deliveryId) {
        const availableStatuses = ['In Transit', 'On Schedule', 'Delayed'];
        
        // Don't allow changing from Completed or Signed status
        if (currentStatus === 'Completed' || currentStatus === 'Signed') {
            return `<div class="status-option disabled">Status cannot be changed</div>`;
        }
        
        return availableStatuses.map(status => {
            const isSelected = status === currentStatus ? 'selected' : '';
            const statusInfo = getStatusInfo(status);
            return `
                <div class="status-option ${isSelected}" 
                     onclick="updateDeliveryStatusById('${deliveryId}', '${status}')">
                    <i class="bi ${statusInfo.icon}"></i> ${status}
                </div>
            `;
        }).join('');
    }

    // Toggle status dropdown visibility
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

    // Update delivery status by delivery ID (for dropdown)
    function updateDeliveryStatusById(deliveryId, newStatus) {
        console.log(`Updating status for delivery ${deliveryId} to ${newStatus}`);
        
        // Find the delivery and update its status using field mapping service
        const deliveryIndex = window.fieldMappingService ? 
            window.fieldMappingService.findDeliveryIndexById(activeDeliveries, deliveryId) :
            activeDeliveries.findIndex(d => 
                d.id === deliveryId || d.delivery_id === deliveryId || 
                String(d.id) === String(deliveryId));
        if (deliveryIndex !== -1) {
            const oldStatus = activeDeliveries[deliveryIndex].status;
            activeDeliveries[deliveryIndex].status = newStatus;
            
            // Update timestamp for status change
            activeDeliveries[deliveryIndex].lastStatusUpdate = new Date().toISOString();
            
            // Save to localStorage and database
            localStorage.setItem('mci-active-deliveries', JSON.stringify(activeDeliveries));
            saveToDatabase();
            
            // Refresh only the table display, don't reload all data
            if (typeof populateActiveDeliveriesTable === 'function') {
                populateActiveDeliveriesTable();
            } else {
                // Fallback: reload data if populate function not available
                loadActiveDeliveries();
            }
            
            // Show success message
            showToast(`Status updated from "${oldStatus}" to "${newStatus}"`, 'success');
            
            // Update analytics dashboard stats
            if (typeof window.updateDashboardStats === 'function') {
                setTimeout(() => {
                    window.updateDashboardStats();
                }, 100);
            }
            
            // Close the dropdown
            const dropdown = document.getElementById(`statusDropdown-${deliveryId}`);
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
    }

    // Update delivery status by DR number (for signature completion)
    function updateDeliveryStatus(drNumber, newStatus) {
        console.log(`Updating DR ${drNumber} status to: ${newStatus}`);
        
        try {
            // Find delivery by DR number and update status
            const deliveryIndex = activeDeliveries.findIndex(d => (d.drNumber || d.dr_number) === drNumber);
            if (deliveryIndex !== -1) {
                const delivery = activeDeliveries[deliveryIndex];
                const oldStatus = delivery.status;
                delivery.status = newStatus;
                delivery.lastStatusUpdate = new Date().toISOString();
                
                // If status is Completed, move to delivery history
                if (newStatus === 'Completed') {
                    delivery.completedDate = new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    // Add to delivery history
                    if (!deliveryHistory) {
                        window.deliveryHistory = [];
                        deliveryHistory = window.deliveryHistory;
                    }
                    deliveryHistory.unshift(delivery);
                    
                    // Remove from active deliveries
                    activeDeliveries.splice(deliveryIndex, 1);
                    
                    console.log(`Moved DR ${drNumber} from active to history`);
                }
                
                // Save to localStorage and database - FIXED: Ensure proper saving to both
                localStorage.setItem('mci-active-deliveries', JSON.stringify(activeDeliveries));
                localStorage.setItem('mci-delivery-history', JSON.stringify(deliveryHistory));
                
                // Also save to Supabase if dataService is available
                if (typeof window.dataService !== 'undefined' && typeof window.dataService.saveDelivery === 'function') {
                    // Save the delivery that was updated
                    window.dataService.saveDelivery(delivery).catch(error => {
                        console.error('Error saving delivery to Supabase:', error);
                    });
                    
                    // Also save all deliveries to ensure consistency
                    saveToDatabase();
                } else {
                    saveToDatabase();
                }
                
                // Refresh the display
                loadActiveDeliveries();
                loadDeliveryHistory();
                
                // Update analytics dashboard stats
                if (typeof window.updateDashboardStats === 'function') {
                    setTimeout(() => {
                        window.updateDashboardStats();
                    }, 100);
                }
                
                console.log(`Successfully updated DR ${drNumber} from "${oldStatus}" to "${newStatus}"`);
            } else {
                console.warn(`Delivery with DR ${drNumber} not found in active deliveries`);
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
        }
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.status-dropdown-container')) {
            document.querySelectorAll('.status-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });

    // Legacy function for status change handling (keeping for compatibility)
    function handleStatusChange(e) {
        const deliveryId = e.target.dataset.deliveryId;
        const newStatus = e.target.value;
        console.log(`Status changed for delivery ${deliveryId} to ${newStatus}`);
        
        // Find the delivery and update its status
        const deliveryIndex = activeDeliveries.findIndex(d => d.id === deliveryId);
        if (deliveryIndex !== -1) {
            activeDeliveries[deliveryIndex].status = newStatus;
            
            // If status is changed to "Completed", move to history
            if (newStatus === 'Completed') {
                const completedDelivery = activeDeliveries[deliveryIndex];
                completedDelivery.completedDate = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Move to history
                deliveryHistory.unshift(completedDelivery);
                activeDeliveries.splice(deliveryIndex, 1);
                
                // Save to database
                saveToDatabase();
            } else {
                // Save to database
                saveToDatabase();
            }
            
            loadActiveDeliveries();
            loadDeliveryHistory();
            
            // Update analytics dashboard stats
            if (typeof window.updateDashboardStats === 'function') {
                setTimeout(() => {
                    window.updateDashboardStats();
                }, 100);
            }
            
            showToast(`Delivery status updated to ${newStatus}`);
        }
    }

    // Placeholder function for showing E-Signature modal - now using robust implementation
    function showESignatureModal(drNumber) {
        console.log(`Showing E-Signature modal for DR: ${drNumber}`);
        
        // Use the new robust E-Signature implementation if available
        if (typeof window.openRobustSignaturePad === 'function') {
            // Try to get real delivery data from active deliveries
            let customerName = '';
            let customerContact = '';
            let truckPlate = '';
            let deliveryRoute = '';
            
            // Find the delivery in activeDeliveries array
            if (window.activeDeliveries && Array.isArray(window.activeDeliveries)) {
                const delivery = window.activeDeliveries.find(d => d.drNumber === drNumber);
                if (delivery) {
                    customerName = delivery.customerName || '';
                    customerContact = delivery.vendorNumber || '';
                    truckPlate = delivery.truckPlateNumber || '';
                    deliveryRoute = (delivery.origin && delivery.destination) ? 
                        `${delivery.origin} to ${delivery.destination}` : '';
                }
            }
            
            window.openRobustSignaturePad(drNumber, customerName, customerContact, truckPlate, deliveryRoute);
        } else {
            // Fallback to original implementation
            // Set delivery details in modal
            document.getElementById('ePodDrNumber').value = drNumber;
            // In a real app, you would fetch these details from your data
            document.getElementById('ePodCustomerName').value = '';
            document.getElementById('ePodCustomerContact').value = '';
            document.getElementById('ePodTruckPlate').value = '';
            document.getElementById('ePodDeliveryRoute').value = '';
            
            // Show modal using our utility function if available
            if (typeof window.showModal === 'function') {
                window.showModal('eSignatureModal');
            } else {
                // Fallback method
                const eSignatureModal = new bootstrap.Modal(document.getElementById('eSignatureModal'));
                eSignatureModal.show();
            }
        }
    }

    // Placeholder function for showing E-POD modal
    function showEPodModal(drNumber) {
        console.log(`Showing E-POD modal for DR: ${drNumber}`);
        // This would be implemented in another file
        alert(`E-POD functionality for ${drNumber} would be implemented here`);
    }

    // Save data to database
    async function saveToDatabase() {
        try {
            if (window.dataService) {
                // Save active deliveries
                for (const delivery of activeDeliveries) {
                    await window.dataService.saveDelivery(delivery);
                }
                
                // Save delivery history
                for (const delivery of deliveryHistory) {
                    await window.dataService.saveDelivery(delivery);
                }
                
                console.log('Data saved to Supabase successfully');
            } else {
                throw new Error('DataService not available');
            }
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            // Fallback to localStorage
            saveToLocalStorage();
        }
    }

    // Save data to localStorage (fallback)
    function saveToLocalStorage() {
        // Always use the current global arrays
        const currentActiveDeliveries = window.activeDeliveries || [];
        const currentDeliveryHistory = window.deliveryHistory || [];
        
        // Use dataService to save deliveries if available
        if (typeof window.dataService !== 'undefined') {
            // Save each active delivery
            currentActiveDeliveries.forEach(delivery => {
                window.dataService.saveDelivery(delivery).catch(error => {
                    console.error('Error saving delivery to dataService:', error);
                    // Fallback to localStorage
                    fallbackSaveToLocalStorage();
                });
            });
            
            // Save each delivery history item
            currentDeliveryHistory.forEach(delivery => {
                window.dataService.saveDelivery(delivery).catch(error => {
                    console.error('Error saving delivery history to dataService:', error);
                    // Fallback to localStorage
                    fallbackSaveToLocalStorage();
                });
            });
            
            console.log('Data saved using dataService');
        } else {
            // Fallback to localStorage
            fallbackSaveToLocalStorage();
        }
    }

    function fallbackSaveToLocalStorage() {
        try {
            // Always use the current global arrays
            const currentActiveDeliveries = window.activeDeliveries || [];
            const currentDeliveryHistory = window.deliveryHistory || [];
            
            localStorage.setItem('mci-active-deliveries', JSON.stringify(currentActiveDeliveries));
            localStorage.setItem('mci-delivery-history', JSON.stringify(currentDeliveryHistory));
            console.log(`Data saved to localStorage: ${currentActiveDeliveries.length} active, ${currentDeliveryHistory.length} history`);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Load data from database
    async function loadFromDatabase() {
        try {
            // Use dataService to load deliveries if available
            if (typeof window.dataService !== 'undefined') {
                const deliveries = await window.dataService.getDeliveries();
                
                // Use global field mapper to normalize all delivery objects
                const normalizedDeliveries = window.normalizeDeliveryArray ? 
                    window.normalizeDeliveryArray(deliveries) : deliveries;
                
                // Properly separate active deliveries from history based on status
                activeDeliveries = normalizedDeliveries.filter(d => 
                    d.status !== 'Completed' && d.status !== 'Signed'
                );
                deliveryHistory = normalizedDeliveries.filter(d => 
                    d.status === 'Completed' || d.status === 'Signed'
                );
                
                console.log('Active deliveries loaded from Supabase:', activeDeliveries.length);
                console.log('Delivery history loaded from Supabase:', deliveryHistory.length);
                
                // Update global references
                window.activeDeliveries = activeDeliveries;
                window.deliveryHistory = deliveryHistory;
                
                return true;
            } else {
                // Fallback to current implementation
                return await fallbackLoadFromDatabase();
            }
        } catch (error) {
            console.error('Error loading from Supabase, using fallback:', error);
            // Fallback to current implementation
            return await fallbackLoadFromDatabase();
        }
    }

    // Fallback implementation for loading from database
    async function fallbackLoadFromDatabase() {
        try {
            // Load active deliveries
            const getDeliveries = typeof window.getDeliveries === 'function' ? window.getDeliveries : null;
            if (getDeliveries) {
                const deliveries = await getDeliveries();
                // Use global field mapper to normalize all delivery objects
                const normalizedDeliveries = window.normalizeDeliveryArray ? 
                    window.normalizeDeliveryArray(deliveries) : deliveries;
                activeDeliveries = normalizedDeliveries.filter(d => d.status !== 'Completed');
                deliveryHistory = normalizedDeliveries.filter(d => d.status === 'Completed');
                
                console.log('Active deliveries loaded from database:', activeDeliveries.length);
                console.log('Delivery history loaded from database:', deliveryHistory.length);
                
                // Update global references
                window.activeDeliveries = activeDeliveries;
                window.deliveryHistory = deliveryHistory;
                
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error loading from database:', error);
            return false;
        }
    }

    // Load data from localStorage (fallback)
    function loadFromLocalStorage() {
        try {
            const savedActive = localStorage.getItem('mci-active-deliveries');
            const savedHistory = localStorage.getItem('mci-delivery-history');
            
            if (savedActive) {
                let parsedActive = JSON.parse(savedActive);
                // Use global field mapper to normalize all delivery objects
                parsedActive = window.normalizeDeliveryArray ? 
                    window.normalizeDeliveryArray(parsedActive) : parsedActive;
                window.activeDeliveries = parsedActive;
                activeDeliveries = window.activeDeliveries; // Update reference
                console.log('Active deliveries loaded from localStorage:', activeDeliveries.length);
            }
            
            if (savedHistory) {
                let parsedHistory = JSON.parse(savedHistory);
                // Use global field mapper to normalize all delivery objects
                parsedHistory = window.normalizeDeliveryArray ? 
                    window.normalizeDeliveryArray(parsedHistory) : parsedHistory;
                window.deliveryHistory = parsedHistory;
                deliveryHistory = window.deliveryHistory; // Update reference
                console.log('Delivery history loaded from localStorage:', deliveryHistory.length);
            }
            
            // Update global references
            window.activeDeliveries = activeDeliveries;
            window.deliveryHistory = deliveryHistory;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

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

    // Export Active Deliveries to Excel
    function exportActiveDeliveriesToExcel() {
        try {
            // Check if XLSX library is available
            if (typeof XLSX === 'undefined') {
                showToast('Excel export library not loaded. Please try again.', 'error');
                return;
            }

            // Get data to export (filtered or all)
            const dataToExport = currentSearchTerm ? filteredDeliveries : activeDeliveries;
            
            if (dataToExport.length === 0) {
                showToast('No data to export', 'warning');
                return;
            }

            // Prepare data for export
            const exportData = dataToExport.map(delivery => ({
                'DR Number': delivery.drNumber || 'N/A',
                'Origin': delivery.origin || 'N/A',
                'Destination': delivery.destination || 'N/A',
                'Distance': delivery.distance || 'N/A',
                'Truck': delivery.truckPlateNumber || 'N/A',
                'Status': delivery.status || 'N/A',
                'Booked Date': delivery.deliveryDate || delivery.timestamp || 'N/A',
                'Additional Costs': delivery.additionalCosts ? `₱${delivery.additionalCosts.toFixed(2)}` : '₱0.00'
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 15 }, // DR Number
                { wch: 25 }, // Origin
                { wch: 25 }, // Destination
                { wch: 12 }, // Distance
                { wch: 15 }, // Truck
                { wch: 15 }, // Status
                { wch: 15 }, // Booked Date
                { wch: 15 }  // Additional Costs
            ];

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Active Deliveries');
            
            // Generate filename with date
            const date = new Date().toISOString().split('T')[0];
            const searchTerm = currentSearchTerm ? `_${currentSearchTerm.replace(/\s+/g, '_')}` : '';
            const filename = `Active_Deliveries_${date}${searchTerm}.xlsx`;
            
            // Export to file
            XLSX.writeFile(wb, filename);
            
            showToast(`Exported ${dataToExport.length} delivery records to ${filename}`, 'success');
        } catch (error) {
            console.error('Error exporting Active Deliveries:', error);
            showToast('Error exporting data. Please try again.', 'error');
        }
    }

    // Export Delivery History to Excel
    function exportDeliveryHistoryToExcel() {
        try {
            // Check if XLSX library is available
            if (typeof XLSX === 'undefined') {
                showToast('Excel export library not loaded. Please try again.', 'error');
                return;
            }

            // Get data to export (filtered or all)
            const dataToExport = currentHistorySearchTerm ? filteredHistory : deliveryHistory;
            
            if (dataToExport.length === 0) {
                showToast('No data to export', 'warning');
                return;
            }

            // Prepare data for export
            const exportData = dataToExport.map(delivery => ({
                'Date': delivery.completedDate || 'N/A',
                'DR Number': delivery.drNumber || 'N/A',
                'Customer Name': delivery.customerName || 'N/A',
                'Vendor Number': delivery.vendorNumber || 'N/A',
                'Origin': delivery.origin || 'N/A',
                'Destination': delivery.destination || 'N/A',
                'Distance': delivery.distance || 'N/A',
                'Additional Costs': delivery.additionalCosts ? `₱${delivery.additionalCosts.toFixed(2)}` : '₱0.00',
                'Status': delivery.status || 'N/A'
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 15 }, // Date
                { wch: 15 }, // DR Number
                { wch: 25 }, // Customer Name
                { wch: 25 }, // Customer Number
                { wch: 25 }, // Origin
                { wch: 25 }, // Destination
                { wch: 12 }, // Distance
                { wch: 15 }, // Additional Costs
                { wch: 15 }  // Status
            ];

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Delivery History');
            
            // Generate filename with date
            const date = new Date().toISOString().split('T')[0];
            const searchTerm = currentHistorySearchTerm ? `_${currentHistorySearchTerm.replace(/\s+/g, '_')}` : '';
            const filename = `Delivery_History_${date}${searchTerm}.xlsx`;
            
            // Export to file
            XLSX.writeFile(wb, filename);
            
            showToast(`Exported ${dataToExport.length} delivery records to ${filename}`, 'success');
        } catch (error) {
            console.error('Error exporting Delivery History:', error);
            showToast('Error exporting data. Please try again.', 'error');
        }
    }

    // Load active deliveries
    function loadActiveDeliveries() {
        console.log('=== LOAD ACTIVE DELIVERIES FUNCTION CALLED ===');
        
        // CRITICAL FIX: Ensure we're always working with the global arrays
        activeDeliveries = window.activeDeliveries;
        deliveryHistory = window.deliveryHistory;
        
        console.log('✅ Using global activeDeliveries directly:', activeDeliveries.length);
        
        // If global arrays are empty, try to load from localStorage immediately
        if (activeDeliveries.length === 0) {
            try {
                const savedActive = localStorage.getItem('mci-active-deliveries');
                if (savedActive) {
                    const parsedActive = JSON.parse(savedActive);
                    if (parsedActive && parsedActive.length > 0) {
                        window.activeDeliveries = parsedActive;
                        activeDeliveries = window.activeDeliveries; // Update reference
                        console.log('✅ Loaded activeDeliveries from localStorage:', activeDeliveries.length);
                    }
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);
            }
        }
        
        // CRITICAL FIX: Always populate table immediately with current data
        populateActiveDeliveriesTable();
        
        // Also try to load from database in background (but don't wait for it)
        loadFromDatabase().then(success => {
            if (!success) {
                loadFromLocalStorage();
            }
            
            // Re-sync and re-populate after database load
            activeDeliveries = window.activeDeliveries;
            deliveryHistory = window.deliveryHistory;
            console.log('✅ Post-database-load sync: activeDeliveries count:', activeDeliveries.length);
            
            // Re-populate table with potentially updated data
            populateActiveDeliveriesTable();
        }).catch(error => {
            console.error('Error loading from database:', error);
            // Even if database fails, we still have the table populated from above
        });
    }

    // Separate function to populate the Active Deliveries table
    function populateActiveDeliveriesTable() {
        console.log('📊 Populating Active Deliveries table...');
        
        const activeDeliveriesTableBody = document.getElementById('activeDeliveriesTableBody');
        if (!activeDeliveriesTableBody) {
            console.error('❌ Active deliveries table body not found');
            return;
        }
        
        // Ensure we have the latest data
        activeDeliveries = window.activeDeliveries || [];
        
        // Apply search filter using global field mapper
        filteredDeliveries = currentSearchTerm ? 
            activeDeliveries.filter(delivery => {
                const getField = window.getFieldValue || ((obj, field) => obj[field]);
                const drNumber = getField(delivery, 'drNumber') || getField(delivery, 'dr_number') || '';
                return drNumber.toLowerCase().includes(currentSearchTerm.toLowerCase());
            }) : 
            [...activeDeliveries];
    
        // Update search results info
        const searchResultsInfo = document.getElementById('searchResultsInfo');
        if (searchResultsInfo) {
            if (currentSearchTerm) {
                searchResultsInfo.innerHTML = `
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Found ${filteredDeliveries.length} delivery${filteredDeliveries.length !== 1 ? 's' : ''} 
                        matching "${currentSearchTerm}"
                    </div>
                `;
                searchResultsInfo.style.display = 'block';
            } else {
                searchResultsInfo.style.display = 'none';
            }
        }
        
        // Debug logging
        console.log('📊 Active Deliveries Debug Info:');
        console.log('- Local activeDeliveries:', activeDeliveries.length);
        console.log('- Window activeDeliveries:', window.activeDeliveries ? window.activeDeliveries.length : 'undefined');
        console.log('- Filtered deliveries:', filteredDeliveries.length);
        console.log('- Current search term:', currentSearchTerm);
        
        if (filteredDeliveries.length > 0) {
            console.log('- Sample delivery:', filteredDeliveries[0]);
        }
        
        // Display deliveries
        if (filteredDeliveries.length === 0) {
            activeDeliveriesTableBody.innerHTML = `
                <tr>
                    <td colspan="13" class="text-center py-5">
                        <i class="bi bi-truck" style="font-size: 3rem; opacity: 0.3;"></i>
                        <h4 class="mt-3">No active deliveries found</h4>
                        <p class="text-muted">
                            ${currentSearchTerm ? 'Try adjusting your search criteria' : 'All deliveries are completed or there are no deliveries yet'}
                        </p>
                    </td>
                </tr>
            `;
            console.log('📊 Displayed empty state message');
            return;
        }
        
        // Generate table rows
        activeDeliveriesTableBody.innerHTML = filteredDeliveries.map((delivery, index) => {
            const statusInfo = getStatusInfo(delivery.status);
            
            // Debug logging for first few deliveries to identify field structure
            if (index < 3) {
                console.log(`🔍 Delivery ${index} structure:`, delivery);
                console.log(`🔍 Available fields:`, Object.keys(delivery));
                console.log(`🔍 Field values check:`, {
                    'delivery.dr_number': delivery.dr_number,
                    'delivery.drNumber': delivery.drNumber,
                    'delivery.customer_name': delivery.customer_name,
                    'delivery.customerName': delivery.customerName,
                    'delivery.origin': delivery.origin,
                    'delivery.destination': delivery.destination
                });
            }
            
            // Use global field mapper for consistent field access
            const getField = window.getFieldValue || ((obj, field) => {
                console.log(`⚠️ Field mapper not available, using fallback for field: ${field}`);
                return obj[field];
            });
            
            const drNumber = getField(delivery, 'drNumber') || getField(delivery, 'dr_number') || 'N/A';
            const customerName = getField(delivery, 'customerName') || getField(delivery, 'customer_name') || 'N/A';
            const vendorNumber = getField(delivery, 'vendorNumber') || getField(delivery, 'vendor_number') || 'N/A';
            const origin = getField(delivery, 'origin') || 'N/A';
            const destination = getField(delivery, 'destination') || 'N/A';
            
            const truckType = getField(delivery, 'truckType') || getField(delivery, 'truck_type') || '';
            const truckPlate = getField(delivery, 'truckPlateNumber') || getField(delivery, 'truck_plate_number') || '';
            const truckInfo = delivery.truck || 
                             (truckType && truckPlate ? `${truckType} (${truckPlate})` : truckPlate || 'N/A');
            
            const deliveryDate = getField(delivery, 'deliveryDate') || getField(delivery, 'created_date') || 
                               getField(delivery, 'timestamp') || getField(delivery, 'created_at') || 'N/A';
            
            // Get new fields
            const itemNumber = getField(delivery, 'itemNumber') || getField(delivery, 'item_number') || '';
            const mobileNumber = getField(delivery, 'mobileNumber') || getField(delivery, 'mobile_number') || '';
            const itemDescription = getField(delivery, 'itemDescription') || getField(delivery, 'item_description') || '';
            const serialNumber = getField(delivery, 'serialNumber') || getField(delivery, 'serial_number') || '';
            
            return `
                <tr data-delivery-id="${delivery.id}">
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
                                  onclick="toggleStatusDropdown('${delivery.id}')">
                                <i class="bi ${statusInfo.icon}"></i> ${delivery.status}
                                <i class="bi bi-chevron-down ms-1" style="font-size: 0.8em;"></i>
                            </span>
                            <div class="status-dropdown" id="statusDropdown-${delivery.id}" style="display: none;">
                                ${generateStatusOptions(delivery.status, delivery.id)}
                            </div>
                        </div>
                    </td>
                    <td>${deliveryDate}</td>
                    <td>${itemNumber}</td>
                    <td>${mobileNumber}</td>
                    <td>${itemDescription}</td>
                    <td>${serialNumber}</td>
                </tr>
            `;
        }).join('');
        
        console.log(`✅ Successfully populated table with ${filteredDeliveries.length} deliveries`);
        
        // Update booking view dashboard with real data
        if (typeof window.updateBookingViewDashboard === 'function') {
            setTimeout(() => {
                window.updateBookingViewDashboard();
            }, 100);
        }
    }

// Load delivery history
function loadDeliveryHistory() {
    console.log('=== LOAD DELIVERY HISTORY FUNCTION CALLED ===');
    
    console.log('📊 Current delivery history length:', window.deliveryHistory ? window.deliveryHistory.length : 0);
    
    // CRITICAL FIX: Skip database loading for now and use current global data
    // The database loading was overwriting our freshly updated delivery history
    const deliveryHistoryTableBody = document.getElementById('deliveryHistoryTableBody');
    if (!deliveryHistoryTableBody) {
        console.error('Delivery history table body not found');
        return;
    }
    
    // Apply search filter - use global window.deliveryHistory
    const currentDeliveryHistory = window.deliveryHistory || [];
    console.log('📊 Using delivery history with', currentDeliveryHistory.length, 'items');
    
    filteredHistory = currentHistorySearchTerm ? 
        currentDeliveryHistory.filter(delivery => 
            (delivery.drNumber || delivery.dr_number || '').toLowerCase().includes(currentHistorySearchTerm.toLowerCase())
        ) : 
        [...currentDeliveryHistory];
    
    console.log('📊 Filtered history:', filteredHistory.length, 'items');
        
        // Update search results info
        const historySearchResultsInfo = document.getElementById('historySearchResultsInfo');
        if (historySearchResultsInfo) {
            if (currentHistorySearchTerm) {
                historySearchResultsInfo.innerHTML = `
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Found ${filteredHistory.length} delivery${filteredHistory.length !== 1 ? 's' : ''} 
                        matching "${currentHistorySearchTerm}"
                    </div>
                `;
                historySearchResultsInfo.style.display = 'block';
            } else {
                historySearchResultsInfo.style.display = 'none';
            }
        }
        
        // Display history
        if (filteredHistory.length === 0) {
            deliveryHistoryTableBody.innerHTML = `
                <tr>
                    <td colspan="14" class="text-center py-5">
                        <i class="bi bi-clipboard-check" style="font-size: 3rem; opacity: 0.3;"></i>
                        <h4 class="mt-3">No delivery history found</h4>
                        <p class="text-muted">
                            ${currentHistorySearchTerm ? 'Try adjusting your search criteria' : 'No completed deliveries yet'}
                        </p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Get EPOD records to check which deliveries are signed
        let ePodRecords = [];
        try {
            const ePodData = localStorage.getItem('ePodRecords');
            if (ePodData) {
                ePodRecords = JSON.parse(ePodData);
            }
        } catch (error) {
            console.error('Error loading EPOD records:', error);
        }
        
        // Generate table rows
        deliveryHistoryTableBody.innerHTML = filteredHistory.map(delivery => {
            const statusInfo = getStatusInfo(delivery.status);
            
            // Check if this delivery has been signed - FIXED: Use correct field names for both delivery and EPOD records
            const deliveryDrNumber = delivery.drNumber || delivery.dr_number || '';
            const isSigned = ePodRecords.some(record => (record.dr_number || record.drNumber || '') === deliveryDrNumber);
            
            // Build status display
            let statusDisplay = `
                <span class="badge ${statusInfo.class}">
                    <i class="bi ${statusInfo.icon}"></i> ${delivery.status}
                </span>
            `;
            
            // Add signed badge if delivery has been signed
            if (isSigned) {
                statusDisplay += `
                    <span class="badge bg-warning text-dark ms-1">
                        <i class="bi bi-pen"></i> Signed
                    </span>
                `;
            }
            
            // Get new fields - FIXED: Use the field mapper for consistency
            const getField = window.getFieldValue || ((obj, field) => obj[field]);
            const itemNumber = getField(delivery, 'itemNumber') || getField(delivery, 'item_number') || '';
            const mobileNumber = getField(delivery, 'mobileNumber') || getField(delivery, 'mobile_number') || '';
            const itemDescription = getField(delivery, 'itemDescription') || getField(delivery, 'item_description') || '';
            const serialNumber = getField(delivery, 'serialNumber') || getField(delivery, 'serial_number') || '';
            
            return `
                <tr>
                    <td>
                        <input type="checkbox" class="form-check-input delivery-history-checkbox" style="display: none;" data-dr-number="${deliveryDrNumber}">
                    </td>
                    <td>${delivery.completedDateTime || delivery.completedDate || 'N/A'}</td>
                    <td><strong>${deliveryDrNumber}</strong></td>
                    <td>${delivery.customerName || delivery.customer_name || 'N/A'}</td>
                    <td>${delivery.vendorNumber || delivery.vendor_number || 'N/A'}</td>
                    <td>${delivery.origin || 'N/A'}</td>
                    <td>${delivery.destination || 'N/A'}</td>
                    <td>${delivery.additionalCosts ? `₱${delivery.additionalCosts.toFixed(2)}` : '₱0.00'}</td>
                    <td>
                        ${statusDisplay}
                    </td>
                    <td>${itemNumber}</td>
                    <td>${mobileNumber}</td>
                    <td>${itemDescription}</td>
                    <td>${serialNumber}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="showEPodModal('${deliveryDrNumber}')">
                            <i class="bi bi-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update booking view dashboard with real data
        if (typeof window.updateBookingViewDashboard === 'function') {
            setTimeout(() => {
                window.updateBookingViewDashboard();
            }, 100);
        }
        
        console.log('Delivery history loaded successfully');
}

// Initialize the application
function initApp() {
    console.log('=== INIT APP FUNCTION CALLED ===');
    
    // Load initial data
    loadFromDatabase().then(success => {
        if (!success) {
            loadFromLocalStorage();
        }
        
        // Load initial views
        loadActiveDeliveries();
        loadDeliveryHistory();
        
        // Update booking view dashboard with real data
        if (typeof window.updateBookingViewDashboard === 'function') {
            setTimeout(() => {
                window.updateBookingViewDashboard();
            }, 100);
        }
        
        console.log('App initialized successfully');
    }).catch(error => {
        console.error('Error initializing app:', error);
    });
}

// Make functions globally available
window.loadActiveDeliveries = loadActiveDeliveries;
window.populateActiveDeliveriesTable = populateActiveDeliveriesTable;
window.loadDeliveryHistory = loadDeliveryHistory;
window.saveToLocalStorage = saveToLocalStorage;
window.toggleStatusDropdown = toggleStatusDropdown;
window.updateDeliveryStatusById = updateDeliveryStatusById;
window.updateDeliveryStatus = updateDeliveryStatus;
window.generateStatusOptions = generateStatusOptions;
window.exportActiveDeliveriesToExcel = exportActiveDeliveriesToExcel;
window.exportDeliveryHistoryToExcel = exportDeliveryHistoryToExcel;
window.showESignatureModal = showESignatureModal;
window.showEPodModal = showEPodModal;
window.handleStatusChange = handleStatusChange;
window.testModalFunctionality = testModalFunctionality;

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('App.js: DOMContentLoaded event fired');
    
    // Initialize the app
    initApp();
    
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
            document.querySelectorAll('.delivery-checkbox').forEach(checkbox => {
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
            // Update select all checkbox state
            if (selectAllActive) {
                const allCheckboxes = document.querySelectorAll('.delivery-checkbox');
                const checkedCheckboxes = document.querySelectorAll('.delivery-checkbox:checked');
                selectAllActive.checked = allCheckboxes.length === checkedCheckboxes.length;
            }
            
            // Enable/disable E-Signature button based on selection
            if (eSignatureBtn) {
                const anyChecked = document.querySelectorAll('.delivery-checkbox:checked').length > 0;
                eSignatureBtn.disabled = !anyChecked;
            }
        }
    });
    
    if (eSignatureBtn) {
        eSignatureBtn.addEventListener('click', function() {
            // Get selected deliveries
            const selectedDeliveries = Array.from(document.querySelectorAll('.delivery-checkbox:checked'))
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
    
    // Add event listener for Delivery History PDF export button
    const exportDeliveryHistoryPdfBtn = document.getElementById('exportDeliveryHistoryPdfBtn');
    if (exportDeliveryHistoryPdfBtn) {
        exportDeliveryHistoryPdfBtn.addEventListener('click', exportDeliveryHistoryToPdf);
    }
    
    // Add event listener for Delivery History select button
    const selectDeliveryHistoryBtn = document.getElementById('selectDeliveryHistoryBtn');
    if (selectDeliveryHistoryBtn) {
        selectDeliveryHistoryBtn.addEventListener('click', toggleDeliveryHistorySelection);
    }
    
    // Add event listener for select all history checkbox
    const selectAllHistory = document.getElementById('selectAllHistory');
    if (selectAllHistory) {
        selectAllHistory.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.delivery-history-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    console.log('App.js: Event listeners added');
});

// Add event delegation for delivery history checkboxes
document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('delivery-history-checkbox')) {
        // Update select all checkbox state
        const selectAllHistory = document.getElementById('selectAllHistory');
        const allCheckboxes = document.querySelectorAll('.delivery-history-checkbox');
        const checkedCheckboxes = document.querySelectorAll('.delivery-history-checkbox:checked');
        
        if (selectAllHistory) {
            selectAllHistory.checked = allCheckboxes.length === checkedCheckboxes.length;
            selectAllHistory.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
        }
    }
});

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
        selectBtn.innerHTML = '<i class="bi bi-printer"></i> Print';
        exportPdfBtn.style.display = 'none';
        
        // Uncheck select all
        selectAllCheckbox.checked = false;
    }
}

// Export Delivery History to PDF with signatures
async function exportDeliveryHistoryToPdf() {
    try {
        // Show loading state
        const exportBtn = document.getElementById('exportDeliveryHistoryPdfBtn');
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...';
        exportBtn.disabled = true;

        // ENHANCED: Get EPOD records from BOTH localStorage AND Supabase to find signatures
        let ePodRecords = [];
        
        // Original localStorage logic (commented but preserved)
        // try {
        //     const ePodData = localStorage.getItem('ePodRecords');
        //     if (ePodData) {
        //         ePodRecords = JSON.parse(ePodData);
        //     }
        // } catch (error) {
        //     console.error('Error loading EPOD records:', error);
        // }
        
        // ENHANCED: Load from both localStorage and Supabase
        try {
            // First, get from localStorage (fallback/legacy)
            const ePodData = localStorage.getItem('ePodRecords');
            if (ePodData) {
                ePodRecords = JSON.parse(ePodData);
                console.log('📄 Loaded E-POD records from localStorage:', ePodRecords.length);
            }
            
            // Then, try to get from Supabase (primary source)
            if (window.dataService && typeof window.dataService.getEPodRecords === 'function') {
                try {
                    const supabaseRecords = await window.dataService.getEPodRecords();
                    if (supabaseRecords && supabaseRecords.length > 0) {
                        // Merge Supabase records with localStorage records (Supabase takes priority)
                        const mergedRecords = [...ePodRecords];
                        supabaseRecords.forEach(supabaseRecord => {
                            const existingIndex = mergedRecords.findIndex(localRecord => 
                                (localRecord.dr_number || localRecord.drNumber) === (supabaseRecord.dr_number || supabaseRecord.drNumber)
                            );
                            if (existingIndex >= 0) {
                                mergedRecords[existingIndex] = supabaseRecord; // Replace with Supabase version
                            } else {
                                mergedRecords.push(supabaseRecord); // Add new Supabase record
                            }
                        });
                        ePodRecords = mergedRecords;
                        console.log('📄 Merged E-POD records from Supabase and localStorage:', ePodRecords.length);
                    }
                } catch (supabaseError) {
                    console.warn('⚠️ Could not load E-POD records from Supabase, using localStorage only:', supabaseError);
                }
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
            const delivery = window.deliveryHistory.find(d => d.drNumber === drNumber);
            if (delivery) {
                // ENHANCED: Find signature with multiple field name support
                // Original logic (commented but preserved)
                // const ePodRecord = ePodRecords.find(record => record.drNumber === drNumber);
                // selectedDeliveries.push({
                //     ...delivery,
                //     signature: ePodRecord ? ePodRecord.signature : null
                // });
                
                // ENHANCED: Support both field name variations and DR number variations
                const ePodRecord = ePodRecords.find(record => {
                    const recordDrNumber = record.dr_number || record.drNumber || '';
                    return recordDrNumber === drNumber;
                });
                
                let signatureData = null;
                if (ePodRecord) {
                    // Check for signature in multiple field names
                    signatureData = ePodRecord.signature_data || ePodRecord.signature || ePodRecord.signatureData || null;
                    console.log(`📄 Found E-POD record for DR ${drNumber}, signature available:`, !!signatureData);
                }
                
                selectedDeliveries.push({
                    ...delivery,
                    signature: signatureData
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

/**
 * Reset the export button to its original state
 */
function resetExportButton(button, originalText) {
    if (button) {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Debug function to verify data flow for new fields
function debugNewFields() {
    console.log('=== DEBUG NEW FIELDS ===');
    
    // Check localStorage data
    try {
        const activeData = localStorage.getItem('mci-active-deliveries');
        if (activeData) {
            const parsed = JSON.parse(activeData);
            console.log('Active deliveries in localStorage:', parsed.length);
            if (parsed.length > 0) {
                const sample = parsed[0];
                console.log('Sample delivery fields:', {
                    itemNumber: sample.itemNumber,
                    item_number: sample.item_number,
                    mobileNumber: sample.mobileNumber,
                    mobile_number: sample.mobile_number,
                    itemDescription: sample.itemDescription,
                    item_description: sample.item_description,
                    serialNumber: sample.serialNumber,
                    serial_number: sample.serial_number
                });
            }
        }
    } catch (error) {
        console.error('Error reading localStorage:', error);
    }
    
    // Check global arrays
    console.log('Global activeDeliveries:', window.activeDeliveries ? window.activeDeliveries.length : 0);
    if (window.activeDeliveries && window.activeDeliveries.length > 0) {
        const sample = window.activeDeliveries[0];
        console.log('Sample from global array:', {
            itemNumber: sample.itemNumber,
            item_number: sample.item_number,
            mobileNumber: sample.mobileNumber,
            mobile_number: sample.mobile_number,
            itemDescription: sample.itemDescription,
            item_description: sample.item_description,
            serialNumber: sample.serialNumber,
            serial_number: sample.serial_number
        });
    }
    
    // Check field mapper
    if (window.FIELD_MAPPINGS) {
        console.log('Field mappings for new fields:', {
            item_number: window.FIELD_MAPPINGS.item_number,
            mobile_number: window.FIELD_MAPPINGS.mobile_number,
            item_description: window.FIELD_MAPPINGS.item_description,
            serial_number: window.FIELD_MAPPINGS.serial_number
        });
    }
    
    console.log('=== END DEBUG ===');
}

// Make debug function globally available
window.debugNewFields = debugNewFields;

// Debug function to check data state
function debugActiveDeliveries() {
    console.log('=== ACTIVE DELIVERIES DEBUG ===');
    console.log('Local activeDeliveries:', activeDeliveries.length);
    console.log('Window activeDeliveries:', window.activeDeliveries ? window.activeDeliveries.length : 'undefined');
    console.log('localStorage mci-active-deliveries:', localStorage.getItem('mci-active-deliveries') ? JSON.parse(localStorage.getItem('mci-active-deliveries')).length : 'null');
    console.log('Sample data:', activeDeliveries.length > 0 ? activeDeliveries[0] : 'No data');
    
    // Force refresh
    loadActiveDeliveries();
}

// Make functions globally accessible
window.loadActiveDeliveries = loadActiveDeliveries;
window.populateActiveDeliveriesTable = populateActiveDeliveriesTable;
window.loadDeliveryHistory = loadDeliveryHistory;
window.saveToLocalStorage = saveToLocalStorage;
window.toggleStatusDropdown = toggleStatusDropdown;
window.updateDeliveryStatusById = updateDeliveryStatusById;
window.updateDeliveryStatus = updateDeliveryStatus;
window.generateStatusOptions = generateStatusOptions;
window.exportActiveDeliveriesToExcel = exportActiveDeliveriesToExcel;
window.exportDeliveryHistoryToExcel = exportDeliveryHistoryToExcel;
window.exportDeliveryHistoryToPdf = exportDeliveryHistoryToPdf;
window.toggleDeliveryHistorySelection = toggleDeliveryHistorySelection;
window.showESignatureModal = showESignatureModal;
window.showEPodModal = showEPodModal;
window.handleStatusChange = handleStatusChange;
window.testModalFunctionality = testModalFunctionality;
window.debugActiveDeliveries = debugActiveDeliveries;

console.log('=== APP.JS INITIALIZATION COMPLETE ===');
})();