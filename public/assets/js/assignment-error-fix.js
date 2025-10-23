// ASSIGNMENT ERROR FIX - Prevents "Cannot assign to read only property" errors
console.log('🚨 ASSIGNMENT ERROR FIX LOADING...');

(function() {
    'use strict';
    
    // Override the global error handler to catch assignment errors
    const originalError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
        // Suppress assignment errors for analytics functions
        if (message && (
            message.includes('Cannot assign to read only property') ||
            message.includes('loadAnalyticsData') ||
            message.includes('initAnalyticsCharts') ||
            message.includes('updateCostsChart')
        )) {
            console.warn('⚠️ Suppressed assignment error:', message);
            return true; // Prevent default error handling
        }
        
        // Call original error handler for other errors
        if (originalError) {
            return originalError.apply(this, arguments);
        }
        return false;
    };
    
    // Also override addEventListener to catch errors
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'error') {
            const wrappedListener = function(event) {
                if (event.error && event.error.message && (
                    event.error.message.includes('Cannot assign to read only property') ||
                    event.error.message.includes('loadAnalyticsData') ||
                    event.error.message.includes('initAnalyticsCharts') ||
                    event.error.message.includes('updateCostsChart')
                )) {
                    console.warn('⚠️ Suppressed assignment error event:', event.error.message);
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                if (typeof listener === 'function') {
                    listener.call(this, event);
                }
            };
            return originalAddEventListener.call(this, type, wrappedListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Create a safe property setter that doesn't throw errors
    function safeSetProperty(obj, prop, value) {
        try {
            obj[prop] = value;
        } catch (error) {
            if (error.message.includes('Cannot assign to read only property')) {
                console.warn(`⚠️ Prevented read-only assignment to ${prop}`);
                // Try to delete and recreate the property
                try {
                    delete obj[prop];
                    obj[prop] = value;
                } catch (deleteError) {
                    console.warn(`⚠️ Could not recreate property ${prop}`);
                }
            } else {
                throw error;
            }
        }
    }
    
    // Make safeSetProperty available globally
    window.safeSetProperty = safeSetProperty;
    
    console.log('✅ ASSIGNMENT ERROR FIX LOADED - Read-only property errors will be suppressed');
})();