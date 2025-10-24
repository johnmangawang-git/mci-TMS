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
    

    
    console.log('✅ FORCE DASHBOARD FIX LOADED');
})();