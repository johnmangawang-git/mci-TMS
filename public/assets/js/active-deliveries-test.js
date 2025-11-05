/**
 * ACTIVE DELIVERIES TEST SCRIPT
 * Tests the Active Deliveries display fixes
 */

console.log('🧪 Loading Active Deliveries Test Script...');

// =============================================================================
// 1. TEST FUNCTIONS
// =============================================================================

window.testActiveDeliveriesDisplay = function() {
    console.log('🧪 Testing Active Deliveries Display...');
    
    // Test 1: Check if arrays exist
    console.log('📊 Testing array initialization...');
    console.log('activeDeliveries exists:', typeof window.activeDeliveries !== 'undefined');
    console.log('activeDeliveries is array:', Array.isArray(window.activeDeliveries));
    console.log('activeDeliveries length:', window.activeDeliveries ? window.activeDeliveries.length : 'undefined');
    
    // Test 2: Check if functions exist
    console.log('📊 Testing function availability...');
    console.log('loadActiveDeliveries exists:', typeof window.loadActiveDeliveries === 'function');
    console.log('populateActiveDeliveriesTable exists:', typeof window.populateActiveDeliveriesTable === 'function');
    console.log('switchToActiveDeliveriesView exists:', typeof window.switchToActiveDeliveriesView === 'function');
    
    // Test 3: Check table element
    console.log('📊 Testing table element...');
    const tableBody = document.getElementById('activeDeliveriesTableBody');
    console.log('Table body exists:', !!tableBody);
    
    // Test 4: Check data format
    if (window.activeDeliveries && window.activeDeliveries.length > 0) {
        console.log('📊 Testing data format...');
        const sample = window.activeDeliveries[0];
        console.log('Sample delivery:', sample);
        console.log('Has drNumber:', !!sample.drNumber);
        console.log('Has customerName:', !!sample.customerName);
        console.log('Has status:', !!sample.status);
        console.log('Status value:', sample.status);
    }
    
    console.log('✅ Active Deliveries Display Test completed');
};

window.testExcelUploadFlow = function() {
    console.log('🧪 Testing Excel Upload Flow...');
    
    // Test 1: Check if upload functions exist
    console.log('📊 Testing upload function availability...');
    console.log('confirmDRUpload exists:', typeof window.confirmDRUpload === 'function');
    console.log('createBookingFromDR exists:', typeof window.createBookingFromDR === 'function');
    console.log('mapDRData exists:', typeof window.mapDRData === 'function');
    
    // Test 2: Check if pending data exists
    console.log('📊 Testing pending data...');
    console.log('pendingDRBookings exists:', typeof window.pendingDRBookings !== 'undefined');
    console.log('pendingDRBookings length:', window.pendingDRBookings ? window.pendingDRBookings.length : 'undefined');
    
    // Test 3: Check data service
    console.log('📊 Testing data service...');
    console.log('dataService exists:', typeof window.dataService !== 'undefined');
    console.log('dataService.getDeliveries exists:', window.dataService && typeof window.dataService.getDeliveries === 'function');
    console.log('dataService.saveDelivery exists:', window.dataService && typeof window.dataService.saveDelivery === 'function');
    
    console.log('✅ Excel Upload Flow Test completed');
};

window.testDataFlow = function() {
    console.log('🧪 Testing Data Flow...');
    
    // Test 1: Check localStorage
    console.log('📊 Testing localStorage...');
    const saved = localStorage.getItem('mci-active-deliveries');
    console.log('localStorage data exists:', !!saved);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            console.log('localStorage data length:', parsed.length);
            console.log('localStorage data sample:', parsed[0]);
        } catch (error) {
            console.error('localStorage parse error:', error);
        }
    }
    
    // Test 2: Check Supabase connection
    console.log('📊 Testing Supabase connection...');
    console.log('Supabase client exists:', typeof window.supabaseClientInstance !== 'undefined');
    console.log('Supabase URL:', window.SUPABASE_URL);
    console.log('Supabase key exists:', !!window.SUPABASE_ANON_KEY);
    
    // Test 3: Check field mapping
    console.log('📊 Testing field mapping...');
    console.log('fieldMappingService exists:', typeof window.fieldMappingService !== 'undefined');
    console.log('normalizeDeliveryArray exists:', typeof window.normalizeDeliveryArray === 'function');
    
    console.log('✅ Data Flow Test completed');
};

