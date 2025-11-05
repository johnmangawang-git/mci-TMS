/**
 * DISABLED: Upload DR File Workflow
 * This file is completely disabled - all functionality moved to booking.js
 */

// IMMEDIATE EXIT - Prevent any execution of this file
(function() {
    console.log('🚫 upload-dr-fix.js is COMPLETELY DISABLED');
    return;
})();

// Everything below this point will not execute

function initCompleteUploadWorkflow() {
    console.log('🔧 Initializing complete Upload DR File workflow...');
    
    // Fix the main Upload DR File button
    fixMainUploadButton();
    
    // Fix the Select Excel File button inside modal
    fixSelectFileButton();
    
    // Fix the file input handler
    fixFileInputHandler();
    
    // Fix other modal buttons
    fixModalButtons();
}

function fixMainUploadButton() {
    const uploadBtn = document.getElementById('uploadDrFileBtn');
    
    if (uploadBtn) {
        console.log('✅ Found main Upload DR File button');
        
        uploadBtn.onclick = function(e) {
            console.log('🚀 Main Upload DR File button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const modalElement = document.getElementById('drUploadModal');
                if (modalElement) {
                    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                        console.log('✅ Modal opened successfully');
                        
                        // Initialize modal content after it's shown
                        setTimeout(fixModalButtons, 500);
                    } else {
                        modalElement.style.display = 'block';
                        modalElement.classList.add('show');
                        document.body.classList.add('modal-open');
                        console.log('✅ Manual modal opened');
                        setTimeout(fixModalButtons, 500);
                    }
                } else {
                    console.error('❌ Modal element not found');
                    alert('Upload dialog not available. Please refresh the page.');
                }
            } catch (error) {
                console.error('❌ Error opening modal:', error);
                alert('Error opening upload dialog: ' + error.message);
            }
        };
        
        console.log('✅ Main upload button fixed');
    } else {
        console.error('❌ Main Upload DR File button not found!');
    }
}

function fixSelectFileButton() {
    // DISABLED: This function is now handled by booking.js to avoid duplicate event listeners
    console.log('⚠️ fixSelectFileButton disabled - handled by booking.js');
    return;
    
    const selectBtn = document.getElementById('selectDrFileBtn');
    const fileInput = document.getElementById('drFileInput');
    
    if (selectBtn) {
        console.log('✅ Found Select Excel File button');
        
        selectBtn.onclick = function(e) {
            console.log('🚀 Select Excel File button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            if (fileInput) {
                fileInput.click();
                console.log('✅ File input triggered');
            } else {
                console.error('❌ File input not found');
                // Create a temporary file input
                const tempInput = document.createElement('input');
                tempInput.type = 'file';
                tempInput.accept = '.xlsx,.xls';
                tempInput.onchange = function(e) {
                    if (e.target.files.length > 0) {
                        processSelectedFile(e.target.files[0]);
                    }
                };
                tempInput.click();
            }
        };
        
        console.log('✅ Select file button fixed');
    } else {
        console.warn('⚠️ Select Excel File button not found yet');
    }
}

function fixFileInputHandler() {
    const fileInput = document.getElementById('drFileInput');
    
    if (fileInput) {
        console.log('✅ Found file input');
        
        fileInput.onchange = function(e) {
            console.log('🚀 File selected!');
            
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                console.log('Selected file:', file.name, file.type, file.size);
                processSelectedFile(file);
            }
        };
        
        console.log('✅ File input handler fixed');
    } else {
        console.warn('⚠️ File input not found yet');
    }
}

