/**
 * Vercel Serverless Function: /api/unsplash
 * 
 * Proxies search requests to the Unsplash API.
 * The UNSPLASH_KEY is stored securely as a Vercel Environment Variable
 * and is NEVER sent to the browser.
 * 
 * Expected GET query params: ?query=your+search&page=1&per_page=12
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const UNSPLASH_KEY = process.env.UNSPLASH_KEY;

    if (!UNSPLASH_KEY) {
        return res.status(500).json({ error: 'Unsplash not configured. Add UNSPLASH_KEY to Vercel environment variables.' });
    }

    const { query = 'technology', page = 1, per_page = 12 } = req.query;

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&orientation=landscape`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_KEY}`
                }
            }
        );

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Unsplash API error' });
        }

        const data = await response.json();

        // Return only the fields we need to minimize data transfer
        const results = data.results.map(photo => ({
            id: photo.id,
            thumb: photo.urls.small,
            full: photo.urls.regular,
            alt: photo.alt_description || query,
            photographer: photo.user.name,
            photographer_url: photo.user.links.html,
            download_url: photo.links.download_location
        }));

        return res.status(200).json({ results, total: data.total });
    } catch (error) {
        console.error('Unsplash API error:', error);
        return res.status(500).json({ error: 'Failed to fetch images' });
    }
}
