document.addEventListener('DOMContentLoaded', async () => {
    try {
        const chartData = await api.get('/analytics/advanced');
        initAnalyticsCharts(chartData);
    } catch (error) {
        console.error('Error loading analytics', error);
    }
});

function initAnalyticsCharts(data) {
    Chart.defaults.color = '#D1D5DB';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // 1. Revenue Timeline Chart (Line)
    const ctxRev = document.getElementById('revenueChart').getContext('2d');
    
    let gradientLine = ctxRev.createLinearGradient(0, 0, 0, 400);
    gradientLine.addColorStop(0, 'rgba(59, 130, 246, 0.4)'); // Blue gradient
    gradientLine.addColorStop(1, 'rgba(59, 130, 246, 0.01)');

    new Chart(ctxRev, {
        type: 'line',
        data: {
            labels: data.revenueByDate.labels.length ? data.revenueByDate.labels : ['No Data'],
            datasets: [{
                label: 'Gross Revenue (₹)',
                data: data.revenueByDate.data.length ? data.revenueByDate.data : [0],
                borderColor: '#3B82F6', // Blue Border
                backgroundColor: gradientLine,
                borderWidth: 3,
                pointBackgroundColor: '#1A1D23',
                pointBorderColor: '#3B82F6',
                pointBorderWidth: 2,
                pointRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        callback: function(value) { return '₹' + value; }
                    }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Top Products by Volume (Bar Chart)
    const ctxTop = document.getElementById('topProductsChart').getContext('2d');
    
    new Chart(ctxTop, {
        type: 'bar',
        data: {
            labels: data.topProducts.labels.length ? data.topProducts.labels : ['No Data'],
            datasets: [{
                label: 'Units Sold',
                data: data.topProducts.data.length ? data.topProducts.data : [0],
                backgroundColor: [
                    '#6CFF6C', // Green
                    '#3B82F6', // Blue
                    '#F59E0B', // Orange
                    '#8B5CF6', // Purple
                    '#EF4444'  // Red
                ],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 3. Supplier Dependency (Doughnut)
    const ctxSupplier = document.getElementById('supplierShareChart').getContext('2d');
    
    new Chart(ctxSupplier, {
        type: 'doughnut',
        data: {
            labels: data.supplierShare.labels.length ? data.supplierShare.labels : ['No Data'],
            datasets: [{
                data: data.supplierShare.data.length ? data.supplierShare.data : [1],
                backgroundColor: [
                    '#6CFF6C', // Green
                    '#3B82F6', // Blue
                    '#F59E0B', // Orange
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
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#ffffff', boxWidth: 16, font: {size: 14} }
                }
            }
        }
    });
}
