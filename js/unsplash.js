// Unsplash integration — now uses the secure /api/unsplash serverless proxy.
// The Unsplash API key is NEVER sent to the browser; it lives in Vercel Environment Variables.

let debounceTimer;

export async function searchImages(query) {
    const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}&per_page=12`);
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch images from Unsplash");
    }
    
    const data = await res.json();
    return data.results;
}

export function renderImageGrid(images, containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!images || images.length === 0) {
        container.innerHTML = '<div class="text-sm text-secondary p-4 text-center">No images found.</div>';
        return;
    }

    container.innerHTML = images.map(img => `
        <div class="relative group cursor-pointer aspect-video rounded-md overflow-hidden" 
             onclick="window.unsplashSelect('${img.full}', '${img.alt?.replace(/'/g, "")}', '${img.photographer?.replace(/'/g, "")}', '${img.photographer_url}')">
            <img src="${img.thumb}" alt="${img.alt || 'Unsplash Image'}" class="w-full h-full object-cover transition transform group-hover:scale-110">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-2 transition">
                <span class="text-xs text-white">Photo by ${img.photographer}</span>
            </div>
        </div>
    `).join('');

    window.unsplashSelect = (url, alt, authorName, authorLink) => {
        if (onSelect) onSelect(url, alt, `Photo by <a href="${authorLink}?utm_source=acetechinsight&utm_medium=referral">${authorName}</a> on <a href="https://unsplash.com/?utm_source=acetechinsight&utm_medium=referral">Unsplash</a>`);
    };
}

export function setupUnsplashModal(modalId, inputId, gridId, onSelectCallback) {
    const modal = document.getElementById(modalId);
    const input = document.getElementById(inputId);
    
    if (!modal || !input) return;

    window.openUnsplashModal = () => {
        modal.style.display = 'flex';
        input.focus();
    };

    window.closeUnsplashModal = () => {
        modal.style.display = 'none';
    };

    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (!query) {
            document.getElementById(gridId).innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(async () => {
            document.getElementById(gridId).innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-orange text-2xl"></i></div>';
            try {
                const images = await searchImages(query);
                renderImageGrid(images, gridId, (url, alt, credit) => {
                    onSelectCallback(url, alt, credit);
                    window.closeUnsplashModal();
                });
            } catch (err) {
                document.getElementById(gridId).innerHTML = `<div class="col-span-full text-center text-red-500 py-4">${err.message}</div>`;
            }
        }, 500); // Debounced 500ms
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            window.closeUnsplashModal();
        }
    });
}
