/**
 * MODAL COMPATIBILITY SERVICE
 * Ensures all modals work correctly with centralized database system
 * Handles field mapping, data binding, and form submissions
 */

console.log('🔧 Loading Modal Compatibility Service...');

class ModalCompatibilityService {
    constructor() {
        this.modalConfigs = {
            bookingModal: {
                formId: 'bookingForm',
                submitHandler: 'handleBookingSubmit',
                fields: ['drNumber', 'customerName', 'vendorNumber', 'origin', 'destination', 'truckType', 'truckPlateNumber']
            },
            addCustomerModal: {
                formId: 'addCustomerForm',
                submitHandler: 'handleCustomerSubmit',
                fields: ['customerName', 'email', 'phone', 'address', 'vendorNumber']
            },
            editCustomerModal: {
                formId: 'editCustomerForm',
                submitHandler: 'handleCustomerEdit',
                fields: ['customerName', 'email', 'phone', 'address', 'vendorNumber']
            },
            eSignatureModal: {
                formId: 'eSignatureForm',
                submitHandler: 'handleSignatureSubmit',
                fields: ['ePodDrNumber', 'ePodCustomerName', 'ePodCustomerContact', 'ePodTruckPlate', 'ePodDeliveryRoute']
            }
        };

        this.init();
    }

    /**
     * Initialize modal compatibility
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupModalHandlers());
        } else {
            this.setupModalHandlers();
        }
    }

    /**
     * Setup modal event handlers
     */
    setupModalHandlers() {
        console.log('🔧 Setting up modal compatibility handlers...');

        // Setup each modal
        Object.entries(this.modalConfigs).forEach(([modalId, config]) => {
            this.setupModal(modalId, config);
        });

        // Setup global modal utilities
        this.setupGlobalModalUtils();

        console.log('✅ Modal compatibility handlers ready');
    }

