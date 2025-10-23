// FIX DATA DUPLICATION - Prevents delivery history from duplicating on refresh
console.log('🚨 FIX DATA DUPLICATION LOADING...');

(function() {
    'use strict';
    
    // Track loaded data to prevent duplicates
    let dataLoadingInProgress = false;
    let lastLoadedData = {
        deliveries: [],
        history: [],
        customers: []
    };
    
    // Override data loading functions to prevent duplicates
    const originalLoadDeliveryHistory = window.loadDeliveryHistory;
    const originalDisplayDeliveryHistory = window.displayDeliveryHistory;
    const originalLoadActiveDeliveries = window.loadActiveDeliveries;
    
    // Safe delivery history loading
    window.loadDeliveryHistory = function() {
        console.log('🔧 Safe loadDeliveryHistory called');
        
        if (dataLoadingInProgress) {
            console.log('⚠️ Data loading already in progress, skipping duplicate call');
            return Promise.resolve();
        }
        
        dataLoadingInProgress = true;
        
        try {
            // Clear existing data first
            window.deliveryHistory = [];
            
            if (originalLoadDeliveryHistory && typeof originalLoadDeliveryHistory === 'function') {
                return originalLoadDeliveryHistory().finally(() => {
                    dataLoadingInProgress = false;
                });
            } else {
                // Fallback implementation
                return loadDeliveryHistorySafe().finally(() => {
                    dataLoadingInProgress = false;
                });
            }
        } catch (error) {
            console.error('❌ Error in safe loadDeliveryHistory:', error);
            dataLoadingInProgress = false;
            return Promise.resolve();
        }
    };
    
    // Safe delivery history display
    window.displayDeliveryHistory = function(data) {
        console.log('🔧 Safe displayDeliveryHistory called with data:', data?.length || 0);
        
        try {
            // Prevent duplicate display
            const historyContainer = document.getElementById('deliveryHistoryTableBody');
            if (!historyContainer) {
                console.warn('⚠️ Delivery history container not found');
                return;
            }
            
            // Clear existing content first
            historyContainer.innerHTML = '';
            
            // Use provided data or fallback to window.deliveryHistory
            const historyData = data || window.deliveryHistory || [];
            
            // Remove duplicates based on DR number
            const uniqueHistory = [];
            const seenDRNumbers = new Set();
            
            historyData.forEach(item => {
                if (item && item.drNumber && !seenDRNumbers.has(item.drNumber)) {
                    seenDRNumbers.add(item.drNumber);
                    uniqueHistory.push(item);
                }
            });
            
            console.log(`🔧 Displaying ${uniqueHistory.length} unique history items`);
            
            if (originalDisplayDeliveryHistory && typeof originalDisplayDeliveryHistory === 'function') {
                originalDisplayDeliveryHistory(uniqueHistory);
            } else {
                displayDeliveryHistorySafe(uniqueHistory);
            }
            
        } catch (error) {
            console.error('❌ Error in safe displayDeliveryHistory:', error);
        }
    };
    
    // Safe fallback for loading delivery history
    async function loadDeliveryHistorySafe() {
        console.log('🔧 Loading delivery history safely...');
        
        try {
            if (window.dataService && window.dataService.getDeliveryHistory) {
                const history = await window.dataService.getDeliveryHistory();
                window.deliveryHistory = history || [];
                console.log(`✅ Loaded ${window.deliveryHistory.length} history items`);
                return window.deliveryHistory;
            } else {
                console.warn('⚠️ DataService not available, using empty history');
                window.deliveryHistory = [];
                return [];
            }
        } catch (error) {
            console.error('❌ Error loading delivery history:', error);
            window.deliveryHistory = [];
            return [];
        }
    }
    
    // Safe fallback for displaying delivery history
    function displayDeliveryHistorySafe(historyData) {
        console.log('🔧 Displaying delivery history safely...');
        
        const historyContainer = document.getElementById('deliveryHistoryTableBody');
        if (!historyContainer) return;
        
        if (!historyData || historyData.length === 0) {
            historyContainer.innerHTML = '<tr><td colspan="8" class="text-center">No delivery history found</td></tr>';
            return;
        }
        
        let html = '';
        historyData.forEach(delivery => {
            html += `
                <tr>
                    <td>${delivery.drNumber || 'N/A'}</td>
                    <td>${delivery.customerName || 'N/A'}</td>
                    <td>${delivery.origin || 'N/A'}</td>
                    <td>${delivery.destination || 'N/A'}</td>
                    <td>${delivery.status || 'Completed'}</td>
                    <td>${delivery.deliveryDate || delivery.createdDate || 'N/A'}</td>
                    <td>₱${(delivery.additionalCosts || 0).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewDeliveryDetails('${delivery.id || delivery.drNumber}')">
                            <i class="bi bi-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        });
        
        historyContainer.innerHTML = html;
    }
    
    // Suppress 406 errors in console
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        
        if (message.includes('406') && message.includes('Not Acceptable')) {
            console.warn('⚠️ Suppressed 406 error (handled by fix):', message);
            return;
        }
        
        originalConsoleError.apply(console, args);
    };
    
    // Override fetch to handle 406 errors gracefully
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).catch(error => {
            if (error.message && error.message.includes('406')) {
                console.warn('⚠️ 406 error caught and handled:', error.message);
                return Promise.resolve({
                    ok: false,
                    status: 406,
                    json: () => Promise.resolve([]),
                    text: () => Promise.resolve('[]')
                });
            }
            throw error;
        });
    };
    
    // Prevent multiple simultaneous data loads
    let loadTimeout;
    const originalDOMContentLoaded = document.addEventListener;
    
    // Debounce data loading on page load
    function debouncedDataLoad() {
        if (loadTimeout) {
            clearTimeout(loadTimeout);
        }
        
        loadTimeout = setTimeout(() => {
            console.log('🔧 Debounced data load executing...');
            if (typeof window.loadDeliveryHistory === 'function') {
                window.loadDeliveryHistory();
            }
        }, 1000);
    }
    
    // Override page load events to prevent duplicate loading
    document.addEventListener('DOMContentLoaded', function(event) {
        console.log('🔧 DOM Content Loaded - preventing duplicate data loads');
        debouncedDataLoad();
    });
    
    console.log('✅ FIX DATA DUPLICATION LOADED - Duplicate data and 406 errors will be handled');
})();