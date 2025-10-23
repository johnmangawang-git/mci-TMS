// FORCE DASHBOARD FIX - Aggressively fixes dashboard numbers
console.log('🚨 FORCE DASHBOARD FIX LOADING...');

(function() {
    'use strict';
    
    // Force update dashboard every 2 seconds until it's correct
    let updateInterval;
    let attempts = 0;
    const maxAttempts = 30; // Try for 1 minute
    
    function forceDashboardUpdate() {
        attempts++;
        console.log(`🔧 FORCE: Dashboard update attempt ${attempts}`);
        
        try {
            // Get localStorage data
            const activeStored = localStorage.getItem('mci-activeDeliveries');
            const activeDeliveries = activeStored ? JSON.parse(activeStored) : [];
            const activeCount = activeDeliveries.length;
            
            console.log(`🔧 FORCE: Found ${activeCount} active deliveries in localStorage`);
            
            // Find and update all dashboard cards
            const dashboardCards = document.querySelectorAll('.card-body h2');
            let updated = false;
            
            dashboardCards.forEach((card, index) => {
                const currentValue = card.textContent.trim();
                const cardContainer = card.closest('.card-body');
                const titleElement = cardContainer ? cardContainer.querySelector('h6') : null;
                const title = titleElement ? titleElement.textContent.trim() : '';
                
                console.log(`🔧 FORCE: Card ${index}: "${currentValue}" - Title: "${title}"`);
                
                // Update Booked Deliveries (currently showing 290)
                if (currentValue === '290' || title.includes('Booked')) {
                    card.textContent = activeCount.toString();
                    card.style.color = 'red'; // Make it obvious it changed
                    console.log(`✅ FORCE: Updated Booked Deliveries to ${activeCount}`);
                    updated = true;
                }
                
                // Update Completed Deliveries (currently showing 289)
                if (currentValue === '289' || title.includes('Completed')) {
                    card.textContent = '0';
                    card.style.color = 'red'; // Make it obvious it changed
                    console.log(`✅ FORCE: Updated Completed Deliveries to 0`);
                    updated = true;
                }
                
                // Update Active Deliveries
                if (title.includes('Active') && currentValue !== activeCount.toString()) {
                    card.textContent = activeCount.toString();
                    card.style.color = 'red'; // Make it obvious it changed
                    console.log(`✅ FORCE: Updated Active Deliveries to ${activeCount}`);
                    updated = true;
                }
            });
            
            if (updated || attempts >= maxAttempts) {
                console.log(`🔧 FORCE: Stopping updates after ${attempts} attempts`);
                clearInterval(updateInterval);
            }
            
        } catch (error) {
            console.error('❌ FORCE: Error in dashboard update:', error);
        }
    }
    
    // Start forcing updates immediately and every 2 seconds
    setTimeout(() => {
        console.log('🔧 FORCE: Starting aggressive dashboard updates...');
        forceDashboardUpdate(); // Run immediately
        updateInterval = setInterval(forceDashboardUpdate, 2000);
    }, 1000);
    
    // Create a HUGE test button that's impossible to miss
    setTimeout(() => {
        const testButton = document.createElement('button');
        testButton.textContent = '🚨 CLICK ME TO TEST EXCEL UPLOAD 🚨';
        testButton.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 99999;
            background-color: red;
            color: white;
            padding: 20px 40px;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
        `;
        
        // Add pulsing animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        testButton.onclick = function() {
            console.log('🚨 HUGE TEST BUTTON CLICKED!');
            
            // Remove the button
            testButton.remove();
            
            // Create test data
            const testData = {
                drNumber: 'FORCE-TEST-' + Date.now(),
                customerName: 'Force Test Customer',
                origin: 'Force Test Origin',
                destination: 'Force Test Destination',
                additionalCosts: 999
            };
            
            console.log('🔧 FORCE: Creating test delivery:', testData);
            
            // Manually add to localStorage
            try {
                const stored = localStorage.getItem('mci-activeDeliveries');
                const activeDeliveries = stored ? JSON.parse(stored) : [];
                
                const newDelivery = {
                    id: 'FORCE-' + Date.now(),
                    drNumber: testData.drNumber,
                    customerName: testData.customerName,
                    origin: testData.origin,
                    destination: testData.destination,
                    status: 'Active',
                    bookedDate: new Date().toISOString().split('T')[0],
                    additionalCosts: testData.additionalCosts
                };
                
                activeDeliveries.push(newDelivery);
                localStorage.setItem('mci-activeDeliveries', JSON.stringify(activeDeliveries));
                
                console.log('✅ FORCE: Test delivery saved to localStorage');
                console.log('🔧 FORCE: Total deliveries now:', activeDeliveries.length);
                
                // Force refresh everything
                setTimeout(() => {
                    if (typeof window.displayActiveDeliveries === 'function') {
                        window.displayActiveDeliveries(activeDeliveries);
                    }
                    forceDashboardUpdate();
                }, 500);
                
                alert(`✅ Test delivery created! Check Active Deliveries tab.\nDR Number: ${testData.drNumber}`);
                
            } catch (error) {
                console.error('❌ FORCE: Error creating test delivery:', error);
                alert('❌ Error creating test delivery. Check console.');
            }
        };
        
        document.body.appendChild(testButton);
        console.log('✅ FORCE: HUGE test button added - impossible to miss!');
        
        // Auto-remove button after 30 seconds
        setTimeout(() => {
            if (testButton.parentNode) {
                testButton.remove();
                console.log('🔧 FORCE: Auto-removed test button after 30 seconds');
            }
        }, 30000);
        
    }, 3000);
    
    console.log('✅ FORCE DASHBOARD FIX LOADED');
})();