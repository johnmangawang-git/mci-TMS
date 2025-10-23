// DEBUG EXCEL UPLOAD - Simple test to see what's happening
console.log('🚨 DEBUG EXCEL UPLOAD LOADING...');

(function() {
    'use strict';
    
    // Override the Excel upload process with detailed logging
    const originalCreateBookingFromDR = window.createBookingFromDR;
    
    window.createBookingFromDR = function(bookingData) {
        console.log('🔧 DEBUG: createBookingFromDR called with data:', bookingData);
        
        try {
            // Test localStorage access
            console.log('🔧 DEBUG: Testing localStorage access...');
            localStorage.setItem('test', 'working');
            const test = localStorage.getItem('test');
            console.log('🔧 DEBUG: localStorage test result:', test);
            localStorage.removeItem('test');
            
            // Get existing active deliveries
            console.log('🔧 DEBUG: Getting existing active deliveries...');
            let activeDeliveries = [];
            try {
                const stored = localStorage.getItem('mci-activeDeliveries');
                console.log('🔧 DEBUG: Raw stored data:', stored);
                if (stored) {
                    activeDeliveries = JSON.parse(stored);
                    console.log('🔧 DEBUG: Parsed active deliveries:', activeDeliveries);
                }
            } catch (e) {
                console.error('❌ DEBUG: Error parsing stored data:', e);
                activeDeliveries = [];
            }
            
            // Create new delivery with simple data
            const newDelivery = {
                id: 'DEL-' + Date.now(),
                drNumber: bookingData.drNumber || 'TEST-DR-' + Date.now(),
                customerName: bookingData.customerName || 'Test Customer',
                origin: bookingData.origin || 'Test Origin',
                destination: bookingData.destination || 'Test Destination',
                status: 'Active',
                bookedDate: new Date().toISOString().split('T')[0],
                additionalCosts: bookingData.additionalCosts || 0
            };
            
            console.log('🔧 DEBUG: Created new delivery:', newDelivery);
            
            // Add to array
            activeDeliveries.push(newDelivery);
            console.log('🔧 DEBUG: Updated active deliveries array:', activeDeliveries);
            
            // Save to localStorage
            try {
                const jsonString = JSON.stringify(activeDeliveries);
                console.log('🔧 DEBUG: JSON string to save:', jsonString);
                localStorage.setItem('mci-activeDeliveries', jsonString);
                console.log('✅ DEBUG: Saved to localStorage successfully');
                
                // Verify it was saved
                const verification = localStorage.getItem('mci-activeDeliveries');
                console.log('🔧 DEBUG: Verification read:', verification);
                
            } catch (saveError) {
                console.error('❌ DEBUG: Error saving to localStorage:', saveError);
                throw saveError;
            }
            
            // Force refresh display
            console.log('🔧 DEBUG: Forcing display refresh...');
            setTimeout(() => {
                try {
                    if (typeof window.displayActiveDeliveries === 'function') {
                        console.log('🔧 DEBUG: Calling displayActiveDeliveries...');
                        window.displayActiveDeliveries(activeDeliveries);
                    } else {
                        console.warn('⚠️ DEBUG: displayActiveDeliveries function not available');
                    }
                    
                    if (typeof window.updateDashboardStats === 'function') {
                        console.log('🔧 DEBUG: Calling updateDashboardStats...');
                        window.updateDashboardStats();
                    } else {
                        console.warn('⚠️ DEBUG: updateDashboardStats function not available');
                    }
                } catch (displayError) {
                    console.error('❌ DEBUG: Error in display refresh:', displayError);
                }
            }, 1000);
            
            console.log('✅ DEBUG: createBookingFromDR completed successfully');
            return Promise.resolve(newDelivery);
            
        } catch (error) {
            console.error('❌ DEBUG: Error in createBookingFromDR:', error);
            console.error('❌ DEBUG: Error stack:', error.stack);
            return Promise.reject(error);
        }
    };
    
    // Also override the Excel file processing to add logging
    const originalProcessDRFile = window.processDRFile;
    if (originalProcessDRFile) {
        window.processDRFile = function(file) {
            console.log('🔧 DEBUG: processDRFile called with file:', file.name);
            
            try {
                return originalProcessDRFile(file);
            } catch (error) {
                console.error('❌ DEBUG: Error in processDRFile:', error);
                throw error;
            }
        };
    }
    
    // Override confirmDRUpload to add logging
    const originalConfirmDRUpload = window.confirmDRUpload;
    if (originalConfirmDRUpload) {
        window.confirmDRUpload = function() {
            console.log('🔧 DEBUG: confirmDRUpload called');
            console.log('🔧 DEBUG: pendingDRBookings:', window.pendingDRBookings);
            
            try {
                return originalConfirmDRUpload();
            } catch (error) {
                console.error('❌ DEBUG: Error in confirmDRUpload:', error);
                throw error;
            }
        };
    }
    
    // Add a manual test button
    setTimeout(() => {
        const testButton = document.createElement('button');
        testButton.textContent = 'TEST EXCEL UPLOAD';
        testButton.style.position = 'fixed';
        testButton.style.top = '10px';
        testButton.style.right = '10px';
        testButton.style.zIndex = '9999';
        testButton.style.backgroundColor = 'red';
        testButton.style.color = 'white';
        testButton.style.padding = '10px';
        testButton.style.border = 'none';
        testButton.style.borderRadius = '5px';
        
        testButton.onclick = function() {
            console.log('🔧 DEBUG: Manual test button clicked');
            
            const testData = {
                drNumber: 'TEST-' + Date.now(),
                customerName: 'Manual Test Customer',
                origin: 'Test Origin',
                destination: 'Test Destination',
                additionalCosts: 100
            };
            
            window.createBookingFromDR(testData);
        };
        
        document.body.appendChild(testButton);
        console.log('✅ DEBUG: Test button added to page');
    }, 2000);
    
    console.log('✅ DEBUG EXCEL UPLOAD LOADED');
})();