    /**
     * Setup individual modal
     */
    setupModal(modalId, config) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.warn(`⚠️ Modal ${modalId} not found`);
            return;
        }

        // Setup form submission handler
        const form = document.getElementById(config.formId);
        if (form) {
            // Remove existing event listeners
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            // Add new event listener
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(modalId, config, newForm);
            });
        }

        // Setup modal show/hide events
        modalElement.addEventListener('show.bs.modal', () => {
            this.onModalShow(modalId, config);
        });

        modalElement.addEventListener('hidden.bs.modal', () => {
            this.onModalHide(modalId, config);
        });
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(modalId, config, form) {
        console.log(`📋 Handling ${modalId} form submission...`);

        try {
            // Collect form data
            const formData = this.collectFormData(form, config.fields);
            
            // Validate form data
            const validation = this.validateFormData(modalId, formData);
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }

            // Show loading state
            this.setFormLoading(form, true);

            // Handle based on modal type
            let result;
            switch (modalId) {
                case 'bookingModal':
                    result = await this.handleBookingSubmission(formData);
                    break;
                case 'addCustomerModal':
                    result = await this.handleCustomerAddition(formData);
                    break;
                case 'editCustomerModal':
                    result = await this.handleCustomerEdit(formData);
                    break;
                case 'eSignatureModal':
                    result = await this.handleSignatureSubmission(formData);
                    break;
                default:
                    throw new Error(`Unknown modal type: ${modalId}`);
            }

            // Success handling
            this.showSuccessMessage(`${modalId} submitted successfully!`);
            this.hideModal(modalId);
            this.resetForm(form);

            // Refresh UI
            this.refreshRelatedViews(modalId);

        } catch (error) {
            console.error(`❌ Error submitting ${modalId}:`, error);
            this.showErrorMessage(`Failed to submit ${modalId}: ${error.message}`);
        } finally {
            this.setFormLoading(form, false);
        }
    }

    /**
     * Collect form data with field mapping
     */
    collectFormData(form, fieldNames) {
        const formData = {};
        
        fieldNames.forEach(fieldName => {
            const element = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (element) {
                formData[fieldName] = element.value;
            }
        });

        // Collect additional form elements
        const allInputs = form.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            if (input.name && !formData[input.name]) {
                formData[input.name] = input.value;
            }
        });

        console.log('📋 Collected form data:', formData);
        return formData;
    }

    /**
     * Validate form data
     */
    validateFormData(modalId, formData) {
        const errors = [];

        switch (modalId) {
            case 'bookingModal':
                if (!formData.drNumber && !formData.dr_number) {
                    errors.push('DR Number is required');
                }
                if (!formData.customerName && !formData.customer_name) {
                    errors.push('Customer Name is required');
                }
                if (!formData.origin) {
                    errors.push('Origin is required');
                }
                if (!formData.destination) {
                    errors.push('Destination is required');
                }
                break;

            case 'addCustomerModal':
            case 'editCustomerModal':
                if (!formData.customerName && !formData.name) {
                    errors.push('Customer Name is required');
                }
                break;

            case 'eSignatureModal':
                if (!formData.ePodDrNumber) {
                    errors.push('DR Number is required');
                }
                break;
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Handle booking submission through centralized service
     */
    async handleBookingSubmission(formData) {
        if (!window.centralizedBookingService || !window.centralizedBookingService.isReady) {
            throw new Error('Centralized Booking Service not ready');
        }

        return await window.centralizedBookingService.addDeliveryBooking(formData);
    }

    /**
     * Handle customer addition through centralized service
     */
    async handleCustomerAddition(formData) {
        if (!window.centralizedBookingService || !window.centralizedBookingService.isReady) {
            throw new Error('Centralized Booking Service not ready');
        }

        return await window.centralizedBookingService.addCustomer(formData);
    }

    /**
     * Handle customer edit through centralized service
     */
    async handleCustomerEdit(formData) {
        if (!window.centralizedDataService || !window.centralizedDataService.isInitialized) {
            throw new Error('Centralized Data Service not ready');
        }

        const customerId = formData.id || formData.customer_id;
        if (!customerId) {
            throw new Error('Customer ID not found for edit operation');
        }

        return await window.centralizedDataService.updateCustomer(customerId, formData);
    }

    /**
     * Handle signature submission
     */
    async handleSignatureSubmission(formData) {
        // Get signature data
        const signatureData = this.getSignatureData();
        if (!signatureData) {
            throw new Error('Signature is required');
        }

        // Find delivery to complete
        const drNumber = formData.ePodDrNumber;
        const delivery = window.findDeliveryById ? 
            window.findDeliveryById(window.activeDeliveries, drNumber) :
            window.activeDeliveries.find(d => d.drNumber === drNumber || d.dr_number === drNumber);

        if (!delivery) {
            throw new Error(`Delivery with DR Number ${drNumber} not found`);
        }

        // Update delivery status to completed
        const updates = {
            status: 'Completed',
            signature_data: signatureData,
            completed_at: new Date().toISOString()
        };

        if (window.centralizedDataService && window.centralizedDataService.isInitialized) {
            return await window.centralizedDataService.updateDelivery(delivery.id, updates);
        } else {
            throw new Error('Centralized Data Service not ready');
        }
    }

    /**
     * Get signature data from signature pad
     */
    getSignatureData() {
        // Try different signature pad implementations
        if (window.robustSignaturePad && typeof window.getRobustSignatureData === 'function') {
            return window.getRobustSignatureData();
        }
        
        if (window.signaturePad && typeof window.signaturePad.toDataURL === 'function') {
            return window.signaturePad.toDataURL();
        }

        return null;
    }

    /**
     * Modal show event handler
     */
    onModalShow(modalId, config) {
        console.log(`📋 Modal ${modalId} shown`);

        // Special handling for edit modals
        if (modalId === 'editCustomerModal') {
            this.populateEditCustomerModal();
        }
    }

    /**
     * Modal hide event handler
     */
    onModalHide(modalId, config) {
        console.log(`📋 Modal ${modalId} hidden`);

        // Clear any temporary data
        if (modalId === 'eSignatureModal') {
            this.clearSignaturePad();
        }
    }

    /**
     * Populate edit customer modal with existing data
     */
    populateEditCustomerModal() {
        if (window.currentEditingCustomer) {
            const customer = window.currentEditingCustomer;
            const form = document.getElementById('editCustomerForm');
            
            if (form) {
                // Map customer data to form fields
                const fieldMap = {
                    'customerName': customer.name || customer.customerName,
                    'email': customer.email,
                    'phone': customer.phone,
                    'address': customer.address,
                    'vendorNumber': customer.vendor_number || customer.vendorNumber
                };

                Object.entries(fieldMap).forEach(([fieldName, value]) => {
                    const element = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
                    if (element && value) {
                        element.value = value;
                    }
                });
            }
        }
    }

    /**
     * Clear signature pad
     */
    clearSignaturePad() {
        if (window.clearRobustSignature && typeof window.clearRobustSignature === 'function') {
            window.clearRobustSignature();
        }
        
        if (window.signaturePad && typeof window.signaturePad.clear === 'function') {
            window.signaturePad.clear();
        }
    }

    /**
     * Setup global modal utilities
     */
    setupGlobalModalUtils() {
        // Override existing modal functions to use centralized system
        window.showModal = (modalId) => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        };

        window.hideModal = (modalId) => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }
        };

        // Enhanced customer modal functions
        window.showAddCustomerModal = () => {
            window.showModal('addCustomerModal');
        };

        window.showEditCustomerModal = (customer) => {
            window.currentEditingCustomer = customer;
            window.showModal('editCustomerModal');
        };

        // Enhanced booking modal function
        window.openBookingModal = (dateStr) => {
            if (dateStr) {
                // Pre-populate delivery date if provided
                setTimeout(() => {
                    const deliveryDateField = document.getElementById('deliveryDate');
                    if (deliveryDateField) {
                        deliveryDateField.value = dateStr;
                    }
                }, 100);
            }
            window.showModal('bookingModal');
        };
    }

    /**
     * Show validation errors
     */
    showValidationErrors(errors) {
        const errorMessage = errors.join('\n');
        this.showErrorMessage(errorMessage);
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            console.log('✅ SUCCESS:', message);
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        if (typeof showError === 'function') {
            showError(message);
        } else if (typeof showToast === 'function') {
            showToast(message, 'danger');
        } else {
            console.error('❌ ERROR:', message);
        }
    }

    /**
     * Set form loading state
     */
    setFormLoading(form, isLoading) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.textContent = isLoading ? 'Submitting...' : 'Submit';
        }

        // Disable all form inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = isLoading;
        });
    }

    /**
     * Reset form to initial state
     */
    resetForm(form) {
        form.reset();
        
        // Clear any validation states
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
            input.disabled = false;
        });

        // Reset submit button
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    }

    /**
     * Refresh related views after modal submission
     */
    refreshRelatedViews(modalId) {
        switch (modalId) {
            case 'bookingModal':
                // Refresh active deliveries and analytics
                if (typeof refreshActiveDeliveries === 'function') {
                    refreshActiveDeliveries();
                }
                if (typeof updateAnalyticsDashboard === 'function') {
                    updateAnalyticsDashboard();
                }
                break;

            case 'addCustomerModal':
            case 'editCustomerModal':
                // Refresh customers view
                if (typeof refreshCustomers === 'function') {
                    refreshCustomers();
                }
                break;

            case 'eSignatureModal':
                // Refresh both active deliveries and delivery history
                if (typeof refreshActiveDeliveries === 'function') {
                    refreshActiveDeliveries();
                }
                if (typeof refreshDeliveryHistory === 'function') {
                    refreshDeliveryHistory();
                }
                break;
        }
    }
}

// Create global instance
window.modalCompatibilityService = new ModalCompatibilityService();

console.log('✅ Modal Compatibility Service loaded');