function processSelectedFile(file) {
    console.log('🔄 Processing selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Show processing indicator
    const selectBtn = document.getElementById('selectDrFileBtn');
    if (selectBtn) {
        selectBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';
        selectBtn.disabled = true;
    }
    
    try {
        // Enhanced XLSX library check
        console.log('🔍 Checking XLSX library availability...');
        console.log('XLSX available:', typeof XLSX !== 'undefined');
        console.log('XLSX object:', XLSX);
        
        if (typeof XLSX === 'undefined') {
            console.error('❌ XLSX library not loaded');
            
            // Try to load XLSX library dynamically
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
            script.onload = function() {
                console.log('✅ XLSX library loaded dynamically');
                processSelectedFile(file); // Retry
            };
            script.onerror = function() {
                alert('Excel processing library failed to load. Please refresh the page and try again.');
                resetSelectButton();
            };
            document.head.appendChild(script);
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                console.log('📖 Reading Excel file... Buffer size:', e.target.result.byteLength);
                
                // Try multiple reading methods
                let workbook;
                let jsonData;
                
                try {
                    // Method 1: ArrayBuffer
                    const data = new Uint8Array(e.target.result);
                    workbook = XLSX.read(data, { type: 'array' });
                    console.log('✅ Method 1 (ArrayBuffer) successful');
                } catch (error1) {
                    console.warn('⚠️ Method 1 failed:', error1.message);
                    
                    try {
                        // Method 2: Binary string
                        workbook = XLSX.read(e.target.result, { type: 'binary' });
                        console.log('✅ Method 2 (Binary) successful');
                    } catch (error2) {
                        console.warn('⚠️ Method 2 failed:', error2.message);
                        
                        try {
                            // Method 3: Base64
                            const base64 = btoa(String.fromCharCode(...new Uint8Array(e.target.result)));
                            workbook = XLSX.read(base64, { type: 'base64' });
                            console.log('✅ Method 3 (Base64) successful');
                        } catch (error3) {
                            throw new Error('All reading methods failed: ' + error3.message);
                        }
                    }
                }
                
                console.log('📊 Workbook info:', {
                    sheetNames: workbook.SheetNames,
                    sheetCount: workbook.SheetNames.length
                });
                
                if (workbook.SheetNames.length === 0) {
                    throw new Error('No sheets found in the Excel file');
                }
                
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                console.log('📋 Processing sheet:', firstSheetName);
                console.log('📋 Worksheet range:', worksheet['!ref']);
                
                // Try different JSON conversion options
                try {
                    jsonData = XLSX.utils.sheet_to_json(worksheet);
                    console.log('✅ Standard JSON conversion successful');
                } catch (jsonError) {
                    console.warn('⚠️ Standard conversion failed, trying with headers:', jsonError.message);
                    jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // Convert array format to object format
                    if (jsonData.length > 1) {
                        const headers = jsonData[0];
                        const rows = jsonData.slice(1);
                        jsonData = rows.map(row => {
                            const obj = {};
                            headers.forEach((header, index) => {
                                obj[header] = row[index];
                            });
                            return obj;
                        });
                    }
                    console.log('✅ Header-based conversion successful');
                }
                
                console.log('📊 Processed data:', {
                    rows: jsonData.length,
                    firstRow: jsonData[0],
                    columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : []
                });
                
                if (jsonData.length === 0) {
                    alert('No data found in the Excel file. Please check that the file contains data and try again.');
                    resetSelectButton();
                    return;
                }
                
                // Show success and process data
                console.log('✅ Excel file processed successfully:', jsonData.length, 'rows');
                showDataPreview(jsonData);
                
            } catch (error) {
                console.error('❌ Error processing Excel file:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    fileSize: file.size,
                    fileType: file.type
                });
                alert('Error processing Excel file: ' + error.message + '\n\nPlease check that the file is a valid Excel file (.xlsx or .xls) and try again.');
                resetSelectButton();
            }
        };
        
        reader.onerror = function(error) {
            console.error('❌ Error reading file:', error);
            alert('Error reading file. Please try again.');
            resetSelectButton();
        };
        
        // Read as ArrayBuffer for better compatibility
        console.log('📖 Starting file read...');
        reader.readAsArrayBuffer(file);
        
    } catch (error) {
        console.error('❌ Error in processSelectedFile:', error);
        alert('Error processing file: ' + error.message);
        resetSelectButton();
    }
}

function resetSelectButton() {
    const selectBtn = document.getElementById('selectDrFileBtn');
    if (selectBtn) {
        selectBtn.innerHTML = '<i class="bi bi-file-earmark-plus"></i> Select Excel File';
        selectBtn.disabled = false;
    }
}

