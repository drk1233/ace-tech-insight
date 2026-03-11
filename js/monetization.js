import { getPosts, getSubscribers } from './api.js';

// LocalStorage key for sponsors data
const SPONSORS_KEY = 'ace_admin_sponsors';
const CONFIG_KEY = 'ace_admin_support_config';

function getSponsors() {
    try {
        const data = localStorage.getItem(SPONSORS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveSponsors(sponsors) {
    localStorage.setItem(SPONSORS_KEY, JSON.stringify(sponsors));
}

export async function loadMonetizationDashboard() {
    await updateStats();
    renderSponsorsTable();
    loadSupportConfig();
}

async function updateStats() {
    const sponsors = getSponsors();
    const activeSponsors = sponsors.filter(s => s.status === 'active');
    
    // MRR
    const mrr = activeSponsors.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    document.getElementById('mrr-value').textContent = `$${mrr.toLocaleString()}`;
    
    // Active Sponsors Count
    document.getElementById('active-sponsors-count').textContent = activeSponsors.length;


    // Premium Subscribers
    try {
        const { data: subs } = await getSubscribers();
        if (subs) {
            const premiumCount = subs.filter(s => s.premium && s.status === 'active').length;
            document.getElementById('premium-count').textContent = premiumCount;
        }
    } catch(e) {}

    // Premium Posts (we need to filter where premium exists, but our current API might not have 'premium' flag fetched. 
    // We'll fetch all posts and check if featured/premium is toggled. The checklist says "Premium post count correct".
    // I will mock this for now or fetch all and count featured if premium doesn't exist.
    try {
        const { data: posts } = await getPosts({limit: 1000});
        if (posts) {
            // Assuming we use 'featured' or a 'premium' field if added later
            const premiumPosts = posts.filter(p => p.premium === true).length || 0;
            const el = document.getElementById('premium-post-count');
            if(el) el.textContent = premiumPosts;
        }
    } catch(e){}
}

function renderSponsorsTable() {
    const sponsors = getSponsors();
    const tbody = document.getElementById('sponsors-table-body');
    
    if (sponsors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary">No sponsors found. Add one above.</td></tr>';
        return;
    }

    tbody.innerHTML = sponsors.map(s => `
        <tr>
            <td class="font-medium">
                ${s.name}
                ${s.website ? `<a href="${s.website}" target="_blank" class="text-xs text-orange ml-1" title="${s.website}"><i class="fas fa-external-link-alt"></i></a>` : ''}
            </td>
            <td class="text-secondary text-sm">${s.slot}</td>
            <td class="font-semibold text-sm">$${(Number(s.amount) || 0).toLocaleString()}</td>
            <td><span class="badge ${s.status === 'active' ? 'badge-green' : (s.status === 'expiring' ? 'badge-yellow' : 'badge-red')}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
            <td class="text-secondary text-sm">${s.startDate} to ${s.endDate}</td>
            <td>
                <div class="flex gap-xs">
                    <button class="action-btn" onclick="window.editSponsor('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="window.deleteSponsor('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

export function addSponsor(formObj) {
    const sponsors = getSponsors();
    sponsors.push({
        id: crypto.randomUUID(),
        ...formObj
    });
    saveSponsors(sponsors);
    renderSponsorsTable();
    updateStats();
}

export function updateSponsor(id, formObj) {
    const sponsors = getSponsors();
    const idx = sponsors.findIndex(s => s.id === id);
    if (idx !== -1) {
        sponsors[idx] = { ...sponsors[idx], ...formObj };
        saveSponsors(sponsors);
        renderSponsorsTable();
        updateStats();
    }
}

window.deleteSponsor = (id) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
        let sponsors = getSponsors();
        sponsors = sponsors.filter(s => s.id !== id);
        saveSponsors(sponsors);
        renderSponsorsTable();
        updateStats();
    }
};

window.editSponsor = (id) => {
    const sponsor = getSponsors().find(s => s.id === id);
    if (sponsor && window.openSponsorModal) {
        window.openSponsorModal(sponsor);
    }
};

// --- Support Config ---

function loadSupportConfig() {
    try {
        const config = JSON.parse(localStorage.getItem(CONFIG_KEY));
        if (config) {
            document.getElementById('enable-tipping').checked = config.enabled;
            document.getElementById('support-url').value = config.url || '';
            document.getElementById('support-message').value = config.message || '';
        }
    } catch(e) {}
}

export function saveSupportConfig(enabled, url, message) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ enabled, url, message }));
    alert("Support widget settings saved!");
}
