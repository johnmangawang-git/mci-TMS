/**
 * FIELD MAPPING SERVICE
 * Handles conversion between localStorage format and Supabase format
 * Ensures consistent ID mapping and field naming across the application
 */

console.log('🔄 Loading Field Mapping Service...');

class FieldMappingService {
    constructor() {
        this.deliveryFieldMap = {
            // ID mappings
            'id': 'id',
            'delivery_id': 'id',
            'deliveryId': 'id',
            
            // DR Number mappings
            'drNumber': 'dr_number',
            'dr_number': 'dr_number',
            'DR': 'dr_number',
            
            // Customer mappings
            'customerName': 'customer_name',
            'customer_name': 'customer_name',
            'Customer': 'customer_name',
            
            // Vendor mappings
            'vendorNumber': 'vendor_number',
            'vendor_number': 'vendor_number',
            'Vendor': 'vendor_number',
            
            // Truck mappings
            'truckType': 'truck_type',
            'truck_type': 'truck_type',
            'truckPlateNumber': 'truck_plate_number',
            'truck_plate_number': 'truck_plate_number',
            'truckPlate': 'truck_plate_number',
            
            // Date mappings
            'deliveryDate': 'delivery_date',
            'delivery_date': 'delivery_date',
            'created_date': 'created_date',
            'createdDate': 'created_date',
            'completedDate': 'completed_at',
            'completed_date': 'completed_at',
            'completedDateTime': 'completed_at',
            'completedTimestamp': 'completed_at',
            
            // Cost mappings
            'additionalCosts': 'additional_costs',
            'additional_costs': 'additional_costs',
            'additionalCostItems': 'additional_data',
            
            // Item mappings
            'itemNumber': 'item_number',
            'item_number': 'item_number',
            'itemDescription': 'item_description',
            'item_description': 'item_description',
            'serialNumber': 'serial_number',
            'serial_number': 'serial_number',
            'mobileNumber': 'mobile_number',
            'mobile_number': 'mobile_number',
            
            // System mappings
            'timestamp': 'created_at',
            'createdBy': 'created_by',
            'created_by': 'created_by',
            'userId': 'user_id',
            'user_id': 'user_id'
        };

        this.customerFieldMap = {
            'id': 'id',
            'customer_id': 'id',
            'customerId': 'id',
            'name': 'name',
            'customerName': 'name',
            'customer_name': 'name',
            'email': 'email',
            'phone': 'phone',
            'mobile': 'mobile_number',
            'mobileNumber': 'mobile_number',
            'mobile_number': 'mobile_number',
            'address': 'address',
            'vendorNumber': 'vendor_number',
            'vendor_number': 'vendor_number',
            'contactPerson': 'contact_person',
            'contact_person': 'contact_person',
            'userId': 'user_id',
            'user_id': 'user_id'
        };

        this.reverseDeliveryMap = this.createReverseMap(this.deliveryFieldMap);
        this.reverseCustomerMap = this.createReverseMap(this.customerFieldMap);
    }

    /**
     * Create reverse mapping for converting Supabase format back to frontend format
     */
    createReverseMap(fieldMap) {
        const reverseMap = {};
        Object.entries(fieldMap).forEach(([key, value]) => {
            if (!reverseMap[value]) {
                reverseMap[value] = key;
            }
        });
        return reverseMap;
    }

    /**
     * Convert delivery data from frontend format to Supabase format
     */
    mapDeliveryToSupabase(deliveryData) {
        if (!deliveryData) return null;

        const mapped = {};
        
        // Handle direct field mappings
        Object.entries(deliveryData).forEach(([key, value]) => {
            const supabaseField = this.deliveryFieldMap[key] || key;
            
            // Special handling for different field types
            if (supabaseField === 'additional_costs' && typeof value === 'string') {
                mapped[supabaseField] = parseFloat(value) || 0;
            } else if (supabaseField === 'additional_data') {
                // Store complex data as JSON
                if (typeof value === 'object') {
                    mapped[supabaseField] = JSON.stringify(value);
                } else if (Array.isArray(value)) {
                    mapped[supabaseField] = JSON.stringify({ additionalCostItems: value });
                }
            } else if (supabaseField.includes('_date') || supabaseField.includes('_at')) {
                // Handle date fields
                mapped[supabaseField] = this.normalizeDate(value);
            } else {
                mapped[supabaseField] = value;
            }
        });

        // Ensure required fields have defaults
        if (!mapped.dr_number && !mapped.id) {
            mapped.dr_number = this.generateDRNumber();
        }
        
        if (!mapped.status) {
            mapped.status = 'On Schedule';
        }

        if (!mapped.created_at) {
            mapped.created_at = new Date().toISOString();
        }

        console.log('📋 Mapped delivery to Supabase format:', { original: deliveryData, mapped });
        return mapped;
    }

