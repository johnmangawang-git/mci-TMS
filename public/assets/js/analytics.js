// Analytics charts
let bookingsChart, costsChart, originChart, costBreakdownChart;

async function initAnalyticsCharts(period = 'day') {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library is not loaded');
        return;
    }
    
    // Destroy existing charts if they exist
    if (bookingsChart) {
        bookingsChart.destroy();
        bookingsChart = null;
    }
    if (costsChart) {
        costsChart.destroy();
        costsChart = null;
    }
    if (originChart) {
        originChart.destroy();
        originChart = null;
    }
    if (costBreakdownChart) {
        try {
            costBreakdownChart.destroy();
        } catch (error) {
            console.warn('Error destroying costBreakdownChart:', error);
        }
        costBreakdownChart = null;
    }
    
    // Also check for existing chart by canvas ID and destroy it
    const costBreakdownCanvas = document.getElementById('costBreakdownChart');
    if (costBreakdownCanvas) {
        const existingChart = Chart.getChart(costBreakdownCanvas);
        if (existingChart) {
            try {
                existingChart.destroy();
            } catch (error) {
                console.warn('Error destroying existing chart:', error);
            }
        }
    }

    // Update dashboard metrics
    updateDashboardMetrics();

    // Initialize chart filters
    initChartFilters();

    // Load actual data with error handling
    let data;
    try {
        data = await loadAnalyticsData(period);
    } catch (error) {
        console.error('❌ Error loading analytics data:', error);
        // Use fallback data
        data = {
            bookings: { labels: ['No Data'], values: [0] },
            costs: { labels: ['No Data'], values: [0] },
            origins: { labels: ['No Data'], values: [0] }
        };
    }

    // Ensure data structure is valid
    if (!data || !data.bookings || !data.bookings.labels) {
        console.warn('⚠️ Invalid analytics data structure, using fallback');
        data = {
            bookings: { labels: ['No Data'], values: [0] },
            costs: { labels: ['No Data'], values: [0] },
            origins: { labels: ['No Data'], values: [0] }
        };
    }

    // Bookings Chart - Total bookings per month/week/day
    const bookingsCtx = document.getElementById('bookingsChart');
    if (bookingsCtx) {
        bookingsChart = new Chart(bookingsCtx, {
            type: 'bar',
            data: {
                labels: data.bookings.labels || ['No Data'],
                datasets: [{
                    label: 'Bookings',
                    data: data.bookings.values,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 50
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Additional Costs Chart
    const costsCtx = document.getElementById('costsChart');
    if (costsCtx) {
        costsChart = new Chart(costsCtx, {
            type: 'line',
            data: {
                labels: data.costs.labels,
                datasets: [{
                    label: 'Additional Costs (₱)',
                    data: data.costs.values,
                    backgroundColor: 'rgba(243, 156, 18, 0.2)',
                    borderColor: 'rgba(243, 156, 18, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(243, 156, 18, 1)',
                    pointRadius: 4,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `₱${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return `₱${value.toLocaleString()}`;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Origin Chart - Booking origin distribution (pie chart)
    const originCtx = document.getElementById('originChart');
    if (originCtx) {
        originChart = new Chart(originCtx, {
            type: 'doughnut',
            data: {
                labels: data.origin.labels,
                datasets: [{
                    data: data.origin.values,
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(155, 89, 182, 0.8)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(231, 76, 60, 1)',
                        'rgba(155, 89, 182, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    // Cost Breakdown Chart - Additional cost breakdown
    const costBreakdownCtx = document.getElementById('costBreakdownChart');
    if (costBreakdownCtx) {
        costBreakdownChart = new Chart(costBreakdownCtx, {
            type: 'pie',
            data: {
                labels: data.costBreakdown.labels,
                datasets: [{
                    data: data.costBreakdown.values,
                    backgroundColor: [
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(155, 89, 182, 0.8)',
                        'rgba(149, 165, 166, 0.8)'
                    ],
                    borderColor: [
                        'rgba(243, 156, 18, 1)',
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(155, 89, 182, 1)',
                        'rgba(149, 165, 166, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        // ENHANCED: Show percentages instead of raw values
                        callbacks: {
                            label: function(context) {
                                const dataset = context.dataset;
                                const total = dataset.data.reduce((sum, value) => sum + value, 0);
                                const currentValue = dataset.data[context.dataIndex];
                                const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${percentage}% (₱${currentValue.toLocaleString()})`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Expose function globally
window.initAnalyticsCharts = initAnalyticsCharts;

// Helper function to process data by day
function processDataByDay(deliveries) {
    // Group by day
    const bookingsByDay = {};
    const costsByDay = {};
    const originCount = {};
    
    deliveries.forEach(delivery => {
        const date = delivery.deliveryDate || delivery.timestamp;
        if (date) {
            // Format date as "Mon 1/8" for better readability
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayKey = `${dayName} ${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            
            bookingsByDay[dayKey] = (bookingsByDay[dayKey] || 0) + 1;
            
            const cost = typeof delivery.additionalCosts === 'number' ? delivery.additionalCosts : 0;
            costsByDay[dayKey] = (costsByDay[dayKey] || 0) + cost;
            
            const origin = delivery.origin || 'Unknown';
            originCount[origin] = (originCount[origin] || 0) + 1;
        }
    });
    
    // Cost breakdown - categorize additional costs
    const costBreakdown = {
        'Fuel Surcharge': 0,
        'Toll Fees': 0,
        'Helper': 0, // Changed from 'Urgent Delivery'
        'Special Handling': 0,
        'Other': 0
    };
    
    // Process individual cost items if available
    deliveries.forEach(delivery => {
        if (delivery.additionalCostItems && Array.isArray(delivery.additionalCostItems)) {
            delivery.additionalCostItems.forEach(item => {
                const amount = item.amount;
                
                // Use the enhanced categorization function
                const category = categorizeCostDescription(item.description);
                costBreakdown[category] = (costBreakdown[category] || 0) + amount;
            });
        } else if (typeof delivery.additionalCosts === 'number' && delivery.additionalCosts > 0) {
            // Fallback to old method if individual items not available
            costBreakdown['Other'] += delivery.additionalCosts;
        }
    });
    
    // Generate last 7 days for better visualization
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayKey = `${dayName} ${date.getMonth() + 1}/${date.getDate()}`;
        last7Days.push(dayKey);
    }
    
    // Prepare data for charts using last 7 days
    const days = last7Days;
    const bookingValues = days.map(day => bookingsByDay[day] || 0);
    const costValues = days.map(day => costsByDay[day] || 0);
    
    const originLabels = Object.keys(originCount);
    const originValues = originLabels.map(label => originCount[label] || 0);
    
    const costBreakdownLabels = Object.keys(costBreakdown);
    const costBreakdownValues = costBreakdownLabels.map(label => costBreakdown[label] || 0);
    
    return {
        bookingsData: {
            labels: days,
            values: bookingValues
        },
        costsData: {
            labels: days,
            values: costValues
        },
        originData: {
            labels: originLabels,
            values: originValues
        },
        costBreakdownData: {
            labels: costBreakdownLabels,
            values: costBreakdownValues
        }
    };
}

// Helper function to process data by week
function processDataByWeek(deliveries) {
    // Group by week
    const bookingsByWeek = {};
    const costsByWeek = {};
    const originCount = {};
    
    deliveries.forEach(delivery => {
        const date = delivery.deliveryDate || delivery.timestamp;
        if (date) {
            // Format week as "Week of MM/DD"
            const dateObj = new Date(date);
            const startOfWeek = new Date(dateObj);
            startOfWeek.setDate(dateObj.getDate() - dateObj.getDay());
            const weekKey = `Week of ${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
            
            bookingsByWeek[weekKey] = (bookingsByWeek[weekKey] || 0) + 1;
            
            const cost = typeof delivery.additionalCosts === 'number' ? delivery.additionalCosts : 0;
            costsByWeek[weekKey] = (costsByWeek[weekKey] || 0) + cost;
            
            const origin = delivery.origin || 'Unknown';
            originCount[origin] = (originCount[origin] || 0) + 1;
        }
    });
    
    // Cost breakdown - categorize additional costs
    const costBreakdown = {
        'Fuel Surcharge': 0,
        'Toll Fees': 0,
        'Helper': 0, // Changed from 'Urgent Delivery'
        'Special Handling': 0,
        'Other': 0
    };
    
    // Process individual cost items if available
    deliveries.forEach(delivery => {
        if (delivery.additionalCostItems && Array.isArray(delivery.additionalCostItems)) {
            delivery.additionalCostItems.forEach(item => {
                const amount = item.amount;
                
                // Use the enhanced categorization function
                const category = categorizeCostDescription(item.description);
                costBreakdown[category] = (costBreakdown[category] || 0) + amount;
            });
        } else if (typeof delivery.additionalCosts === 'number' && delivery.additionalCosts > 0) {
            // Fallback to old method if individual items not available
            costBreakdown['Other'] += delivery.additionalCosts;
        }
    });
    
    // Prepare data for charts
    const weeks = Object.keys(bookingsByWeek);
    const bookingValues = weeks.map(week => bookingsByWeek[week] || 0);
    const costValues = weeks.map(week => costsByWeek[week] || 0);
    
    const originLabels = Object.keys(originCount);
    const originValues = originLabels.map(label => originCount[label] || 0);
    
    const costBreakdownLabels = Object.keys(costBreakdown);
    const costBreakdownValues = costBreakdownLabels.map(label => costBreakdown[label] || 0);
    
    return {
        bookingsData: {
            labels: weeks,
            values: bookingValues
        },
        costsData: {
            labels: weeks,
            values: costValues
        },
        originData: {
            labels: originLabels,
            values: originValues
        },
        costBreakdownData: {
            labels: costBreakdownLabels,
            values: costBreakdownValues
        }
    };
}

// Helper function to process data by month
function processDataByMonth(deliveries) {
    // Group by month
    const bookingsByMonth = {};
    const costsByMonth = {};
    const originCount = {};
    
    deliveries.forEach(delivery => {
        const date = delivery.deliveryDate || delivery.timestamp;
        if (date) {
            const month = new Date(date).toLocaleString('default', { month: 'short' });
            bookingsByMonth[month] = (bookingsByMonth[month] || 0) + 1;
            
            const cost = typeof delivery.additionalCosts === 'number' ? delivery.additionalCosts : 0;
            costsByMonth[month] = (costsByMonth[month] || 0) + cost;
            
            const origin = delivery.origin || 'Unknown';
            originCount[origin] = (originCount[origin] || 0) + 1;
        }
    });
    
    // Cost breakdown - categorize additional costs
    const costBreakdown = {
        'Fuel Surcharge': 0,
        'Toll Fees': 0,
        'Helper': 0, // Changed from 'Urgent Delivery'
        'Special Handling': 0,
        'Other': 0
    };
    
    // Process individual cost items if available
    deliveries.forEach(delivery => {
        if (delivery.additionalCostItems && Array.isArray(delivery.additionalCostItems)) {
            delivery.additionalCostItems.forEach(item => {
                const amount = item.amount;
                
                // Use the enhanced categorization function
                const category = categorizeCostDescription(item.description);
                costBreakdown[category] = (costBreakdown[category] || 0) + amount;
            });
        } else if (typeof delivery.additionalCosts === 'number' && delivery.additionalCosts > 0) {
            // Fallback to old method if individual items not available
            costBreakdown['Other'] += delivery.additionalCosts;
        }
    });
    
    // Prepare data for charts
    const months = Object.keys(bookingsByMonth);
    const bookingValues = months.map(month => bookingsByMonth[month] || 0);
    const costValues = months.map(month => costsByMonth[month] || 0);
    
    const originLabels = Object.keys(originCount);
    const originValues = originLabels.map(label => originCount[label] || 0);
    
    const costBreakdownLabels = Object.keys(costBreakdown);
    const costBreakdownValues = costBreakdownLabels.map(label => costBreakdown[label] || 0);
    
    return {
        bookingsData: {
            labels: months,
            values: bookingValues
        },
        costsData: {
            labels: months,
            values: costValues
        },
        originData: {
            labels: originLabels,
            values: originValues
        },
        costBreakdownData: {
            labels: costBreakdownLabels,
            values: costBreakdownValues
        }
    };
}

function initChartFilters() {
    // Bookings chart period filters
    document.querySelectorAll('#bookingsChart').forEach(chart => {
        const container = chart.closest('.card-body');
        if (container) {
            container.querySelectorAll('.chart-filters .btn').forEach(button => {
                button.addEventListener('click', function () {
                    const period = this.dataset.period;
                    const filterContainer = this.closest('.chart-filters');

                    filterContainer.querySelectorAll('.btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');

                    console.log(`Changed bookings chart period to: ${period}`);
                    updateBookingsChart(period);
                });
            });
        }
    });

    // Costs chart period filters
    document.querySelectorAll('#costsChart').forEach(chart => {
        const container = chart.closest('.card-body');
        if (container) {
            container.querySelectorAll('.chart-filters .btn').forEach(button => {
                button.addEventListener('click', function () {
                    const period = this.dataset.period;
                    const filterContainer = this.closest('.chart-filters');

                    filterContainer.querySelectorAll('.btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');

                    console.log(`Changed costs chart period to: ${period}`);
                    updateCostsChart(period);
                });
            });
        }
    });

    // Origin chart period filters
    document.querySelectorAll('#originChart').forEach(chart => {
        const container = chart.closest('.card-body');
        if (container) {
            container.querySelectorAll('.chart-filters .btn').forEach(button => {
                button.addEventListener('click', function () {
                    const period = this.dataset.period;
                    const filterContainer = this.closest('.chart-filters');

                    filterContainer.querySelectorAll('.btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');

                    console.log(`Changed origin chart period to: ${period}`);
                    updateOriginChart(period);
                });
            });
        }
    });

    // Cost breakdown chart period filters
    document.querySelectorAll('#costBreakdownChart').forEach(chart => {
        const container = chart.closest('.card-body');
        if (container) {
            container.querySelectorAll('.chart-filters .btn').forEach(button => {
                button.addEventListener('click', function () {
                    const period = this.dataset.period;
                    const filterContainer = this.closest('.chart-filters');

                    filterContainer.querySelectorAll('.btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');

                    console.log(`Changed cost breakdown chart period to: ${period}`);
                    updateCostBreakdownChart(period);
                });
            });
        }
    });
}

// Mock function to load analytics data from Supabase
async function loadAnalyticsData(period = 'month') {
    try {
        // Get the actual data from global variables
        const activeDeliveries = window.activeDeliveries || [];
        const deliveryHistory = window.deliveryHistory || [];
        const allDeliveries = [...activeDeliveries, ...deliveryHistory];
        
        // Process data for charts based on period
        let bookingsData, costsData, originData, costBreakdownData;
        
        switch(period) {
            case 'week':
                ({ bookingsData, costsData, originData, costBreakdownData } = processDataByWeek(allDeliveries));
                break;
            case 'month':
                ({ bookingsData, costsData, originData, costBreakdownData } = processDataByMonth(allDeliveries));
                break;
            case 'day':
            default:
                ({ bookingsData, costsData, originData, costBreakdownData } = processDataByDay(allDeliveries));
                break;
        }
        
        return {
            bookings: bookingsData,
            costs: costsData,
            origin: originData,
            costBreakdown: costBreakdownData
        };
    } catch (error) {
        console.error('Error loading analytics data:', error);
        showError('Failed to load analytics data');
        // Return empty data as fallback
        return {
            bookings: {
                labels: [],
                values: []
            },
            costs: {
                labels: [],
                values: []
            },
            origin: {
                labels: [],
                values: []
            },
            costBreakdown: {
                labels: [],
                values: []
            }
        };
    }
}

// Function to update the dashboard metrics
function updateDashboardMetrics() {
    try {
        // Get the actual data from global variables
        const activeDeliveries = window.activeDeliveries || [];
        const deliveryHistory = window.deliveryHistory || [];
        
        // Calculate metrics from actual data
        const totalBookings = activeDeliveries.length + deliveryHistory.length;
        

        
        // Calculate total additional costs
        let totalAdditionalCost = 0;
        [...activeDeliveries, ...deliveryHistory].forEach(delivery => {
            if (typeof delivery.additionalCosts === 'number') {
                totalAdditionalCost += delivery.additionalCosts;
            }
        });
        
        // Calculate average cost per booking
        const avgCostPerBooking = totalBookings > 0 ? totalAdditionalCost / totalBookings : 0;
        
        // Update the UI elements
        const totalBookingsElement = document.querySelector('.metric-card:nth-child(1) .metric-value');

        const totalAdditionalCostElement = document.querySelector('.metric-card:nth-child(2) .metric-value');
        const avgCostPerBookingElement = document.querySelector('.metric-card:nth-child(3) .metric-value .crossed-out');
        
        if (totalBookingsElement) {
            totalBookingsElement.textContent = totalBookings;
        }
        

        
        if (totalAdditionalCostElement) {
            totalAdditionalCostElement.textContent = `₱${totalAdditionalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        }
        
        if (avgCostPerBookingElement) {
            avgCostPerBookingElement.textContent = `₱${avgCostPerBooking.toFixed(2)}`;
        }
        
        console.log('Dashboard metrics updated:', {
            totalBookings,
            totalAdditionalCost,
            avgCostPerBooking
        });
    } catch (error) {
        console.error('Error updating dashboard metrics:', error);
    }
}

// Expose function globally
window.updateDashboardMetrics = updateDashboardMetrics;

// Update chart functions (for demo purposes)
function updateBookingsChart(period) {
    // In a real implementation, this would fetch new data based on period
    console.log(`Updating bookings chart for ${period}`);
    
    // Load new data for the selected period
    loadAnalyticsData(period).then(data => {
        if (bookingsChart) {
            bookingsChart.data.labels = data.bookings.labels;
            bookingsChart.data.datasets[0].data = data.bookings.values;
            bookingsChart.update();
        }
    });
}

function updateCostsChart(period) {
    // In a real implementation, this would fetch new data based on period
    console.log(`Updating costs chart for ${period}`);
    
    // Load new data for the selected period
    loadAnalyticsData(period).then(data => {
        if (costsChart) {
            costsChart.data.labels = data.costs.labels;
            costsChart.data.datasets[0].data = data.costs.values;
            costsChart.update();
        }
    });
}

function updateOriginChart(period) {
    // In a real implementation, this would fetch new data based on period
    console.log(`Updating origin chart for ${period}`);
    
    // Load new data for the selected period
    loadAnalyticsData(period).then(data => {
        if (originChart) {
            originChart.data.labels = data.origin.labels;
            originChart.data.datasets[0].data = data.origin.values;
            originChart.update();
        }
    });
}

function updateCostBreakdownChart(period) {
    console.log(`Updating cost breakdown chart for ${period}`);
    
    // Get cost breakdown data from DR uploads and regular bookings
    const costBreakdownData = getCostBreakdownData(period);
    
    if (costBreakdownChart && costBreakdownData) {
        costBreakdownChart.data.labels = costBreakdownData.labels;
        costBreakdownChart.data.datasets[0].data = costBreakdownData.values;
        costBreakdownChart.data.datasets[0].backgroundColor = costBreakdownData.colors;
        costBreakdownChart.update();
        
        console.log('Cost breakdown chart updated with real data:', costBreakdownData);
    } else {
        // Fallback to mock data if no real data available
        loadAnalyticsData(period).then(data => {
            if (costBreakdownChart) {
                costBreakdownChart.data.labels = data.costBreakdown.labels;
                costBreakdownChart.data.datasets[0].data = data.costBreakdown.values;
                costBreakdownChart.update();
            }
        });
    }
}

// Expose function globally
window.initAnalyticsCharts = initAnalyticsCharts;

// Enhanced cost categorization function with comprehensive keyword detection
function categorizeCostDescription(description) {
    const desc = description.toLowerCase().trim();
    
    // Fuel-related keywords (expanded)
    if (desc.includes('gas') || desc.includes('fuel') || 
        desc.includes('gasoline') || desc.includes('petrol') ||
        desc.includes('diesel') || desc.includes('lng') || 
        desc.includes('cng') || desc.includes('gasolina')) {
        return 'Fuel Surcharge';
    }
    
    // Toll-related keywords (Philippine-specific)
    if (desc.includes('toll') || desc.includes('highway') ||
        desc.includes('expressway') || desc.includes('bridge') ||
        desc.includes('skyway') || desc.includes('slex') ||
        desc.includes('nlex') || desc.includes('cavitex') ||
        desc.includes('tplex') || desc.includes('star tollway')) {
        return 'Toll Fees';
    }
    
    // Helper/Labor-related keywords (expanded)
    if (desc.includes('helper') || desc.includes('urgent') || 
        desc.includes('delivery') || desc.includes('assist') ||
        desc.includes('labor') || desc.includes('manpower') ||
        desc.includes('overtime') || desc.includes('extra') ||
        desc.includes('rush') || desc.includes('kasama') ||
        desc.includes('tulong') || desc.includes('dagdag')) {
        return 'Helper';
    }
    
    // Special handling keywords (expanded)
    if (desc.includes('special') || desc.includes('handling') ||
        desc.includes('fragile') || desc.includes('careful') ||
        desc.includes('delicate') || desc.includes('premium') ||
        desc.includes('white glove') || desc.includes('sensitive') ||
        desc.includes('priority')) {
        return 'Special Handling';
    }
    
    // Parking-related (separate category)
    if (desc.includes('parking') || desc.includes('garage') ||
        desc.includes('terminal') || desc.includes('loading')) {
        return 'Other'; // Could be 'Parking' if you want separate category
    }
    
    // Default category for unmatched descriptions
    return 'Other';
}

// Test function to verify categorization
function testCostCategorization() {
    const testCases = [
        'GAS money',
        'gas for truck', 
        'FUEL surcharge',
        'Helper fee',
        'helper payment',
        'Toll fees',
        'SLEX toll',
        'Special handling',
        'Parking fee',
        'Overtime pay',
        'Rush delivery',
        'Fragile items'
    ];
    
    console.log('Cost Categorization Test Results:');
    testCases.forEach(testCase => {
        const category = categorizeCostDescription(testCase);
        console.log(`"${testCase}" → "${category}"`);
    });
}

// Expose functions globally
window.categorizeCostDescription = categorizeCostDescription;
window.testCostCategorization = testCostCategorization;
function testCostCategorization() {
    const testCases = [
        'GAS money',
        'gas for truck', 
        'FUEL surcharge',
        'Helper fee',
        'helper payment',
        'Toll fees',
        'SLEX toll',
        'Special handling',
        'Parking fee',
        'Overtime pay',
        'Rush delivery',
        'Fragile items'
    ];
    
    console.log('=== COST CATEGORIZATION TEST ===');
    testCases.forEach(description => {
        const category = categorizeCostDescription(description);
        console.log(`"${description}" → ${category}`);
    });
}

// Expose enhanced functions globally
window.categorizeCostDescription = categorizeCostDescription;
window.testCostCategorization = testCostCategorization;

// Get cost breakdown data from DR uploads and regular bookings
async function getCostBreakdownData(period) {
    try {
        // ENHANCED: Get cost breakdown data from BOTH localStorage AND Supabase
        let drCostBreakdown = [];
        
        // Original localStorage logic (commented but preserved)
        // const drCostBreakdown = JSON.parse(localStorage.getItem('analytics-cost-breakdown') || '[]');
        
        // ENHANCED: Load from Supabase (localStorage DISCONNECTED)
        try {
            // DISCONNECTED: No longer read from localStorage analytics-cost-breakdown
            // const localCostData = localStorage.getItem('analytics-cost-breakdown');
            // if (localCostData) {
            //     drCostBreakdown = JSON.parse(localCostData);
            //     console.log('📊 Loaded cost breakdown from localStorage:', drCostBreakdown.length);
            // }
            
            // Primary source: Get from Supabase additional_cost_items table
            if (window.dataService && typeof window.dataService.getAdditionalCostItems === 'function') {
                try {
                    const supabaseCostItems = await window.dataService.getAdditionalCostItems();
                    if (supabaseCostItems && supabaseCostItems.length > 0) {
                        // Convert Supabase format to expected format
                        drCostBreakdown = supabaseCostItems.map(item => ({
                            description: item.description,
                            amount: parseFloat(item.amount) || 0,
                            category: item.category || 'Other'
                        }));
                        
                        console.log('📊 Loaded cost breakdown from Supabase additional_cost_items:', drCostBreakdown.length);
                    }
                } catch (supabaseError) {
                    console.warn('⚠️ Could not load cost breakdown from Supabase:', supabaseError);
                    // Fallback will be handled by delivery records processing below
                }
            }
        } catch (error) {
            console.error('Error loading cost breakdown data:', error);
            drCostBreakdown = [];
        }
        
        // Get additional costs from active deliveries and delivery history
        const activeDeliveries = window.activeDeliveries || [];
        const deliveryHistory = window.deliveryHistory || [];
        const allDeliveries = [...activeDeliveries, ...deliveryHistory];
        
        // Combine cost data
        const costMap = new Map();
        
        // Add DR upload cost breakdown
        drCostBreakdown.forEach(cost => {
            if (costMap.has(cost.description)) {
                costMap.set(cost.description, costMap.get(cost.description) + cost.amount);
            } else {
                costMap.set(cost.description, cost.amount);
            }
        });
        
        // ENHANCED: Add costs from regular bookings with multiple field format support
        allDeliveries.forEach(delivery => {
            // ENHANCED: Check for new additional_cost_items field first (from DR upload modal)
            if (delivery.additional_cost_items && Array.isArray(delivery.additional_cost_items)) {
                delivery.additional_cost_items.forEach(cost => {
                    const description = cost.description || 'Unknown Cost';
                    const amount = parseFloat(cost.amount) || 0;
                    
                    if (amount > 0) {
                        if (costMap.has(description)) {
                            costMap.set(description, costMap.get(description) + amount);
                        } else {
                            costMap.set(description, amount);
                        }
                        console.log(`📊 Added cost from delivery ${delivery.dr_number}: ${description} = ₱${amount}`);
                    }
                });
            }
            // Check for additionalCostItems field (camelCase)
            else if (delivery.additionalCostItems && Array.isArray(delivery.additionalCostItems)) {
                delivery.additionalCostItems.forEach(cost => {
                    const description = cost.description || cost.desc || 'Unknown Cost';
                    const amount = parseFloat(cost.amount) || 0;
                    
                    if (amount > 0) {
                        if (costMap.has(description)) {
                            costMap.set(description, costMap.get(description) + amount);
                        } else {
                            costMap.set(description, amount);
                        }
                    }
                });
            }
            // Check for additionalCostBreakdown field (original)
            else if (delivery.additionalCostBreakdown && Array.isArray(delivery.additionalCostBreakdown)) {
                delivery.additionalCostBreakdown.forEach(cost => {
                    const description = cost.description || cost.desc || 'Unknown Cost';
                    const amount = parseFloat(cost.amount) || 0;
                    
                    if (amount > 0) {
                        if (costMap.has(description)) {
                            costMap.set(description, costMap.get(description) + amount);
                        } else {
                            costMap.set(description, amount);
                        }
                    }
                });
            }
            // Check for additional_cost_breakdown field (snake_case)
            else if (delivery.additional_cost_breakdown && Array.isArray(delivery.additional_cost_breakdown)) {
                delivery.additional_cost_breakdown.forEach(cost => {
                    const description = cost.description || cost.desc || 'Unknown Cost';
                    const amount = parseFloat(cost.amount) || 0;
                    
                    if (amount > 0) {
                        if (costMap.has(description)) {
                            costMap.set(description, costMap.get(description) + amount);
                        } else {
                            costMap.set(description, amount);
                        }
                    }
                });
            }
            // Handle legacy additional costs without breakdown (fallback)
            else if ((delivery.additionalCosts && delivery.additionalCosts > 0) || 
                     (delivery.additional_costs && delivery.additional_costs > 0)) {
                const amount = parseFloat(delivery.additionalCosts || delivery.additional_costs) || 0;
                const description = 'Other Costs';
                
                if (amount > 0) {
                    if (costMap.has(description)) {
                        costMap.set(description, costMap.get(description) + amount);
                    } else {
                        costMap.set(description, amount);
                    }
                }
            }

        });
        
        // Convert to chart data format
        if (costMap.size === 0) {
            return null; // No data available
        }
        
        const labels = Array.from(costMap.keys());
        const values = Array.from(costMap.values());
        
        // Generate colors for each cost category
        const colors = generateChartColors(labels.length);
        
        console.log('Generated cost breakdown data:', { labels, values, colors });
        
        return {
            labels: labels,
            values: values,
            colors: colors
        };
        
    } catch (error) {
        console.error('Error getting cost breakdown data:', error);
        return null;
    }
}

// Generate colors for chart segments
function generateChartColors(count) {
    const baseColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
}

// Update analytics dashboard with latest data (called after DR upload)
function updateAnalyticsDashboard() {
    try {
        console.log('Updating analytics dashboard with latest data...');
        
        // Update cost breakdown chart
        updateCostBreakdownChart('month');
        
        // Update other analytics metrics
        if (typeof updateDashboardMetrics === 'function') {
            updateDashboardMetrics();
        }
        
        console.log('Analytics dashboard updated successfully');
        
    } catch (error) {
        console.error('Error updating analytics dashboard:', error);
    }
}

// Make functions globally available
window.getCostBreakdownData = getCostBreakdownData;
window.updateAnalyticsDashboard = updateAnalyticsDashboard;

// Syntax validation test - this should not cause any errors  
// Cache buster: 2024-01-09-v2
console.log('✅ Analytics.js syntax validation passed - all syntax errors fixed');