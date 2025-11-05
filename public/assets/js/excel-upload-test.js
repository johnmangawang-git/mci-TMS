// EXCEL UPLOAD TEST - Diagnostic tool to verify Excel upload functionality
console.log('🧪 EXCEL UPLOAD TEST LOADING...');

(function() {
    'use strict';
    
    // Test function to verify Excel upload process
    window.testExcelUpload = async function() {
        console.log('🧪 Starting Excel Upload Test...');
        
        // Test data
        const testData = [
            {
                'DR Number': 'TEST-DR-001',
                'Customer': 'Test Customer 1',
                'Vendor Number': 'VEND-001',
                'Origin': 'Manila',
                'Destination': 'Cebu',
                'Truck Type': '10-Wheeler',
                'Truck Plate': 'ABC-123',
                'Item Number': 'ITEM-001',
                'Mobile#': '09123456789',
                'Item Description': 'Test Item 1',
                'Serial Number': 'SN-001'
            },
            {
                'DR Number': 'TEST-DR-002',
                'Customer': 'Test Customer 2',
                'Vendor Number': 'VEND-002',
                'Origin': 'Quezon City',
                'Destination': 'Davao',
                'Truck Type': '6-Wheeler',
                'Truck Plate': 'XYZ-789',
                'Item Number': 'ITEM-002',
                'Mobile#': '09987654321',
                'Item Description': 'Test Item 2',
                'Serial Number': 'SN-002'
            }
        ];
        
        try {
            console.log('📋 Test data prepared:', testData);
            
            // Test 1: Check if required functions are available
            console.log('🔍 Test 1: Checking required functions...');
            const functionsToCheck = [
                'processUploadData',
                'saveDeliveries',
                'loadActiveDeliveries',
                'populateActiveDeliveriesTable'
            ];
            
            functionsToCheck.forEach(funcName => {
                const isAvailable = typeof window[funcName] === 'function';
                console.log(`   ${isAvailable ? '✅' : '❌'} ${funcName}: ${isAvailable ? 'Available' : 'Not Available'}`);
            });
            
            // Test 2: Check dataService availability
            console.log('🔍 Test 2: Checking dataService...');
            const dataServiceAvailable = window.dataService && typeof window.dataService === 'object';
            console.log(`   ${dataServiceAvailable ? '✅' : '❌'} dataService: ${dataServiceAvailable ? 'Available' : 'Not Available'}`);
            
            if (dataServiceAvailable) {
                const supabaseAvailable = window.dataService.supabase !== null;
                console.log(`   ${supabaseAvailable ? '✅' : '⚠️'} Supabase client: ${supabaseAvailable ? 'Available' : 'Not Available (Using localStorage fallback)'}`);
            }
            
            // Test 3: Process test data
            console.log('🔍 Test 3: Processing test data...');
            if (typeof window.processUploadData === 'function') {
                // Mock the function to prevent actual saving during test
                const originalSaveDeliveries = window.saveDeliveries;
                window.saveDeliveries = function(deliveries) {
                    console.log('✅ saveDeliveries called with:', deliveries.length, 'deliveries');
                    console.log('📋 Sample delivery:', deliveries[0]);
                    // Don't actually save during test
                    return Promise.resolve();
                };
                
                window.processUploadData(testData);
                
                // Restore original function
                window.saveDeliveries = originalSaveDeliveries;
                console.log('✅ Test data processed successfully');
            } else {
                console.warn('⚠️ processUploadData function not available');
            }
            
            // Test 4: Check localStorage
            console.log('🔍 Test 4: Checking localStorage...');
            try {
                const activeDeliveries = JSON.parse(localStorage.getItem('mci-active-deliveries') || '[]');
                console.log(`   📦 Active deliveries in localStorage: ${activeDeliveries.length}`);
                
                const deliveryHistory = JSON.parse(localStorage.getItem('mci-delivery-history') || '[]');
                console.log(`   📋 Delivery history in localStorage: ${deliveryHistory.length}`);
            } catch (error) {
                console.error('❌ Error accessing localStorage:', error);
            }
            
            console.log('🎉 Excel Upload Test Complete!');
            console.log('💡 If you see this message without errors, the Excel upload functionality should work correctly.');
            
        } catch (error) {
            console.error('❌ Excel Upload Test Failed:', error);
        }
    };
    
    // Add test button to the page
    function addTestButton() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addTestButton);
            return;
        }
        
        // Create test button
        const testBtn = document.createElement('button');
        testBtn.id = 'excelUploadTestBtn';
        testBtn.innerHTML = '<i class="bi bi-bug"></i> Test Excel Upload';
        testBtn.style.position = 'fixed';
        testBtn.style.bottom = '20px';
        testBtn.style.right = '20px';
        testBtn.style.zIndex = '9999';
        testBtn.style.padding = '10px 15px';
        testBtn.style.backgroundColor = '#0d6efd';
        testBtn.style.color = 'white';
        testBtn.style.border = 'none';
        testBtn.style.borderRadius = '5px';
        testBtn.style.cursor = 'pointer';
        testBtn.style.fontSize = '14px';
        testBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        
        testBtn.onclick = function() {
            window.testExcelUpload();
            alert('Test started! Check the browser console (F12) for detailed results.');
        };
        
        // Only add button in development/testing environment
        // In production, you might want to remove this or make it conditional
        document.body.appendChild(testBtn);
        console.log('🧪 Excel Upload Test Button Added');
    }
    
    // Initialize test button
    addTestButton();
    
    console.log('✅ EXCEL UPLOAD TEST LOADED');
})();