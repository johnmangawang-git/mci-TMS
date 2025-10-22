/**
 * SUPABASE-CENTRIC SETUP: Clear localStorage and Configure App
 * Run this in console to immediately switch to Supabase-only mode
 */

(function() {
    console.log('🚀 SUPABASE-CENTRIC SETUP INITIATED...');
    
    // 1. Clear ALL localStorage data
    const allKeys = Object.keys(localStorage);
    let clearedCount = 0;
    
    allKeys.forEach(key => {
        localStorage.removeItem(key);
        clearedCount++;
    });
    
    console.log(`🗑️ Cleared ${clearedCount} localStorage items`);
    
    // 2. Clear global delivery arrays
    window.activeDeliveries = [];
    window.deliveryHistory = [];
    console.log('✅ Reset global delivery arrays');
    
    // 3. Disable Chart.js to prevent errors
    if (typeof Chart !== 'undefined') {
        window.OriginalChart = Chart;
        window.Chart = function() {
            console.log('📊 Chart creation intercepted (Supabase mode)');
            return {
                update: () => console.log('📊 Chart update blocked'),
                destroy: () => console.log('📊 Chart destroy blocked'),
                data: { labels: [], datasets: [] }
            };
        };
        // Copy static methods
        Object.keys(window.OriginalChart).forEach(key => {
            if (typeof window.OriginalChart[key] === 'function') {
                window.Chart[key] = window.OriginalChart[key];
            }
        });
        console.log('📊 Chart.js disabled to prevent DOM errors');
    }
    
    // 4. Override analytics functions to prevent errors
    window.updateCostBreakdownChart = () => console.log('📊 Cost breakdown chart disabled (Supabase mode)');
    window.initAnalyticsCharts = () => console.log('📊 Analytics charts disabled (Supabase mode)');
    
    // 5. Clear any existing chart instances
    try {
        const canvas = document.getElementById('costBreakdownChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        console.log('🧹 Cleared chart canvas');
    } catch (e) {
        console.log('⚠️ Chart canvas cleanup skipped:', e.message);
    }
    
    console.log('✅ SUPABASE-CENTRIC SETUP COMPLETE!');
    console.log('📡 App is now configured for Supabase-only data');
    console.log('🔄 Reloading page in 2 seconds...');
    
    setTimeout(() => {
        location.reload();
    }, 2000);
    
})();