function showDataPreview(data) {
    console.log('👁️ Showing data preview for', data.length, 'records...');
    console.log('📊 Sample data:', data[0]);
    console.log('📊 Available columns:', data.length > 0 ? Object.keys(data[0]) : []);
    
    // EMERGENCY DEBUG: Show raw data in alert
    if (data.length === 0) {
        alert('DEBUG: No data found in Excel file. The file might be empty or in an unsupported format.');
        return;
    }
    
    // Show first row data for debugging
    const firstRow = data[0];
    const debugInfo = `
DEBUG INFO:
- Total rows: ${data.length}
- First row keys: ${Object.keys(firstRow).join(', ')}
- First row values: ${Object.values(firstRow).join(', ')}
- Sample data: ${JSON.stringify(firstRow, null, 2)}
    `;
    console.log(debugInfo);
    
    // DEBUG DISABLED: This functionality is now handled by booking.js
    console.log('📊 DEBUG: Data was read successfully');
    console.log('📊 DEBUG INFO:', debugInfo);
    
    // Hide upload content and show preview
    const uploadContent = document.getElementById('drUploadContent');
    const previewContent = document.getElementById('drPreviewContent');
    
    if (uploadContent) {
        uploadContent.style.display = 'none';
        console.log('✅ Upload content hidden');
    }
    if (previewContent) {
        previewContent.style.display = 'block';
        console.log('✅ Preview content shown');
    }
    
    // Populate preview table
    const previewTable = document.getElementById('drPreviewTable');
    console.log('🔍 Preview table element:', previewTable);
    
    if (previewTable) {
        console.log('📋 Populating preview table...');
        previewTable.innerHTML = '';
        
        // Add a test row first
        const testRow = document.createElement('tr');
        testRow.innerHTML = '<td colspan="5" style="background: yellow; color: black;">TEST: If you see this, the table is working</td>';
        previewTable.appendChild(testRow);
        console.log('✅ Test row added');
        
        // Show first 5 rows as preview
        const previewData = data.slice(0, 5);
        
        // Use enhanced column mapping if available
        const getColumnValue = window.getEnhancedColumnValue || function(row, possibleNames, fallbackIndex = null) {
            // Fallback to simple mapping
            for (const name of possibleNames) {
                if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                    return String(row[name]).trim();
                }
            }
            if (fallbackIndex !== null && row[fallbackIndex] !== undefined && row[fallbackIndex] !== null) {
                return String(row[fallbackIndex]).trim();
            }
            return 'N/A';
        };
        
        previewData.forEach((row, index) => {
            console.log(`📋 Processing preview row ${index}:`, row);
            
            const tr = document.createElement('tr');
            
            const drNumber = getColumnValue(row, [
                'DR Number', 'dr_number', 'DR_Number', 'drNumber', 'DR', 'dr',
                'Delivery Receipt', 'Receipt Number', 'Document Number'
            ]);
            
            const customer = getColumnValue(row, [
                'Customer', 'customer_name', 'Customer Name', 'Client', 'client_name',
                'Company', 'Customer Company', 'Consignee'
            ]);
            
            const vendorNumber = getColumnValue(row, [
                'Vendor', 'vendor_number', 'Vendor Number'
            ]) || '';
            
            const origin = getColumnValue(row, [
                'Origin', 'origin', 'From', 'Source', 'Pickup', 'Start',
                'Origin Address', 'Pickup Location'
            ]);
            
            const destination = getColumnValue(row, [
                'Destination', 'destination', 'To', 'Delivery', 'End', 'Drop',
                'Destination Address', 'Delivery Location', 'Drop Location'
            ]);
            
            // Extract new columns with enhanced mapping and fallback to column indices
            const itemNumber = getColumnValue(row, [
                'Item Number', 'Item number', 'item_number', 'Item #', 'Item#'
            ], 9) || '';
            
            const mobileNumber = getColumnValue(row, [
                'Mobile#', 'Mobile Number', 'Mobile', 'mobile_number'
            ], 10) || '';
            
            const itemDescription = getColumnValue(row, [
                'Item Description', 'Item description', 'item_description', 'Description'
            ], 11) || '';
            
            const serialNumber = getColumnValue(row, [
                'Serial Number', 'Serial number', 'serial_number', 'Serial'
            ], 14) || '';
            
            tr.innerHTML = `
                <td>${drNumber}</td>
                <td>${customer}</td>
                <td>${vendorNumber}</td>
                <td>${origin}</td>
                <td>${destination}</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>Active</td>
                <td>${itemNumber}</td>
                <td>${mobileNumber}</td>
                <td>${itemDescription}</td>
                <td>${serialNumber}</td>
            `;
            previewTable.appendChild(tr);
            
            console.log(`✅ Added preview row: DR=${drNumber}, Customer=${customer}`);
        });
        
        console.log('✅ Preview table populated with', previewData.length, 'rows');
        
        // Show data summary
        const totalRows = data.length;
        const validRows = data.filter(row => {
            const hasData = Object.values(row).some(value => 
                value !== undefined && value !== null && value !== ''
            );
            return hasData;
        }).length;
        
        console.log(`📊 Data summary: ${totalRows} total rows, ${validRows} valid rows`);
        
        // Add summary info to the preview
        const summaryElement = document.createElement('div');
        summaryElement.className = 'alert alert-info mt-3';
        summaryElement.innerHTML = `
            <strong>Data Summary:</strong><br>
            • Total rows: ${totalRows}<br>
            • Valid rows: ${validRows}<br>
            • Available columns: ${Object.keys(data[0] || {}).join(', ')}
        `;
        
        const previewContainer = previewTable.parentElement;
        if (previewContainer) {
            // Remove existing summary
            const existingSummary = previewContainer.querySelector('.alert-info');
            if (existingSummary) existingSummary.remove();
            
            previewContainer.appendChild(summaryElement);
        }
        
    } else {
        console.error('❌ Preview table element not found');
    }
    
    // Store data for confirmation
    window.pendingDRData = data;
    console.log('💾 Data stored for confirmation:', data.length, 'records');
    
    // Fix confirm button
    fixConfirmButton();
    
    // Reset the select button
    resetSelectButton();
}

