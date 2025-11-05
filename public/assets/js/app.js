console.log('app.js loaded');
(function() {
    // Global arrays for holding data
    window.activeDeliveries = [];
    window.deliveryHistory = [];

    let filteredDeliveries = [];
    let filteredHistory = [];
    let currentSearchTerm = '';
    let currentHistorySearchTerm = '';

    // Functions
    function getStatusInfo(status) {
        switch (status) {
            case 'SUD-Solve Undelivered':
                return { class: 'bg-warning', icon: 'bi-exclamation-triangle' };
            case 'In Transit':
                return { class: 'bg-primary', icon: 'bi-truck' };
            case 'Cancelled':
                return { class: 'bg-danger', icon: 'bi-x-circle' };
            case 'Active':
                return { class: 'bg-success', icon: 'bi-check-circle' };
            case 'On Schedule':
                return { class: 'bg-success', icon: 'bi-check-circle' };
            case 'Delayed':
                return { class: 'bg-warning', icon: 'bi-exclamation-triangle' };
            case 'Completed':
                return { class: 'bg-success', icon: 'bi-check-circle' };
            default:
                return { class: 'bg-secondary', icon: 'bi-question-circle' };
        }
    }

    function generateStatusOptions(currentStatus, deliveryId) {
        const availableStatuses = ['SUD-Solve Undelivered', 'In Transit', 'Cancelled', 'Active'];
        if (currentStatus === 'Completed' || currentStatus === 'Signed') {
            return `<div class="status-option disabled">Status cannot be changed</div>`;
        }
        return availableStatuses.map(status => {
            const isSelected = status === currentStatus ? 'selected' : '';
            const statusInfo = getStatusInfo(status);
            return `
                <div class="status-option ${isSelected}" data-delivery-id="${deliveryId}" data-status="${status}">
                    <i class="bi ${statusInfo.icon}"></i> ${status}
                </div>
            `;
        }).join('');
    }

    function toggleStatusDropdown(deliveryId) {
        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
            if (dropdown.id !== `statusDropdown-${deliveryId}`) {
                dropdown.style.display = 'none';
            }
        });
        const dropdown = document.getElementById(`statusDropdown-${deliveryId}`);
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    async function updateDeliveryStatusById(deliveryId, newStatus) {
        console.log(`Updating status for delivery ${deliveryId} to ${newStatus}`);
        const deliveryIndex = window.activeDeliveries.findIndex(d => d.id === deliveryId);

        if (deliveryIndex !== -1) {
            const delivery = window.activeDeliveries[deliveryIndex];
            const oldStatus = delivery.status;
            delivery.status = newStatus;
            delivery.lastStatusUpdate = new Date().toISOString();

            try {
                await window.dataService.saveDelivery(delivery);
                showToast(`Status updated from "${oldStatus}" to "${newStatus}"`, 'success');
                populateActiveDeliveriesTable();
                if (typeof window.updateDashboardStats === 'function') {
                    setTimeout(() => window.updateDashboardStats(), 100);
                }
            } catch (error) {
                console.error('Error updating delivery status:', error);
                showToast('Failed to update status. Please check your connection.', 'error');
                // Optionally revert the status change in the UI
                delivery.status = oldStatus;
                populateActiveDeliveriesTable();
            }

            const dropdown = document.getElementById(`statusDropdown-${deliveryId}`);
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
    }

    async function updateDeliveryStatus(drNumber, newStatus) {
        console.log(`Updating DR ${drNumber} status to: ${newStatus}`);
        const deliveryIndex = window.activeDeliveries.findIndex(d => (d.drNumber || d.dr_number) === drNumber);

        if (deliveryIndex !== -1) {
            const delivery = window.activeDeliveries[deliveryIndex];
            const oldStatus = delivery.status;
            delivery.status = newStatus;
            delivery.lastStatusUpdate = new Date().toISOString();

            if (newStatus === 'Completed') {
                delivery.completedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                window.deliveryHistory.unshift(delivery);
                window.activeDeliveries.splice(deliveryIndex, 1);
            }

            try {
                await window.dataService.saveDelivery(delivery);
                console.log(`Successfully updated DR ${drNumber} from "${oldStatus}" to "${newStatus}"`);
                loadActiveDeliveries();
                loadDeliveryHistory();
                if (typeof window.updateDashboardStats === 'function') {
                    setTimeout(() => window.updateDashboardStats(), 100);
                }
            } catch (error) {
                console.error('Error updating delivery status:', error);
                // Revert changes in UI if save fails
                if (newStatus === 'Completed') {
                    window.activeDeliveries.splice(deliveryIndex, 0, delivery);
                    window.deliveryHistory.shift();
                }
                delivery.status = oldStatus;
                loadActiveDeliveries();
                loadDeliveryHistory();
            }
        } else {
            console.warn(`Delivery with DR ${drNumber} not found in active deliveries`);
        }
    }

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.status-dropdown-container')) {
            document.querySelectorAll('.status-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });

    function showESignatureModal(drNumber) {
        console.log(`Showing E-Signature modal for DR: ${drNumber}`);
        if (typeof window.openRobustSignaturePad === 'function') {
            const delivery = window.activeDeliveries.find(d => d.drNumber === drNumber);
            if (delivery) {
                const { customerName = '', vendorNumber = '', truckPlateNumber = '', origin = '', destination = '' } = delivery;
                const deliveryRoute = (origin && destination) ? `${origin} to ${destination}` : '';
                window.openRobustSignaturePad(drNumber, customerName, vendorNumber, truckPlateNumber, deliveryRoute);
            }
        } else {
            document.getElementById('ePodDrNumber').value = drNumber;
            if (typeof window.showModal === 'function') {
                window.showModal('eSignatureModal');
            } else {
                new bootstrap.Modal(document.getElementById('eSignatureModal')).show();
            }
        }
    }

    function showEPodModal(drNumber) {
        console.log(`Showing E-POD modal for DR: ${drNumber}`);
        alert(`E-POD functionality for ${drNumber} would be implemented here`);
    }

    async function loadFromDatabase() {
        try {
            console.log('🔄 Loading data from database...');
            if (window.dataService && window.dataService.supabase) {
                console.log('📡 Using Supabase data service');
                const deliveries = await window.dataService.getDeliveries();
                console.log('📥 Retrieved deliveries from Supabase:', deliveries.length);
                const normalizedDeliveries = window.normalizeDeliveryArray ? window.normalizeDeliveryArray(deliveries) : deliveries;
                
                window.activeDeliveries = normalizedDeliveries.filter(d => d.status !== 'Completed' && d.status !== 'Signed');
                window.deliveryHistory = normalizedDeliveries.filter(d => d.status === 'Completed' || d.status === 'Signed');
                
                console.log('📦 Active deliveries loaded from Supabase:', window.activeDeliveries.length);
                console.log('📋 Delivery history loaded from Supabase:', window.deliveryHistory.length);
                if (window.activeDeliveries.length > 0) {
                    console.log('📋 Sample active delivery:', window.activeDeliveries[0]);
                }
                return true;
            } else {
                // Fallback to localStorage with enhanced error handling
                console.log('⚠️ DataService not available, using localStorage fallback');
                
                // Load from localStorage with better error handling
                try {
                    const activeDeliveriesRaw = localStorage.getItem('mci-active-deliveries');
                    const deliveryHistoryRaw = localStorage.getItem('mci-delivery-history');
                    
                    console.log('📥 Raw localStorage data - Active:', activeDeliveriesRaw);
                    console.log('📥 Raw localStorage data - History:', deliveryHistoryRaw);
                    
                    let activeDeliveries = [];
                    let deliveryHistory = [];
                    
                    if (activeDeliveriesRaw) {
                        try {
                            activeDeliveries = JSON.parse(activeDeliveriesRaw);
                            console.log('📦 Parsed active deliveries:', activeDeliveries.length);
                            if (activeDeliveries.length > 0) {
                                console.log('📋 Sample active delivery from localStorage:', activeDeliveries[0]);
                            }
                        } catch (parseError) {
                            console.error('❌ Error parsing active deliveries:', parseError);
                            activeDeliveries = [];
                        }
                    }
                    
                    if (deliveryHistoryRaw) {
                        try {
                            deliveryHistory = JSON.parse(deliveryHistoryRaw);
                            console.log('📋 Parsed delivery history:', deliveryHistory.length);
                        } catch (parseError) {
                            console.error('❌ Error parsing delivery history:', parseError);
                            deliveryHistory = [];
                        }
                    }
                    
                    // Ensure data consistency
                    window.activeDeliveries = Array.isArray(activeDeliveries) ? activeDeliveries : [];
                    window.deliveryHistory = Array.isArray(deliveryHistory) ? deliveryHistory : [];
                    
                    console.log('📦 Active deliveries loaded from localStorage:', window.activeDeliveries.length);
                    console.log('📋 Delivery history loaded from localStorage:', window.deliveryHistory.length);
                    return true;
                } catch (storageError) {
                    console.error('❌ Error accessing localStorage:', storageError);
                    window.activeDeliveries = [];
                    window.deliveryHistory = [];
                    return false;
                }
            }
        } catch (error) {
            console.error('❌ Error loading from database:', error);
            // Ensure arrays are initialized even on error
            if (!window.activeDeliveries) window.activeDeliveries = [];
            if (!window.deliveryHistory) window.deliveryHistory = [];
            return false;
        }
    }

    function showToast(message, type = 'success') {
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
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
    }

    function exportToExcel(data, fileName, sheetName) {
        if (typeof XLSX === 'undefined') {
            showToast('Excel export library not loaded. Please try again.', 'error');
            return;
        }
        if (data.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, fileName);
        showToast(`Exported ${data.length} records to ${fileName}`, 'success');
    }

    function exportActiveDeliveriesToExcel() {
        const dataToExport = currentSearchTerm ? filteredDeliveries : window.activeDeliveries;
        const exportData = dataToExport.map(d => ({ 'DR Number': d.drNumber, 'Origin': d.origin, 'Destination': d.destination, 'Status': d.status }));
        exportToExcel(exportData, `Active_Deliveries_${new Date().toISOString().split('T')[0]}.xlsx`, 'Active Deliveries');
    }

    function exportDeliveryHistoryToExcel() {
        const dataToExport = currentHistorySearchTerm ? filteredHistory : window.deliveryHistory;
        const exportData = dataToExport.map(d => ({ 'Date': d.completedDate, 'DR Number': d.drNumber, 'Customer Name': d.customerName, 'Status': d.status }));
        exportToExcel(exportData, `Delivery_History_${new Date().toISOString().split('T')[0]}.xlsx`, 'Delivery History');
    }

    async function loadActiveDeliveries() {
        console.log('=== LOAD ACTIVE DELIVERIES FUNCTION CALLED ===');
        await loadFromDatabase();
        populateActiveDeliveriesTable();
    }

    function populateActiveDeliveriesTable() {
        console.log('🔄 Populating active deliveries table...');
        console.log('📦 Current activeDeliveries count:', window.activeDeliveries?.length || 0);
        if (window.activeDeliveries && window.activeDeliveries.length > 0) {
            console.log('📋 Sample active delivery for display:', window.activeDeliveries[0]);
        }
        
        const tableBody = document.getElementById('activeDeliveriesTableBody');
        if (!tableBody) {
            console.error('❌ Active deliveries table body not found');
            return;
        }

        // Ensure activeDeliveries is an array
        const deliveriesToDisplay = Array.isArray(window.activeDeliveries) ? window.activeDeliveries : [];
        
        filteredDeliveries = currentSearchTerm
            ? deliveriesToDisplay.filter(d => (d.drNumber || d.dr_number || '').toLowerCase().includes(currentSearchTerm.toLowerCase()))
            : [...deliveriesToDisplay];

        console.log('🔍 Filtered deliveries count:', filteredDeliveries.length);
        
        if (filteredDeliveries.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="14" class="text-center py-5"><h4>No active deliveries found</h4><p class="text-muted">Try uploading an Excel file or creating a new booking</p></td></tr>`;
            return;
        }

        // Enhanced table population with better field mapping
        tableBody.innerHTML = filteredDeliveries.map(delivery => {
            const statusInfo = getStatusInfo(delivery.status);
            // Handle different field naming conventions
            const drNumber = delivery.drNumber || delivery.dr_number || 'N/A';
            const customerName = delivery.customerName || delivery.customer_name || 'N/A';
            const vendorNumber = delivery.vendorNumber || delivery.vendor_number || 'N/A';
            const origin = delivery.origin || 'N/A';
            const destination = delivery.destination || 'N/A';
            const truckType = delivery.truckType || delivery.truck_type || '';
            const truckPlate = delivery.truckPlateNumber || delivery.truck_plate_number || '';
            const truckDisplay = truckType && truckPlate ? `${truckType} (${truckPlate})` : (truckType || truckPlate || 'N/A');
            const createdDate = delivery.created_date || delivery.deliveryDate || delivery.bookedDate || 'N/A';
            const deliveryDate = delivery.deliveryDate || delivery.delivery_date || delivery.created_date || 'N/A';
            const itemNumber = delivery.itemNumber || delivery.item_number || '';
            const mobileNumber = delivery.mobileNumber || delivery.mobile_number || '';
            const itemDescription = delivery.itemDescription || delivery.item_description || '';
            const serialNumber = delivery.serialNumber || delivery.serial_number || '';
            
            return `
                <tr data-delivery-id="${delivery.id || 'no-id'}">
                    <td><input type="checkbox" class="form-check-input delivery-checkbox" data-delivery-id="${delivery.id || 'no-id'}"></td>
                    <td><strong>${drNumber}</strong></td>
                    <td>${customerName}</td>
                    <td>${vendorNumber}</td>
                    <td>${origin}</td>
                    <td>${destination}</td>
                    <td>${truckDisplay}</td>
                    <td>
                        <div class="status-dropdown-container">
                            <span class="badge ${statusInfo.class} status-clickable" data-delivery-id="${delivery.id || 'no-id'}">
                                <i class="bi ${statusInfo.icon}"></i> ${delivery.status}
                                <i class="bi bi-chevron-down ms-1" style="font-size: 0.8em;"></i>
                            </span>
                            <div class="status-dropdown" id="statusDropdown-${delivery.id || 'no-id'}" style="display: none;">
                                ${generateStatusOptions(delivery.status, delivery.id || 'no-id')}
                            </div>
                        </div>
                    </td>
                    <td>${createdDate}</td>
                    <td>${deliveryDate}</td>
                    <td>${itemNumber}</td>
                    <td>${mobileNumber}</td>
                    <td>${itemDescription}</td>
                    <td>${serialNumber}</td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ Active deliveries table populated with', filteredDeliveries.length, 'items');
    }

    async function loadDeliveryHistory() {
        console.log('=== LOAD DELIVERY HISTORY FUNCTION CALLED ===');
        await loadFromDatabase();
        populateDeliveryHistoryTable();
    }

    async function populateDeliveryHistoryTable() {
        const tableBody = document.getElementById('deliveryHistoryTableBody');
        if (!tableBody) return;

        let ePodRecords = [];
        try {
            if (window.dataService) {
                ePodRecords = await window.dataService.getEPodRecords();
            }
        } catch (error) {
            console.error('Error loading EPOD records:', error);
        }

        filteredHistory = currentHistorySearchTerm
            ? window.deliveryHistory.filter(d => (d.drNumber || d.dr_number || '').toLowerCase().includes(currentHistorySearchTerm.toLowerCase()))
            : [...window.deliveryHistory];

        if (filteredHistory.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="14" class="text-center py-5"><h4>No delivery history found</h4></td></tr>`;
            return;
        }

        tableBody.innerHTML = filteredHistory.map(delivery => {
            const statusInfo = getStatusInfo(delivery.status);
            const deliveryDrNumber = delivery.drNumber || delivery.dr_number || '';
            const isSigned = ePodRecords.some(record => (record.dr_number || record.drNumber || '') === deliveryDrNumber);
            let statusDisplay = `<span class="badge ${statusInfo.class}"><i class="bi ${statusInfo.icon}"></i> ${delivery.status}</span>`;
            if (isSigned) {
                statusDisplay += `<span class="badge bg-warning text-dark ms-1"><i class="bi bi-pen"></i> Signed</span>`;
            }

            return `
                <tr>
                    <td><input type="checkbox" class="form-check-input delivery-history-checkbox" style="display: none;" data-dr-number="${deliveryDrNumber}"></td>
                    <td>${delivery.completedDateTime || delivery.completedDate || 'N/A'}</td>
                    <td><strong>${deliveryDrNumber}</strong></td>
                    <td>${delivery.customerName || delivery.customer_name || 'N/A'}</td>
                    <td>${delivery.vendorNumber || delivery.vendor_number || 'N/A'}</td>
                    <td>${delivery.origin || 'N/A'}</td>
                    <td>${delivery.destination || 'N/A'}</td>
                    <td>${delivery.additionalCosts ? `₱${delivery.additionalCosts.toFixed(2)}` : '₱0.00'}</td>
                    <td>${statusDisplay}</td>
                    <td>${delivery.itemNumber || delivery.item_number || ''}</td>
                    <td>${delivery.mobileNumber || delivery.mobile_number || ''}</td>
                    <td>${delivery.itemDescription || delivery.item_description || ''}</td>
                    <td>${delivery.serialNumber || delivery.serial_number || ''}</td>
                    <td><button class="btn btn-sm btn-outline-info view-epod" data-dr-number="${deliveryDrNumber}"><i class="bi bi-eye"></i> View</button></td>
                </tr>
            `;
        }).join('');
    }

    async function initApp() {
        console.log('=== INIT APP FUNCTION CALLED ===');
        await loadFromDatabase();
        loadActiveDeliveries();
        loadDeliveryHistory();
        if (typeof window.updateBookingViewDashboard === 'function') {
            setTimeout(() => window.updateBookingViewDashboard(), 100);
        }
        console.log('App initialized successfully');
    }

    // Make functions globally available
    window.loadActiveDeliveries = loadActiveDeliveries;
    window.populateActiveDeliveriesTable = populateActiveDeliveriesTable;
    window.loadDeliveryHistory = loadDeliveryHistory;
    window.toggleStatusDropdown = toggleStatusDropdown;
    window.updateDeliveryStatusById = updateDeliveryStatusById;
    window.updateDeliveryStatus = updateDeliveryStatus;
    window.generateStatusOptions = generateStatusOptions;
    window.exportActiveDeliveriesToExcel = exportActiveDeliveriesToExcel;
    window.exportDeliveryHistoryToExcel = exportDeliveryHistoryToExcel;
    window.showESignatureModal = showESignatureModal;
    window.showEPodModal = showEPodModal;

    document.addEventListener('DOMContentLoaded', function() {
        console.log('App.js: DOMContentLoaded event fired');
        initApp();
        
        // Event listeners for search, export, etc.
        const drSearchInput = document.getElementById('drSearchInput');
        if (drSearchInput) {
            drSearchInput.addEventListener('input', () => {
                currentSearchTerm = drSearchInput.value;
                populateActiveDeliveriesTable();
            });
        }

        const drSearchHistoryInput = document.getElementById('drSearchHistoryInput');
        if (drSearchHistoryInput) {
            drSearchHistoryInput.addEventListener('input', () => {
                currentHistorySearchTerm = drSearchHistoryInput.value;
                populateDeliveryHistoryTable();
            });
        }

        const exportActiveBtn = document.getElementById('exportActiveDeliveriesBtn');
        if (exportActiveBtn) {
            exportActiveBtn.addEventListener('click', exportActiveDeliveriesToExcel);
        }

        const exportHistoryBtn = document.getElementById('exportDeliveryHistoryBtn');
        if (exportHistoryBtn) {
            exportHistoryBtn.addEventListener('click', exportDeliveryHistoryToExcel);
        }

        document.addEventListener('click', function(event) {
            const statusOption = event.target.closest('.status-option');
            if (statusOption && !statusOption.classList.contains('disabled')) {
                const deliveryId = statusOption.dataset.deliveryId;
                const status = statusOption.dataset.status;
                updateDeliveryStatusById(deliveryId, status);
            }

            const statusClickable = event.target.closest('.status-clickable');
            if (statusClickable) {
                const deliveryId = statusClickable.dataset.deliveryId;
                toggleStatusDropdown(deliveryId);
            }

            const viewEpod = event.target.closest('.view-epod');
            if (viewEpod) {
                const drNumber = viewEpod.dataset.drNumber;
                showEPodModal(drNumber);
            }
        });
    });

    console.log('=== APP.JS INITIALIZATION COMPLETE ===');
})();
