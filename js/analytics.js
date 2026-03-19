// js/analytics.js
import { supabase } from '/js/supabase.js';

/**
 * Initializes tracking for a single post view.
 * - Increments `views` immediately.
 * - Increments `reads` when user scrolls past 80%.
 * Ensures uniqueness using SessionStorage so reloading doesn't bloat stats.
 *
 * @param {string} postId The UUID of the post being viewed
 */
export async function initTracking(postId) {
    if (!postId) return;

    const sessionKeyView = `viewed_${postId}`;
    const sessionKeyRead = `read_${postId}`;

    // 1. Track View (Immediate)
    if (!sessionStorage.getItem(sessionKeyView)) {
        sessionStorage.setItem(sessionKeyView, 'true');
        
        // Supabase RPC 'increment_views' is best practice to avoid race conditions.
        // Assuming we didn't define an RPC, we fetch current value and +1 (naive approach).
        // Since this is client-side, we do a naive fetch-then-update.
        const { data } = await supabase.from('posts').select('views').eq('id', postId).single();
        if (data) {
            await supabase.from('posts').update({ views: data.views + 1 }).eq('id', postId);
        }
    }

    // 2. Track Read (Scroll > 80%)
    if (!sessionStorage.getItem(sessionKeyRead)) {
        window.addEventListener('scroll', async function scrollTracker() {
            const scrollPercent = (document.documentElement.scrollTop + window.innerHeight) / document.documentElement.scrollHeight;
            
            if (scrollPercent >= 0.8) {
                // User reached 80% of page
                window.removeEventListener('scroll', scrollTracker);
                sessionStorage.setItem(sessionKeyRead, 'true');

                const { data } = await supabase.from('posts').select('reads').eq('id', postId).single();
                if (data) {
                    await supabase.from('posts').update({ reads: data.reads + 1 }).eq('id', postId);
                }
            }
        });
    }
}

/**
 * Chart.js Line Chart for Traffic over 30 Days helper
 */
export function renderViewsChart(ctx, timelineData) {
    if (!window.Chart) return null;

    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = '"Inter", sans-serif';

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 138, 0, 0.5)'); // Brand orange
    gradient.addColorStop(1, 'rgba(255, 138, 0, 0.0)');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: timelineData.labels,
            datasets: [{
                label: 'Page Views',
                data: timelineData.data,
                borderColor: '#ff8a00',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

/**
 * Chart.js Bar Chart for Top Posts helper
 */
export function renderTopPostsChart(ctx, labels, data) {
    if (!window.Chart) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Views',
                data: data,
                backgroundColor: '#ff8a00',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // Horizon bar
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                y: { grid: { display: false } }
            }
        }
    });
}