function fixConfirmButton() {
    const confirmBtn = document.getElementById('confirmDrUploadBtn');
    
    if (confirmBtn) {
        console.log('✅ Found confirm upload button');
        
        confirmBtn.onclick = function(e) {
            console.log('🚀 Confirm upload button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            if (window.pendingDRData) {
                processUploadData(window.pendingDRData);
            } else {
                alert('No data to upload. Please select a file first.');
            }
        };
        
        console.log('✅ Confirm button fixed');
    }
}

function processUploadData(data) {
    console.log('⚡ Processing upload data:', data.length, 'records');
    
    try {
        // Convert data to delivery format with consistent field naming
        const deliveries = data.map((row, index) => {
            // Use enhanced column mapping if available
            const getColValue = window.getEnhancedColumnValue || function(row, names, fallbackIndex = null) {
                // Fallback to simple mapping
                for (const name of names) {
                    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                        return String(row[name]).trim();
                    }
                }
                if (fallbackIndex !== null && row[fallbackIndex] !== undefined && row[fallbackIndex] !== null) {
                    return String(row[fallbackIndex]).trim();
                }
                return '';
            };
            
            // Extract values with enhanced mapping
            const drNumber = getColValue(row, [
                'DR Number', 'dr_number', 'DR_Number', 'drNumber', 'DR', 'dr',
                'Delivery Receipt', 'Receipt Number', 'Document Number'
            ]) || 'DR-' + Date.now() + '-' + index;
            
            const customerName = getColValue(row, [
                'Customer', 'customer_name', 'Customer Name', 'Client', 'client_name',
                'Company', 'Customer Company', 'Consignee'
            ]) || 'Unknown Customer';
            
            const vendorNumber = getColValue(row, [
                'Vendor', 'vendor_number', 'Vendor Number'
            ]) || '';
            
            const origin = getColValue(row, [
                'Origin', 'origin', 'From', 'Source', 'Pickup', 'Start',
                'Origin Address', 'Pickup Location'
            ]) || '';
            
            const destination = getColValue(row, [
                'Destination', 'destination', 'To', 'Delivery', 'End', 'Drop',
                'Destination Address', 'Delivery Location', 'Drop Location'
            ]) || '';
            
            const truckType = getColValue(row, [
                'Truck Type', 'truck_type'
            ]) || '';
            
            const truckPlate = getColValue(row, [
                'Truck Plate', 'truck_plate', 'Truck Plate Number'
            ]) || '';
            
            // Extract new columns with enhanced mapping and fallback to column indices
            const itemNumber = getColValue(row, [
                'Item Number', 'Item number', 'item_number', 'Item #', 'Item#',
                'ItemNumber', 'Item_Number'
            ], 9) || '';
            
            const mobileNumber = getColValue(row, [
                'Mobile#', 'Mobile Number', 'Mobile', 'mobile_number', 'MobileNumber'
            ], 10) || '';
            
            const itemDescription = getColValue(row, [
                'Item Description', 'Item description', 'item_description', 'Description',
                'ItemDescription'
            ], 11) || '';
            
            const serialNumber = getColValue(row, [
                'Serial Number', 'Serial number', 'serial_number', 'Serial',
                'SerialNumber', 'SN', 'S/N'
            ], 14) || '';
            
            // Use consistent date format
            const currentDate = new Date().toISOString().split('T')[0];
            
            return {
                id: 'DEL-' + Date.now() + '-' + index,
                drNumber: drNumber,
                customerName: customerName,
                vendorNumber: vendorNumber,
                origin: origin,
                destination: destination,
                truckType: truckType,
                truckPlateNumber: truckPlate,
                itemNumber: itemNumber,
                mobileNumber: mobileNumber,
                itemDescription: itemDescription,
                serialNumber: serialNumber,
                status: 'Active',
                created_date: currentDate,
                deliveryDate: currentDate,
                bookedDate: currentDate,
                createdBy: 'Excel Upload',
                created_by: 'Excel Upload',
                created_at: new Date().toISOString()
            };
        });
        
        console.log('✅ Data converted to delivery format with new columns');
        console.log('📊 Sample delivery:', deliveries[0]);
        
        // Save to Supabase or localStorage
        saveDeliveries(deliveries);
        
    } catch (error) {
        console.error('❌ Error processing upload data:', error);
        if (typeof showToast === 'function') {
            showToast('Error processing data: ' + error.message, 'danger');
        } else {
            alert('Error processing data: ' + error.message);
        }
    }
}