    /**
     * Convert delivery data from Supabase format to frontend format
     */
    mapDeliveryFromSupabase(supabaseData) {
        if (!supabaseData) return null;

        const mapped = {};
        
        Object.entries(supabaseData).forEach(([key, value]) => {
            // Use original key if no reverse mapping exists
            const frontendField = this.reverseDeliveryMap[key] || key;
            
            // Special handling for JSON fields
            if (key === 'additional_data' && typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (parsed.additionalCostItems) {
                        mapped.additionalCostItems = parsed.additionalCostItems;
                    }
                    // Add other parsed fields
                    Object.entries(parsed).forEach(([subKey, subValue]) => {
                        if (subKey !== 'additionalCostItems') {
                            mapped[subKey] = subValue;
                        }
                    });
                } catch (e) {
                    console.warn('Failed to parse additional_data:', value);
                }
            } else {
                mapped[frontendField] = value;
            }
        });

        // Ensure frontend compatibility
        if (!mapped.id && mapped.delivery_id) {
            mapped.id = mapped.delivery_id;
        }

        console.log('📋 Mapped delivery from Supabase format:', { original: supabaseData, mapped });
        return mapped;
    }

    /**
     * Convert customer data from frontend format to Supabase format
     */
    mapCustomerToSupabase(customerData) {
        if (!customerData) return null;

        const mapped = {};
        
        Object.entries(customerData).forEach(([key, value]) => {
            const supabaseField = this.customerFieldMap[key] || key;
            mapped[supabaseField] = value;
        });

        // Ensure required fields
        if (!mapped.name && mapped.customerName) {
            mapped.name = mapped.customerName;
        }

        if (!mapped.created_at) {
            mapped.created_at = new Date().toISOString();
        }

        console.log('👤 Mapped customer to Supabase format:', { original: customerData, mapped });
        return mapped;
    }

    /**
     * Convert customer data from Supabase format to frontend format
     */
    mapCustomerFromSupabase(supabaseData) {
        if (!supabaseData) return null;

        const mapped = {};
        
        Object.entries(supabaseData).forEach(([key, value]) => {
            const frontendField = this.reverseCustomerMap[key] || key;
            mapped[frontendField] = value;
        });

        // Ensure frontend compatibility
        if (!mapped.customerName && mapped.name) {
            mapped.customerName = mapped.name;
        }

        console.log('👤 Mapped customer from Supabase format:', { original: supabaseData, mapped });
        return mapped;
    }

    /**
     * Normalize date values for database storage
     */
    normalizeDate(dateValue) {
        if (!dateValue) return null;

        try {
            if (dateValue instanceof Date) {
                return dateValue.toISOString();
            }
            
            if (typeof dateValue === 'string') {
                // Handle various date formats
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }
            
            return dateValue;
        } catch (error) {
            console.warn('Failed to normalize date:', dateValue, error);
            return dateValue;
        }
    }

    /**
     * Generate unique DR number
     */
    generateDRNumber() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const time = now.getTime().toString().slice(-6);
        
        return `DR${year}${month}${day}-${time}`;
    }

    /**
     * Find delivery by ID (handles multiple ID formats)
     */
    findDeliveryById(deliveries, targetId) {
        if (!deliveries || !targetId) return null;

        return deliveries.find(delivery => {
            return delivery.id === targetId ||
                   delivery.delivery_id === targetId ||
                   delivery.deliveryId === targetId ||
                   String(delivery.id) === String(targetId) ||
                   String(delivery.delivery_id) === String(targetId);
        });
    }

    /**
     * Find delivery index by ID (handles multiple ID formats)
     */
    findDeliveryIndexById(deliveries, targetId) {
        if (!deliveries || !targetId) return -1;

        return deliveries.findIndex(delivery => {
            return delivery.id === targetId ||
                   delivery.delivery_id === targetId ||
                   delivery.deliveryId === targetId ||
                   String(delivery.id) === String(targetId) ||
                   String(delivery.delivery_id) === String(targetId);
        });
    }

    /**
     * Find customer by ID (handles multiple ID formats)
     */
    findCustomerById(customers, targetId) {
        if (!customers || !targetId) return null;

        return customers.find(customer => {
            return customer.id === targetId ||
                   customer.customer_id === targetId ||
                   customer.customerId === targetId ||
                   String(customer.id) === String(targetId);
        });
    }

    /**
     * Normalize delivery array for consistent format
     */
    normalizeDeliveryArray(deliveries) {
        if (!Array.isArray(deliveries)) return [];

        return deliveries.map(delivery => {
            // Ensure consistent ID field
            if (!delivery.id && delivery.delivery_id) {
                delivery.id = delivery.delivery_id;
            }
            if (!delivery.id && delivery.deliveryId) {
                delivery.id = delivery.deliveryId;
            }

            // Ensure consistent DR number field
            if (!delivery.drNumber && delivery.dr_number) {
                delivery.drNumber = delivery.dr_number;
            }
            if (!delivery.dr_number && delivery.drNumber) {
                delivery.dr_number = delivery.drNumber;
            }

            // Ensure consistent customer name field
            if (!delivery.customerName && delivery.customer_name) {
                delivery.customerName = delivery.customer_name;
            }
            if (!delivery.customer_name && delivery.customerName) {
                delivery.customer_name = delivery.customerName;
            }

            return delivery;
        });
    }

    /**
     * Normalize customer array for consistent format
     */
    normalizeCustomerArray(customers) {
        if (!Array.isArray(customers)) return [];

        return customers.map(customer => {
            // Ensure consistent ID field
            if (!customer.id && customer.customer_id) {
                customer.id = customer.customer_id;
            }

            // Ensure consistent name field
            if (!customer.name && customer.customerName) {
                customer.name = customer.customerName;
            }
            if (!customer.customerName && customer.name) {
                customer.customerName = customer.name;
            }

            return customer;
        });
    }

    /**
     * Update delivery status with proper field mapping
     */
    updateDeliveryStatus(delivery, newStatus) {
        if (!delivery) return null;

        const updatedDelivery = { ...delivery };
        updatedDelivery.status = newStatus;

        // Set completion timestamp if completing
        if (newStatus === 'Completed' || newStatus === 'Signed') {
            const now = new Date();
            updatedDelivery.completed_at = now.toISOString();
            updatedDelivery.completedDate = now.toLocaleDateString();
            updatedDelivery.completedDateTime = now.toLocaleString();
            updatedDelivery.completedTimestamp = now.toISOString();
        }

        return updatedDelivery;
    }

    /**
     * Validate required fields for Supabase insertion
     */
    validateDeliveryForSupabase(deliveryData) {
        const errors = [];
        const mapped = this.mapDeliveryToSupabase(deliveryData);

        if (!mapped.dr_number) {
            errors.push('DR Number is required');
        }

        if (!mapped.customer_name) {
            errors.push('Customer Name is required');
        }

        if (!mapped.origin) {
            errors.push('Origin is required');
        }

        if (!mapped.destination) {
            errors.push('Destination is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            mappedData: mapped
        };
    }

    /**
     * Validate required fields for customer Supabase insertion
     */
    validateCustomerForSupabase(customerData) {
        const errors = [];
        const mapped = this.mapCustomerToSupabase(customerData);

        if (!mapped.name) {
            errors.push('Customer Name is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            mappedData: mapped
        };
    }
}

// Create global instance
window.fieldMappingService = new FieldMappingService();

// Export utility functions globally
window.mapDeliveryToSupabase = (data) => window.fieldMappingService.mapDeliveryToSupabase(data);
window.mapDeliveryFromSupabase = (data) => window.fieldMappingService.mapDeliveryFromSupabase(data);
window.mapCustomerToSupabase = (data) => window.fieldMappingService.mapCustomerToSupabase(data);
window.mapCustomerFromSupabase = (data) => window.fieldMappingService.mapCustomerFromSupabase(data);
window.findDeliveryById = (deliveries, id) => window.fieldMappingService.findDeliveryById(deliveries, id);
window.findDeliveryIndexById = (deliveries, id) => window.fieldMappingService.findDeliveryIndexById(deliveries, id);
window.normalizeDeliveryArray = (deliveries) => window.fieldMappingService.normalizeDeliveryArray(deliveries);
window.normalizeCustomerArray = (customers) => window.fieldMappingService.normalizeCustomerArray(customers);

console.log('✅ Field Mapping Service loaded and ready');