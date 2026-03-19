import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://ubtkfudpvgebgdbwymde.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJ... (not needed if we just use env)";
const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    // Fetch all published posts
    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: 'Failed to generate sitemap' });
    }

    const domain = "https://acetechinsight.com";

    const urls = posts.map(post => `
        <url>
            <loc>${domain}/public/article.html?slug=${post.slug}</loc>
            <lastmod>${new Date(post.published_at || new Date()).toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
        </url>
    `).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${domain}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${domain}/public/category.html</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    ${urls}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache 24 hours
    res.status(200).send(sitemap);
}
