// Warehouse Map Management System
class WarehouseMapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.savedLocations = [];
        this.warehouseLocations = [
            {
                id: 'alabang',
                name: 'SMEG Alabang Warehouse',
                address: '123 Logistics Park, Alabang, Muntinlupa City',
                coordinates: { lat: 14.444208, lng: 121.046787 },
                capacity: 1000,
                utilization: 780,
                type: 'warehouse'
            },
            {
                id: 'cebu',
                name: 'SMEG Cebu Warehouse',
                address: '456 Distribution Center, Cebu City',
                coordinates: { lat: 10.3157, lng: 123.8854 },
                capacity: 800,
                utilization: 520,
                type: 'warehouse'
            }
        ];
        this.loadSavedLocations();
    }

    // Initialize the warehouse map
    initializeMap() {
        console.log('Initializing warehouse map...');

        const mapContainer = document.getElementById('warehouseMapContainer');
        if (!mapContainer) {
            console.error('Warehouse map container not found');
            return;
        }

        // Clear existing map if any
        if (this.map) {
            this.map.remove();
        }

        // Initialize Leaflet map centered on Philippines
        this.map = L.map('warehouseMapContainer').setView([12.8797, 121.7740], 6);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add warehouse markers
        this.addWarehouseMarkers();

        // Add saved location markers
        this.addSavedLocationMarkers();

        // Add map click event for saving new locations
        this.map.on('click', (e) => this.onMapClick(e));

        // Add map controls
        this.addMapControls();

        console.log('Warehouse map initialized successfully');

        document.addEventListener('click', (event) => {
            const useLocationBtn = event.target.closest('.use-location-btn');
            if (useLocationBtn) {
                const locationId = useLocationBtn.dataset.locationId;
                this.useLocation(locationId);
            }

            const deleteLocationBtn = event.target.closest('.delete-location-btn');
            if (deleteLocationBtn) {
                const locationId = deleteLocationBtn.dataset.locationId;
                this.deleteSavedLocation(locationId);
            }

            const saveLocationBtn = event.target.closest('.save-location-btn');
            if (saveLocationBtn) {
                const lat = saveLocationBtn.dataset.lat;
                const lng = saveLocationBtn.dataset.lng;
                this.saveLocation(lat, lng);
            }

            const toggleSavedLocationsListBtn = event.target.closest('.toggle-saved-locations-list-btn');
            if (toggleSavedLocationsListBtn) {
                this.toggleSavedLocationsList();
            }

            const closeSavedLocationsPanelBtn = event.target.closest('.close-saved-locations-panel-btn');
            if (closeSavedLocationsPanelBtn) {
                const panel = document.getElementById('savedLocationsPanel');
                if(panel) {
                    panel.remove();
                }
            }
        });
    }

    // Add warehouse markers to the map
    addWarehouseMarkers() {
        this.warehouseLocations.forEach(warehouse => {
            const utilizationPercent = Math.round((warehouse.utilization / warehouse.capacity) * 100);

            // Create custom warehouse icon
            const warehouseIcon = L.divIcon({
                className: 'warehouse-marker',
                html: `
                    <div class="warehouse-marker-content">
                        <div class="warehouse-icon">
                            <i class="bi bi-building-fill"></i>
                        </div>
                        <div class="warehouse-label">${warehouse.name}</div>
                    </div>
                `,
                iconSize: [120, 60],
                iconAnchor: [60, 30]
            });

            const marker = L.marker([warehouse.coordinates.lat, warehouse.coordinates.lng], {
                icon: warehouseIcon
            }).addTo(this.map);

            // Create popup content
            const popupContent = `
                <div class="warehouse-popup">
                    <h6><i class="bi bi-building"></i> ${warehouse.name}</h6>
                    <p class="mb-2"><i class="bi bi-geo-alt"></i> ${warehouse.address}</p>
                    <div class="warehouse-stats">
                        <div class="stat-item">
                            <span class="stat-label">Capacity:</span>
                            <span class="stat-value">${warehouse.capacity}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Current:</span>
                            <span class="stat-value">${warehouse.utilization}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Utilization:</span>
                            <span class="stat-value">${utilizationPercent}%</span>
                        </div>
                    </div>
                    <div class="utilization-bar">
                        <div class="utilization-fill" style="width: ${utilizationPercent}%"></div>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            this.markers.push(marker);
        });
    }

    // Add saved location markers to the map
    addSavedLocationMarkers() {
        this.savedLocations.forEach(location => {
            this.addSavedLocationMarker(location);
        });
    }

    // Add a single saved location marker
    addSavedLocationMarker(location) {
        // Create custom saved location icon
        const savedIcon = L.divIcon({
            className: 'saved-location-marker',
            html: `
                <div class="saved-marker-content">
                    <div class="saved-icon">
                        <i class="bi bi-bookmark-fill"></i>
                    </div>
                    <div class="saved-label">${location.name}</div>
                </div>
            `,
            iconSize: [100, 50],
            iconAnchor: [50, 25]
        });

        const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
            icon: savedIcon
        }).addTo(this.map);

        // Create popup content with edit/delete options
        const popupContent = `
            <div class="saved-location-popup">
                <h6><i class="bi bi-bookmark"></i> ${location.name}</h6>
                <p class="mb-2"><i class="bi bi-geo-alt"></i> ${location.address || 'Custom Location'}</p>
                <p class="text-muted small">Saved on: ${new Date(location.dateAdded).toLocaleDateString()}</p>
                <div class="popup-actions">
                    <button class="btn btn-sm btn-primary use-location-btn" data-location-id="${location.id}">
                        <i class="bi bi-cursor"></i> Use Location
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-location-btn" data-location-id="${location.id}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        this.markers.push(marker);
    }

    // Handle map click for saving new locations
    onMapClick(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Show save location modal
        this.showSaveLocationModal(lat, lng);
    }

    // Show modal to save a new location
    showSaveLocationModal(lat, lng) {
        const modalHtml = `
            <div class="modal fade" id="saveLocationModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-bookmark-plus me-2"></i>Save Location
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Location Name</label>
                                <input type="text" class="form-control" id="locationName" placeholder="Enter a name for this location">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description (Optional)</label>
                                <textarea class="form-control" id="locationDescription" rows="2" placeholder="Add a description..."></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Coordinates</label>
                                <div class="input-group">
                                    <span class="input-group-text">Lat:</span>
                                    <input type="text" class="form-control" value="${lat.toFixed(6)}" readonly>
                                    <span class="input-group-text">Lng:</span>
                                    <input type="text" class="form-control" value="${lng.toFixed(6)}" readonly>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary save-location-btn" data-lat="${lat}" data-lng="${lng}">
                                <i class="bi bi-bookmark-plus"></i> Save Location
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('saveLocationModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('saveLocationModal'));
        modal.show();

        // Focus on name input
        setTimeout(() => {
            document.getElementById('locationName').focus();
        }, 500);
    }

    // Save a new location
    saveLocation(lat, lng) {
        const nameInput = document.getElementById('locationName');
        const descriptionInput = document.getElementById('locationDescription');

        const name = nameInput.value.trim();
        if (!name) {
            alert('Please enter a name for this location');
            nameInput.focus();
            return;
        }

        const newLocation = {
            id: 'saved_' + Date.now(),
            name: name,
            description: descriptionInput.value.trim(),
            coordinates: { lat: lat, lng: lng },
            dateAdded: new Date().toISOString(),
            type: 'saved'
        };

        // Add to saved locations
        this.savedLocations.push(newLocation);

        // Save to localStorage
        this.saveSavedLocations();

        // Add marker to map
        this.addSavedLocationMarker(newLocation);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('saveLocationModal'));
        modal.hide();

        // Show success message
        this.showToast(`Location "${name}" saved successfully!`, 'success');

        // Update saved locations list
        this.updateSavedLocationsList();
    }

    // Delete a saved location
    deleteSavedLocation(locationId) {
        if (!confirm('Are you sure you want to delete this saved location?')) {
            return;
        }

        // Remove from saved locations array
        this.savedLocations = this.savedLocations.filter(loc => loc.id !== locationId);

        // Save to localStorage
        this.saveSavedLocations();

        // Remove marker from map
        this.markers = this.markers.filter(marker => {
            if (marker.options.locationId === locationId) {
                this.map.removeLayer(marker);
                return false;
            }
            return true;
        });

        // Refresh map
        this.refreshMap();

        this.showToast('Location deleted successfully!', 'success');
        this.updateSavedLocationsList();
    }

    // Use a saved location (for booking or other purposes)
    useLocation(locationId) {
        const location = this.savedLocations.find(loc => loc.id === locationId);
        if (!location) {
            console.error('Location not found:', locationId);
            return;
        }

        // Center map on the location
        this.map.setView([location.coordinates.lat, location.coordinates.lng], 15);

        // Show success message
        this.showToast(`Centered map on "${location.name}"`, 'info');

        // You can extend this to populate booking forms or other functionality
        console.log('Using location:', location);
    }

    // Add map controls
    addMapControls() {
        // Add custom control for saved locations list
        const savedLocationsControl = L.control({ position: 'topright' });

        savedLocationsControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-control-custom');
            div.innerHTML = `
                <button class="btn btn-primary btn-sm toggle-saved-locations-list-btn" title="Show Saved Locations">
                    <i class="bi bi-list"></i> Saved Locations
                </button>
            `;
            return div;
        };

        savedLocationsControl.addTo(this.map);

        // Add legend control
        const legendControl = L.control({ position: 'bottomright' });

        legendControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <h6>Map Legend</h6>
                <div class="legend-item">
                    <i class="bi bi-building-fill text-primary"></i> Warehouses
                </div>
                <div class="legend-item">
                    <i class="bi bi-bookmark-fill text-success"></i> Saved Locations
                </div>
                <div class="legend-note">
                    <small>Click anywhere on the map to save a new location</small>
                </div>
            `;
            return div;
        };

        legendControl.addTo(this.map);
    }

    // Toggle saved locations list
    toggleSavedLocationsList() {
        let listPanel = document.getElementById('savedLocationsPanel');

        if (listPanel) {
            listPanel.remove();
            return;
        }

        const panelHtml = `
            <div id="savedLocationsPanel" class="saved-locations-panel">
                <div class="panel-header">
                    <h6><i class="bi bi-bookmark"></i> Saved Locations</h6>
                    <button class="btn-close close-saved-locations-panel-btn"></button>
                </div>
                <div class="panel-body">
                    <div id="savedLocationsList"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHtml);
        this.updateSavedLocationsList();
    }

    // Update saved locations list
    updateSavedLocationsList() {
        const listContainer = document.getElementById('savedLocationsList');
        if (!listContainer) return;

        if (this.savedLocations.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-bookmark" style="font-size: 2rem; opacity: 0.3;"></i>
                    <p class="mt-2 mb-0">No saved locations yet</p>
                    <small>Click on the map to save locations</small>
                </div>
            `;
            return;
        }

        const listHtml = this.savedLocations.map(location => `
            <div class="saved-location-item">
                <div class="location-info">
                    <h6 class="location-name">${location.name}</h6>
                    <p class="location-coords">
                        ${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lng.toFixed(4)}
                    </p>
                    ${location.description ? `<p class="location-desc">${location.description}</p>` : ''}
                </div>
                <div class="location-actions">
                    <button class="btn btn-sm btn-outline-primary use-location-btn" data-location-id="${location.id}" title="Go to location">
                        <i class="bi bi-cursor"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-location-btn" data-location-id="${location.id}" title="Delete location">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        listContainer.innerHTML = listHtml;
    }

    // Refresh the entire map
    refreshMap() {
        // Clear all markers
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];

        // Re-add all markers
        this.addWarehouseMarkers();
        this.addSavedLocationMarkers();
    }

    // Load saved locations from localStorage
    loadSavedLocations() {
        try {
            const saved = localStorage.getItem('mci-saved-locations');
            if (saved) {
                this.savedLocations = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading saved locations:', error);
            this.savedLocations = [];
        }
    }

    // Save locations to localStorage
    saveSavedLocations() {
        try {
            localStorage.setItem('mci-saved-locations', JSON.stringify(this.savedLocations));
        } catch (error) {
            console.error('Error saving locations:', error);
        }
    }

    // Show toast notification
    showToast(message, type = 'success') {
        // Create toast element
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        // Add to toast container or create one
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        // Initialize and show toast
        const toastElement = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remove toast element after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
}

// Global warehouse manager instance
let warehouseManager = null;

// Make WarehouseMapManager available globally
window.WarehouseMapManager = WarehouseMapManager;

// Global function to load warehouses (called from main.js)
window.loadWarehouses = function () {
    console.log('Loading warehouses...');

    if (!warehouseManager) {
        warehouseManager = new WarehouseMapManager();
    }

    // Small delay to ensure DOM is ready
    setTimeout(() => {
        warehouseManager.initializeMap();
    }, 100);
};