window.testUIRefresh = function() {
    console.log('🧪 Testing UI Refresh...');
    
    // Test 1: Check if refresh functions work
    console.log('📊 Testing refresh functions...');
    
    if (typeof window.loadActiveDeliveries === 'function') {
        console.log('🔄 Calling loadActiveDeliveries...');
        window.loadActiveDeliveries(true).then(() => {
            console.log('✅ loadActiveDeliveries completed');
        }).catch(error => {
            console.error('❌ loadActiveDeliveries failed:', error);
        });
    }
    
    // Test 2: Check table population
    setTimeout(() => {
        const tableBody = document.getElementById('activeDeliveriesTableBody');
        if (tableBody) {
            const rows = tableBody.querySelectorAll('tr');
            console.log('Table rows count:', rows.length);
            console.log('Table has data:', rows.length > 1); // More than header row
        }
    }, 1000);
    
    console.log('✅ UI Refresh Test completed');
};

// =============================================================================
// 2. COMPREHENSIVE TEST
// =============================================================================

window.runComprehensiveTest = function() {
    console.log('🧪 Running Comprehensive Active Deliveries Test...');
    
    // Run all tests
    window.testActiveDeliveriesDisplay();
    window.testExcelUploadFlow();
    window.testDataFlow();
    window.testUIRefresh();
    
    // Summary
    setTimeout(() => {
        console.log('📊 TEST SUMMARY:');
        console.log('Active Deliveries Count:', window.activeDeliveries ? window.activeDeliveries.length : 0);
        console.log('Table Rows:', document.querySelectorAll('#activeDeliveriesTableBody tr').length);
        console.log('Functions Available:', {
            loadActiveDeliveries: typeof window.loadActiveDeliveries === 'function',
            populateActiveDeliveriesTable: typeof window.populateActiveDeliveriesTable === 'function',
            switchToActiveDeliveriesView: typeof window.switchToActiveDeliveriesView === 'function'
        });
        
        if (window.activeDeliveries && window.activeDeliveries.length > 0) {
            console.log('✅ Active Deliveries are loaded and ready');
        } else {
            console.log('⚠️ No Active Deliveries found - this is normal if no data has been uploaded');
        }
    }, 2000);
};

// =============================================================================
// 3. DEBUG FUNCTIONS
// =============================================================================

window.debugActiveDeliveries = function() {
    console.log('🔍 DEBUG: Active Deliveries State');
    console.log('activeDeliveries:', window.activeDeliveries);
    console.log('activeDeliveries length:', window.activeDeliveries ? window.activeDeliveries.length : 'undefined');
    
    if (window.activeDeliveries && window.activeDeliveries.length > 0) {
        console.log('Sample delivery:', window.activeDeliveries[0]);
        console.log('All deliveries:', window.activeDeliveries);
    }
    
    // Check localStorage
    const saved = localStorage.getItem('mci-active-deliveries');
    console.log('localStorage data:', saved ? JSON.parse(saved) : 'No data');
    
    // Check table
    const tableBody = document.getElementById('activeDeliveriesTableBody');
    console.log('Table body:', tableBody);
    if (tableBody) {
        console.log('Table innerHTML length:', tableBody.innerHTML.length);
        console.log('Table rows:', tableBody.querySelectorAll('tr').length);
    }
};

window.forceRefreshActiveDeliveries = function() {
    console.log('🔄 Force refreshing Active Deliveries...');
    
    // Clear any blocking flags
    window.pendingStatusChanges = new Map();
    window.statusUpdateInProgress = false;
    window.lastStatusUpdate = null;
    
    // Force reload
    if (typeof window.loadActiveDeliveries === 'function') {
        window.loadActiveDeliveries(true);
    }
    
    // Force table population
    if (typeof window.populateActiveDeliveriesTable === 'function') {
        window.populateActiveDeliveriesTable();
    }
    
    console.log('✅ Force refresh completed');
};

// =============================================================================
// 4. INITIALIZATION
// =============================================================================

// Auto-run test on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Active Deliveries Test Script initialized');
    
    // Run test after a delay to ensure all scripts are loaded
    setTimeout(() => {
        console.log('🧪 Running initial test...');
        window.runComprehensiveTest();
    }, 3000);
});

console.log('✅ Active Deliveries Test Script loaded successfully');

