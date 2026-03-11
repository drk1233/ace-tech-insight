// Ace Tech Insight - Public Features
document.addEventListener('DOMContentLoaded', () => {

    // 1. LIGHT/DARK MODE
    // Inject light mode CSS overrides
    const lightModeCSS = `
    html.theme-light body { background-color: #f8f6f4 !important; color: #0f0c0a !important; }
    html.theme-light .bg-ace-dark { background-color: #f8f6f4 !important; }
    html.theme-light .bg-ace-dark\\/95 { background-color: rgba(248, 246, 244, 0.95) !important; }
    html.theme-light .bg-ace-surface { background-color: #ffffff !important; border: 1px solid rgba(0,0,0,0.05) !important; }
    html.theme-light .text-white { color: #0f0c0a !important; }
    html.theme-light .text-ace-muted { color: #5e5a56 !important; }
    html.theme-light .border-white\\/10, html.theme-light .border-white\\/5 { border-color: rgba(0,0,0,0.1) !important; }
    html.theme-light .bg-white\\/5 { background-color: rgba(0,0,0,0.05) !important; }
    html.theme-light .hover\\:text-white:hover { color: #0f0c0a !important; }
    html.theme-light .hover\\:bg-white\\/10:hover { background-color: rgba(0,0,0,0.1) !important; }
    html.theme-light .prose-ace { color: #333333 !important; }
    html.theme-light .prose-ace h2, html.theme-light .prose-ace h3 { color: #000000 !important; }
    html.theme-light .prose-ace pre { background: #f0ebe4 !important; color: #333 !important; }
    html.theme-light .prose-ace code { background: rgba(0,0,0,0.05) !important; }
    html.theme-light .comment-avatar { background: #e0dcd8 !important; color: #5e5a56 !important; }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = lightModeCSS;
    document.head.appendChild(styleEl);

    // Get current theme
    let currentTheme = localStorage.getItem('ace_theme') || 'dark';
    if (currentTheme === 'light') document.documentElement.classList.add('theme-light');

    // Add toggle button to header
    const headerRight = document.querySelector('header .flex.items-center.gap-3');
    if (headerRight) {
        // Only if it doesn't already exist
        if (!document.getElementById('theme-toggle')) {
            const toggleWrapper = document.createElement('div');
            toggleWrapper.innerHTML = `
                <button id="theme-toggle" class="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-ace-muted hover:text-white hover:bg-white/10 transition-colors mx-1" title="Toggle Theme">
                    <svg class="w-4 h-4" id="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </button>
            `;
            const subscribeBtn = document.getElementById('subscribe-btn') || headerRight.querySelector('a[href="/public/index.html"]');
            if (subscribeBtn) {
                headerRight.insertBefore(toggleWrapper.firstElementChild, subscribeBtn);
            } else {
                headerRight.appendChild(toggleWrapper.firstElementChild);
            }
            
            const btn = document.getElementById('theme-toggle');
            const icon = document.getElementById('theme-icon');
            
            const renderIcon = () => {
                if (currentTheme === 'light') {
                    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;
                } else {
                    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;
                }
            };
            
            renderIcon();
            
            btn.addEventListener('click', () => {
                if (currentTheme === 'dark') {
                    currentTheme = 'light';
                    document.documentElement.classList.add('theme-light');
                } else {
                    currentTheme = 'dark';
                    document.documentElement.classList.remove('theme-light');
                }
                localStorage.setItem('ace_theme', currentTheme);
                renderIcon();
            });
        }
    }

    // 2. COOKIE CONSENT
    if (!localStorage.getItem('ace_cookie_consent')) {
        const consentBanner = document.createElement('div');
        consentBanner.id = 'cookie-consent';
        consentBanner.className = 'fixed bottom-0 left-0 right-0 bg-ace-surface border-t border-white/10 p-4 z-[100] transform transition-transform duration-300 translate-y-0';
        consentBanner.innerHTML = `
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p class="text-sm text-ace-muted text-center sm:text-left">
                    We use cookies to improve your experience and deliver personalized content. By continuing, you agree to our <a href="#" class="text-white underline">Cookie Policy</a>.
                </p>
                <div class="flex gap-3 shrink-0">
                    <button class="px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 text-white hover:bg-white/10" id="btn-cookie-reject">Decline</button>
                    <button class="px-4 py-2 rounded-lg text-sm font-semibold bg-ace-accent text-ace-dark hover:bg-ace-accent-hover" id="btn-cookie-accept">Accept All</button>
                </div>
            </div>
        `;
        document.body.appendChild(consentBanner);

        const hideBanner = () => {
            consentBanner.classList.add('translate-y-full');
            setTimeout(() => consentBanner.remove(), 300);
        };

        document.getElementById('btn-cookie-accept').addEventListener('click', () => {
            localStorage.setItem('ace_cookie_consent', 'accepted');
            hideBanner();
        });
        document.getElementById('btn-cookie-reject').addEventListener('click', () => {
            localStorage.setItem('ace_cookie_consent', 'rejected');
            hideBanner();
        });
    }

    // 3. BACK TO TOP
    const bttBtn = document.createElement('button');
    bttBtn.id = 'back-to-top';
    bttBtn.className = 'fixed bottom-6 right-6 w-12 h-12 rounded-full bg-ace-accent text-ace-dark flex items-center justify-center shadow-lg transform transition-all duration-300 translate-y-20 opacity-0 z-50 hover:bg-ace-accent-hover focus:outline-none';
    bttBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>`;
    document.body.appendChild(bttBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            bttBtn.classList.remove('translate-y-20', 'opacity-0');
        } else {
            bttBtn.classList.add('translate-y-20', 'opacity-0');
        }
    });

    bttBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

});
