// js/seo.js

/**
 * Injects dynamic meta tags into the document <head> based on a post object.
 * 
 * @param {Object} post The post data containing seo_title, seo_description, cover_image, slug, etc.
 */
export function generateMetaTags(post) {
    if (!post) return;

    const title = post.seo_title || post.title;
    const description = post.seo_description || post.excerpt || '';
    const url = window.location.origin + '/public/article.html?slug=' + post.slug;
    const image = post.cover_image || '';

    // Standard Meta
    document.title = title + " - Ace Tech Insight";
    setMetaTag('name', 'description', description);

    // OpenGraph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', 'article');

    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // Canonical
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
}

/**
 * Helper to update or create a meta tag.
 */
function setMetaTag(attrName, attrValue, content) {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

/**
 * Injects JSON-LD structured data for Articles.
 */
export function generateJSONLD(post) {
    if (!post) return;

    const jsonld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "image": post.cover_image ? [post.cover_image] : [],
        "datePublished": post.published_at || post.created_at,
        "dateModified": post.updated_at || post.created_at,
        "author": [{
            "@type": "Person",
            "name": post.author_name || "Fortune",
            "url": window.location.origin + "/public/about.html"
        }],
        "description": post.seo_description || post.excerpt,
        "publisher": {
            "@type": "Organization",
            "name": "Ace Tech Insight",
            "logo": {
                "@type": "ImageObject",
                "url": window.location.origin + "/assets/logo.png"
            }
        }
    };

    let script = document.getElementById('json-ld-article');
    if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-article';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonld);
}

/**
 * Generates an XML Sitemap string from an array of published posts.
 */
export function generateSitemap(posts) {
    const urls = posts.map(post => {
        const loc = window.location.origin + '/public/article.html?slug=' + post.slug;
        const lastMod = (post.updated_at || post.created_at || '').split('T')[0];
        
        return `
    <url>
        <loc>${loc}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
    }).join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${window.location.origin}/public/index.html</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${window.location.origin}/public/search.html</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>${window.location.origin}/public/about.html</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>${urls}
</urlset>`;
}

/**
 * Calculates a basic SEO score for a post draft.
 */
export function calculateSEOScore(postTitle, metaDesc, content, focusKeyword) {
    let score = 0;
    const contentLower = content.toLowerCase();
    const keywordLower = (focusKeyword || '').toLowerCase();
    const titleLower = (postTitle || '').toLowerCase();
    const descLower = (metaDesc || '').toLowerCase();

    // Word Count > 1000 (+10)
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 1000) score += 10;

    // At least one H2 (+10)
    if (/<h2.*?>/i.test(content)) score += 10;

    // At least one image (+10)
    if (/<img.*?>/i.test(content)) score += 10;

    // At least one link (+10)
    if (/<a.*?>/i.test(content)) score += 10;

    // Meta limits (+10 each)
    if (postTitle && postTitle.length >= 50 && postTitle.length <= 60) score += 10;
    if (metaDesc && metaDesc.length >= 120 && metaDesc.length <= 160) score += 10;

    if (keywordLower) {
        // Keyword in title (+15)
        if (titleLower.includes(keywordLower)) score += 15;
        
        // Keyword in meta desc (+10)
        if (descLower.includes(keywordLower)) score += 10;

        // Keyword in first paragraph (naive check: first 300 chars) (+10)
        const firstParagraphMatch = contentLower.substring(0, 300).includes(keywordLower);
        if (firstParagraphMatch) score += 10;

        // Density 1-2% (+5)
        const keywordOccurrences = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
        const keywordWords = keywordLower.split(/\s+/).length;
        const density = (keywordOccurrences * keywordWords) / wordCount;
        if (density >= 0.01 && density <= 0.02) score += 5;
    }

    // Cap at 100
    return Math.min(100, score);
}

/**
 * Simple readability checker based on avg sentence length.
 */
export function checkReadability(content) {
    if(!content || content.trim() === '') return "Easy";
    
    // Strip HTML
    const text = content.replace(/<[^>]+>/g, " ");
    
    // Split sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const words = text.split(/\s+/).length;
    
    const avgWordsPerSentence = words / sentences.length;

    if (avgWordsPerSentence < 14) return "Easy";
    if (avgWordsPerSentence <= 20) return "Medium";
    return "Hard";
}
