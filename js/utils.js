// Component injection to keep HTML files DRY
export function injectHeader() {
    const headerHTML = `
        <div class="container nav-container">
            <a href="/public/index.html" class="logo">
                <span class="logo-icon">■</span>
                <span>AceTech Insight</span>
            </a>
            
            <nav class="nav-links">
                <a href="/public/category.html?slug=ai">AI</a>
                <a href="/public/category.html?slug=future-tech">Future Tech</a>
                <a href="/public/category.html?slug=software">Software</a>
                <a href="/public/about.html">About</a>
            </nav>

            <div class="flex items-center gap-md">
                <div class="input-group" style="border-radius: 999px; padding: 0 1rem; width: 250px;">
                    <span style="color: var(--text-secondary); margin-right: 0.5rem;">🔍</span>
                    <input type="text" id="global-search" placeholder="Search articles..." 
                           style="padding: 0.5rem 0; font-size: 0.875rem;"
                           onkeypress="if(event.key === 'Enter') window.location.href='/public/search.html?q=' + this.value">
                </div>
                <button class="btn btn-primary" style="border-radius: 999px;" onclick="document.getElementById('newsletter-email').focus()">Subscribe</button>
            </div>
        </div>
    `;

    const headerElement = document.getElementById('site-header');
    if (headerElement) {
        headerElement.innerHTML = headerHTML;
    }
}

export function injectFooter() {
    const footerHTML = `
        <div class="container">
            <div class="grid" style="grid-template-columns: 2fr 1fr 1fr 1fr; gap: var(--space-2xl);">
                <div>
                    <a href="/public/index.html" class="logo" style="margin-bottom: var(--space-md);">
                        <span class="logo-icon">■</span>
                        <span>AceTech Insight</span>
                    </a>
                    <p class="text-secondary text-sm" style="margin-bottom: var(--space-lg); max-width: 300px;">
                        Leading the conversation on the technologies that matter most. We dive deep into AI, hardware, and the future of science.
                    </p>
                    <div class="flex gap-sm">
                        <!-- Socials -->
                        <a href="#" class="btn btn-outline" style="padding: 0.5rem; border-radius: 50%; width: 36px; height: 36px;"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="btn btn-outline" style="padding: 0.5rem; border-radius: 50%; width: 36px; height: 36px;"><i class="fab fa-linkedin-in"></i></a>
                        <a href="#" class="btn btn-outline" style="padding: 0.5rem; border-radius: 50%; width: 36px; height: 36px;"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>

                <div>
                    <h4 style="font-size: 1rem; margin-bottom: var(--space-md);">Categories</h4>
                    <ul class="flex-col gap-sm text-secondary text-sm">
                        <li><a href="/public/category.html?slug=ai">Artificial Intelligence</a></li>
                        <li><a href="/public/category.html?slug=future-tech">Future Tech</a></li>
                        <li><a href="/public/category.html?slug=gadgets">Gadgets</a></li>
                        <li><a href="/public/category.html?slug=cybersecurity">Cybersecurity</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 style="font-size: 1rem; margin-bottom: var(--space-md);">Company</h4>
                    <ul class="flex-col gap-sm text-secondary text-sm">
                        <li><a href="/public/about.html">About Us</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Contact</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>

                <div>
                    <h4 style="font-size: 1rem; margin-bottom: var(--space-md);">Newsletter</h4>
                    <p class="text-secondary text-sm" style="margin-bottom: var(--space-sm);">Get the latest breakthroughs in your inbox.</p>
                    <div class="flex-col gap-sm">
                        <input type="email" id="newsletter-email" placeholder="Your email address" class="input-group" style="width: 100%; border-radius: var(--border-radius-sm); padding: 0.75rem;">
                        <button class="btn btn-primary btn-block" id="newsletter-submit">Subscribe</button>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} AceTech Media Group. All rights reserved.</p>
                <div class="flex gap-md">
                    <a href="#">Terms</a>
                    <a href="#">Privacy</a>
                    <a href="#">Cookies</a>
                </div>
            </div>
        </div>
    `;

    const footerElement = document.getElementById('site-footer');
    if (footerElement) {
        footerElement.innerHTML = footerHTML;

        // Newsletter wireup can happen here or globally
        const btn = document.getElementById('newsletter-submit');
        const input = document.getElementById('newsletter-email');
        if (btn && input) {
            btn.addEventListener('click', async () => {
                const { subscribe } = await import('./api.js');
                if (input.value) {
                    btn.textContent = 'Subscribing...';
                    await subscribe(input.value, '');
                    btn.textContent = 'Subscribed!';
                    input.value = '';
                    setTimeout(() => btn.textContent = 'Subscribe', 2000);
                }
            });
        }
    }
}

// Helpers
export function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
