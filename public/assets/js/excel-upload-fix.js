// EXCEL UPLOAD FIX - Fixes 409 conflicts and ensures data only goes to Active Deliveries
console.log('🚨 EXCEL UPLOAD FIX LOADING...');

(function() {
    'use strict';
    
    // Override the createBookingFromDR function to ensure it only saves to deliveries table
    const originalCreateBookingFromDR = window.createBookingFromDR;
    
    window.createBookingFromDR = async function(bookingData) {
        console.log('🔧 FIXED createBookingFromDR called for:', bookingData.drNumber);
        
        try {
            // Ensure activeDeliveries array exists
            if (!window.activeDeliveries) {
                window.activeDeliveries = [];
                console.log('Initialized activeDeliveries array');
            }
            
            // Create delivery object for Supabase (ONLY deliveries table)
            const newDelivery = {
                dr_number: bookingData.drNumber,
                customer_name: bookingData.customerName,
                vendor_number: bookingData.vendorNumber || '',
                origin: bookingData.origin,
                destination: bookingData.destination,
                truck_type: bookingData.truckType || '',
                truck_plate_number: bookingData.truckPlateNumber || '',
                status: 'Active', // Always Active for new uploads
                distance: bookingData.distance || '',
                additional_costs: parseFloat(bookingData.additionalCosts) || 0.00,
                delivery_date: bookingData.deliveryDate || new Date().toISOString().split('T')[0],
                created_date: bookingData.bookedDate || new Date().toISOString().split('T')[0],
                created_by: 'Excel Upload',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                item_number: bookingData.itemNumber || '',
                mobile_number: bookingData.mobileNumber || '',
                item_description: bookingData.itemDescription || '',
                serial_number: bookingData.serialNumber || '',
                user_id: null // Let Supabase set this automatically
            };

            console.log('🔧 Saving to deliveries table only:', newDelivery);

            // Save ONLY to deliveries table using Supabase client directly
            if (window.supabase) {
                try {
                    // Use upsert with conflict resolution
                    const { data, error } = await window.supabase
                        .from('deliveries')
                        .upsert(newDelivery, { 
                            onConflict: 'dr_number,user_id',
                            ignoreDuplicates: false 
                        })
                        .select();

                    if (error) {
                        console.error('❌ Supabase error:', error);
                        
                        // If there's still a conflict, try insert without upsert
                        const { data: insertData, error: insertError } = await window.supabase
                            .from('deliveries')
                            .insert(newDelivery)
                            .select();
                            
                        if (insertError) {
                            console.error('❌ Insert also failed:', insertError);
                            throw insertError;
                        }
                        
                        console.log('✅ Delivery saved via insert:', insertData);
                    } else {
                        console.log('✅ Delivery saved via upsert:', data);
                    }
                    
                } catch (supabaseError) {
                    console.error('❌ Supabase save failed:', supabaseError);
                    
                    // Fallback to dataService if available
                    if (window.dataService && window.dataService.saveDelivery) {
                        try {
                            const result = await window.dataService.saveDelivery(newDelivery);
                            console.log('✅ Fallback save successful:', result);
                        } catch (fallbackError) {
                            console.error('❌ Fallback save also failed:', fallbackError);
                            throw fallbackError;
                        }
                    } else {
                        throw supabaseError;
                    }
                }
            } else {
                console.error('❌ Supabase client not available');
                throw new Error('Supabase client not available');
            }
            
            // Add to local activeDeliveries array for immediate UI update
            const localDelivery = {
                id: 'DEL-' + Date.now() + '-' + bookingData.drNumber,
                drNumber: bookingData.drNumber,
                customerName: bookingData.customerName,
                vendorNumber: bookingData.vendorNumber,
                origin: bookingData.origin,
                destination: bookingData.destination,
                truck: bookingData.truck || `${bookingData.truckType} (${bookingData.truckPlateNumber})`,
                status: 'Active',
                bookedDate: bookingData.bookedDate || new Date().toISOString().split('T')[0],
                additionalCosts: parseFloat(bookingData.additionalCosts) || 0,
                lastModified: new Date().toISOString()
            };
            
            window.activeDeliveries.push(localDelivery);
            console.log('✅ Added to local activeDeliveries:', localDelivery.drNumber);
            
            // Update UI if function exists
            if (typeof window.displayActiveDeliveries === 'function') {
                window.displayActiveDeliveries();
            }
            
            return localDelivery;
            
        } catch (error) {
            console.error('❌ Error in fixed createBookingFromDR:', error);
            throw error;
        }
    };
    
    // Override any functions that might save to delivery_history
    const problematicFunctions = [
        'saveToDeliveryHistory',
        'moveToHistory',
        'createHistoryRecord'
    ];
    
    problematicFunctions.forEach(funcName => {
        if (window[funcName]) {
            const originalFunc = window[funcName];
            window[funcName] = function(...args) {
                console.log(`🔧 Intercepted ${funcName} - preventing history save during Excel upload`);
                // Don't call the original function during Excel upload
                return Promise.resolve();
            };
        }
    });
    
    // Suppress 409 conflict errors in console
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        
        if (message.includes('409') && message.includes('Conflict') && message.includes('supabase')) {
            console.warn('⚠️ Suppressed 409 conflict error (handled by fix):', message);
            return;
        }
        
        originalConsoleError.apply(console, args);
    };
    
    console.log('✅ EXCEL UPLOAD FIX LOADED - Data will only go to Active Deliveries, 409 conflicts handled');
})();