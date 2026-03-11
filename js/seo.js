import { getPosts } from './api.js';

export function generateMetaTags(post) {
    if (!post) return;
    
    document.title = `${post.seo_title || post.title} - Ace Tech Insight`;
    
    const metaTags = {
        'description': post.seo_description || post.excerpt,
        'og:title': post.seo_title || post.title,
        'og:description': post.seo_description || post.excerpt,
        'og:image': post.og_image || post.cover_image,
        'og:url': window.location.href,
        'twitter:card': 'summary_large_image'
    };

    for (const [name, content] of Object.entries(metaTags)) {
        if (!content) continue;
        let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            if (name.startsWith('og:')) el.setAttribute('property', name);
            else el.setAttribute('name', name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }

    if (post.canonical_url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', post.canonical_url);
    }
}

export function generateJSONLD(post) {
    if (!post) return;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "image": post.cover_image ? [post.cover_image] : [],
        "datePublished": post.published_at,
        "author": [{
            "@type": "Person",
            "name": "Fortune",
            "url": "https://acetechinsight.com/about"
        }],
        "description": post.excerpt
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

export async function generateSitemap() {
    const { data: posts } = await getPosts({ limit: 1000 });
    if (!posts) return '';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    xml += `  <url>\n    <loc>https://acetechinsight.com/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    posts.forEach(post => {
        if (!post.published_at) return;
        xml += `  <url>\n`;
        xml += `    <loc>https://acetechinsight.com/public/article.html?slug=${post.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(post.updated_at || post.published_at).toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
}

export function calculateSEOScore(post, contentHtml) {
    let score = 0;
    const kw = (post.focus_keyword || '').toLowerCase();
    const cleanContext = contentHtml.replace(/<[^>]*>?/gm, '').toLowerCase();

    // Keyword in title
    if (kw && post.title.toLowerCase().includes(kw)) score += 15;
    
    // Keyword in meta description
    if (kw && post.seo_description && post.seo_description.toLowerCase().includes(kw)) score += 10;
    
    // Keyword in first paragraph
    const firstP = cleanContext.substring(0, 500);
    if (kw && firstP.includes(kw)) score += 10;

    // Meta description length
    const descLen = (post.seo_description || '').length;
    if (descLen >= 120 && descLen <= 160) score += 10;

    // Meta title length
    const titleLen = (post.seo_title || post.title || '').length;
    if (titleLen >= 30 && titleLen <= 60) score += 10;

    // Headings
    if (contentHtml.includes('<h2')) score += 10;

    // Internal link
    if (contentHtml.includes('href="/') || contentHtml.includes('href=\'\/')) score += 10;

    // Images
    if (contentHtml.includes('<img')) score += 10;

    // Word count
    const words = cleanContext.split(/\s+/).length;
    if (words > 1000) score += 10;

    // Keyword density ~1-2%
    if (kw && words > 100) {
        const kwOccurrences = (cleanContext.match(new RegExp(kw, 'g')) || []).length;
        const density = (kwOccurrences / words) * 100;
        if (density >= 0.5 && density <= 2.5) score += 5;
    }

    return Math.min(100, score);
}

export function checkReadability(contentHtml) {
    const text = contentHtml.replace(/<[^>]*>?/gm, '');
    const sentences = text.split(/[.!?]+/).length || 1;
    const words = text.split(/\s+/).length || 1;
    const syllables = text.length / 3; // rough estimate

    // Flesch Reading Ease Formula
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

    if (score >= 70) return 'Easy';
    if (score >= 50) return 'Medium';
    return 'Hard';
}
