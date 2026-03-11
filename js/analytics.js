import { trackRead, trackView } from './api.js';

// Load chart.js dynamically or assume it's loaded via CDN in HTML
export function initTracking(postId) {
    if (!postId) return;

    // 1. Track Initial View
    const viewKey = `viewed_${postId}`;
    if (!sessionStorage.getItem(viewKey)) {
        trackView(postId)
            .then(() => sessionStorage.setItem(viewKey, 'true'))
            .catch(err => console.error("Failed to track view", err));
    }

    // 2. Scroll Listener for "Read" (80% scroll depth)
    const readKey = `read_${postId}`;
    if (sessionStorage.getItem(readKey)) return; // Already read in this session

    const scrollHandler = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        if (scrollPercent >= 80) {
            window.removeEventListener('scroll', scrollHandler); // Trigger only once
            trackRead(postId)
                .then(() => sessionStorage.setItem(readKey, 'true'))
                .catch(err => console.error("Failed to track read", err));
        }
    };

    // Throttle scroll event for performance
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                scrollHandler();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

// Ensure Chart is available from CDN: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

export function renderViewsChart(canvasId, labels, dataPoints) {
    if (!window.Chart) return console.warn("Chart.js not loaded");
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Gradient for line chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(246, 139, 30, 0.5)'); // Brand Orange
    gradient.addColorStop(1, 'rgba(246, 139, 30, 0.0)');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Page Views',
                data: dataPoints,
                borderColor: '#f68b1e',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4, // smooth curve
                fill: true,
                pointBackgroundColor: '#1a1612',
                pointBorderColor: '#f68b1e',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(26, 22, 18, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#a09c98',
                    padding: 10,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { color: '#a09c98' }
                },
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#a09c98' }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}

export function renderSubscriberChart(canvasId, labels, dataPoints) {
    if (!window.Chart) return console.warn("Chart.js not loaded");
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Subscribers',
                data: dataPoints,
                borderColor: '#10b981', // green
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false }, // Sparkline style
                x: { display: false }
            }
        }
    });
}

export function renderTopPostsChart(canvasId, labels, dataPoints) {
    if (!window.Chart) return console.warn("Chart.js not loaded");
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Views',
                data: dataPoints,
                backgroundColor: 'rgba(246, 139, 30, 0.8)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Horizontal bar chart
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { display: false }, ticks: { color: '#a09c98' } },
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a09c98' } }
            }
        }
    });
}