async function saveDeliveries(deliveries) {
    console.log('💾 Saving deliveries:', deliveries.length);
    console.log('📋 Sample delivery data:', deliveries[0]);
    
    // Add performance timing
    const startTime = performance.now();
    
    try {
        let savedCount = 0;
        let saveErrors = [];
        
        // Process deliveries in batches to prevent UI blocking
        const batchSize = 5;
        for (let i = 0; i < deliveries.length; i += batchSize) {
            const batch = deliveries.slice(i, i + batchSize);
            console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(deliveries.length/batchSize)} (${batch.length} items)`);
            
            // Process batch items
            for (const delivery of batch) {
                try {
                    console.log('🔄 Saving delivery:', delivery.drNumber);
                    if (window.dataService && window.dataService.supabase) {
                        // Save to Supabase with proper field mapping
                        const supabaseDelivery = {
                            dr_number: delivery.drNumber,
                            customer_name: delivery.customerName,
                            vendor_number: delivery.vendorNumber || '',
                            origin: delivery.origin,
                            destination: delivery.destination,
                            truck_type: delivery.truckType || '',
                            truck_plate_number: delivery.truckPlateNumber || '',
                            status: delivery.status,
                            distance: '',
                            additional_costs: 0.00,
                            created_date: delivery.created_date,
                            created_by: delivery.createdBy || 'Excel Upload',
                            created_at: delivery.created_at,
                            updated_at: delivery.created_at,
                            // NEW: Add the new fields
                            item_number: delivery.itemNumber || '',
                            mobile_number: delivery.mobileNumber || '',
                            item_description: delivery.itemDescription || '',
                            serial_number: delivery.serialNumber || ''
                        };
                        
                        await window.dataService.saveDelivery(supabaseDelivery);
                        console.log('✅ Saved to Supabase:', delivery.drNumber);
                    } else {
                        // Fallback to localStorage with consistent field naming
                        window.activeDeliveries = window.activeDeliveries || [];
                        
                        // Ensure consistent field naming for display
                        const localStorageDelivery = {
                            id: delivery.id,
                            drNumber: delivery.drNumber,
                            dr_number: delivery.drNumber, // For compatibility
                            customerName: delivery.customerName,
                            customer_name: delivery.customerName, // For compatibility
                            vendorNumber: delivery.vendorNumber || '',
                            vendor_number: delivery.vendorNumber || '', // For compatibility
                            origin: delivery.origin,
                            destination: delivery.destination,
                            truckType: delivery.truckType || '',
                            truck_type: delivery.truckType || '', // For compatibility
                            truckPlateNumber: delivery.truckPlateNumber || '',
                            truck_plate_number: delivery.truckPlateNumber || '', // For compatibility
                            status: delivery.status,
                            created_date: delivery.created_date,
                            deliveryDate: delivery.created_date, // For compatibility
                            bookedDate: delivery.created_date, // For compatibility
                            itemNumber: delivery.itemNumber || '',
                            item_number: delivery.itemNumber || '', // For compatibility
                            mobileNumber: delivery.mobileNumber || '',
                            mobile_number: delivery.mobileNumber || '', // For compatibility
                            itemDescription: delivery.itemDescription || '',
                            item_description: delivery.itemDescription || '', // For compatibility
                            serialNumber: delivery.serialNumber || '',
                            serial_number: delivery.serialNumber || '', // For compatibility
                            createdBy: delivery.createdBy || 'Excel Upload',
                            created_by: delivery.createdBy || 'Excel Upload', // For compatibility
                            created_at: delivery.created_at,
                            additionalCosts: 0.00,
                            additional_costs: 0.00 // For compatibility
                        };
                        
                        window.activeDeliveries.push(localStorageDelivery);
                        localStorage.setItem('mci-active-deliveries', JSON.stringify(window.activeDeliveries));
                        console.log('✅ Saved to localStorage:', delivery.drNumber);
                    }
                    savedCount++;
                } catch (error) {
                    console.error('❌ Error saving delivery:', delivery.drNumber, error);
                    saveErrors.push({
                        drNumber: delivery.drNumber,
                        error: error.message
                    });
                }
            }
            
            // Small delay to prevent UI blocking
            if (i + batchSize < deliveries.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`🎉 Upload complete: ${savedCount}/${deliveries.length} deliveries saved in ${duration} seconds`);
        
        if (saveErrors.length > 0) {
            console.error('❌ Save errors:', saveErrors);
        }
        
        // Close modal and show success
        const modal = document.getElementById('drUploadModal');
        if (modal) {
            if (typeof bootstrap !== 'undefined') {
                bootstrap.Modal.getInstance(modal)?.hide();
            } else {
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
            }
        }
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast(`Successfully uploaded ${savedCount} deliveries in ${duration} seconds!`, 'success');
        } else {
            alert(`Successfully uploaded ${savedCount} deliveries in ${duration} seconds!`);
        }
        
        // Refresh the active deliveries display
        console.log('🔄 Refreshing active deliveries display...');
        if (typeof window.loadActiveDeliveries === 'function') {
            // Add a small delay to ensure data is saved before refresh
            setTimeout(() => {
                window.loadActiveDeliveries();
            }, 500);
        } else {
            console.log('⚠️ loadActiveDeliveries function not available');
            // Manual refresh of display
            if (typeof window.populateActiveDeliveriesTable === 'function') {
                setTimeout(() => {
                    window.populateActiveDeliveriesTable();
                }, 500);
            }
        }
        
    } catch (error) {
        console.error('❌ Error saving deliveries:', error);
        if (typeof showToast === 'function') {
            showToast('Error saving deliveries: ' + error.message, 'danger');
        } else {
            alert('Error saving deliveries: ' + error.message);
        }
    }
}

function fixModalButtons() {
    console.log('🔧 Fixing all modal buttons...');
    
    // Fix all buttons with a delay to ensure modal is fully loaded
    setTimeout(() => {
        fixSelectFileButton();
        fixFileInputHandler();
        
        // Fix back button
        const backBtn = document.getElementById('backToDrUploadBtn');
        if (backBtn) {
            backBtn.onclick = function() {
                const uploadContent = document.getElementById('drUploadContent');
                const previewContent = document.getElementById('drPreviewContent');
                if (uploadContent) uploadContent.style.display = 'block';
                if (previewContent) previewContent.style.display = 'none';
            };
        }
        
        console.log('✅ All modal buttons fixed');
    }, 100);
}

// DISABLED: Initialize with retries - Now handled by booking.js
// setTimeout(initCompleteUploadWorkflow, 1000);
// setTimeout(initCompleteUploadWorkflow, 3000);
// setTimeout(initCompleteUploadWorkflow, 5000);
console.log('⚠️ upload-dr-fix.js initialization disabled - using booking.js instead');
// EMERGENCY TEST FUNCTION - Call this from console to test preview
window.testPreview = function() {
    console.log('🧪 Testing preview with sample data...');
    
    const sampleData = [
        {
            'DR Number': 'DR-001',
            'Customer': 'Test Customer 1',
            'Origin': 'Manila',
            'Destination': 'Cebu'
        },
        {
            'DR Number': 'DR-002', 
            'Customer': 'Test Customer 2',
            'Origin': 'Quezon City',
            'Destination': 'Davao'
        }
    ];
    
    showDataPreview(sampleData);
};

// Auto-run test after 3 seconds
setTimeout(() => {
    console.log('🧪 Auto-test available. Type "testPreview()" in console to test preview functionality.');
}, 3000);