document.addEventListener('DOMContentLoaded', async () => {
    try {
        const metrics = await api.get('/dashboard/metrics');
        
        document.getElementById('metric-products').textContent = metrics.totalProducts || 0;
        document.getElementById('metric-suppliers').textContent = metrics.totalSuppliers || 0;
        document.getElementById('metric-orders').textContent = metrics.totalOrders || 0;
        document.getElementById('metric-lowstock').textContent = metrics.lowStockItems || 0;
        
        if(metrics.lowStockItems > 0) {
            document.getElementById('metric-lowstock').classList.add('text-danger');
            document.getElementById('metric-lowstock').parentElement.classList.add('badge-low-stock');
            notifications.show(`CRITICAL: There are ${metrics.lowStockItems} items with low stock. Check Products page!`, 'warning');
        }
    } catch (error) {
        console.error('Error loading dashboard metrics', error);
    }

    try {
        const chartData = await api.get('/dashboard/charts');
        initCharts(chartData);
    } catch (error) {
        console.error('Error loading charts', error);
    }
});

function initCharts(data) {
    // Global chart settings for dark theme
    Chart.defaults.color = '#9CA3AF';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // 1. Orders Chart (Line)
    const ctxOrders = document.getElementById('ordersChart').getContext('2d');
    
    // Create gradient
    let gradientLine = ctxOrders.createLinearGradient(0, 0, 0, 400);
    gradientLine.addColorStop(0, 'rgba(108, 255, 108, 0.5)');
    gradientLine.addColorStop(1, 'rgba(108, 255, 108, 0.05)');

    new Chart(ctxOrders, {
        type: 'line',
        data: {
            labels: data.recentOrders.labels.length ? data.recentOrders.labels : ['No Data'],
            datasets: [{
                label: 'Units Ordered',
                data: data.recentOrders.data.length ? data.recentOrders.data : [0],
                borderColor: '#6CFF6C',
                backgroundColor: gradientLine,
                borderWidth: 2,
                pointBackgroundColor: '#1A1D23',
                pointBorderColor: '#6CFF6C',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { precision: 0 }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Inventory Chart (Doughnut)
    const ctxInv = document.getElementById('inventoryChart').getContext('2d');
    
    new Chart(ctxInv, {
        type: 'doughnut',
        data: {
            labels: data.inventoryByCategory.labels.length ? data.inventoryByCategory.labels : ['No Data'],
            datasets: [{
                data: data.inventoryByCategory.data.length ? data.inventoryByCategory.data : [1],
                backgroundColor: [
                    '#6CFF6C', // Primary Neon Green
                    '#3B82F6', // Bright Blue
                    '#F59E0B', // Amber
                    '#8B5CF6', // Purple
                    '#EF4444'  // Red
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { 
                        color: '#ffffff', 
                        boxWidth: 16,
                        font: {
                            size: 14 // Increased font size
                        }
                    }
                }
            }
        }
    });
}
