export async function fetchGoogleTrendsRSS() {
    // Note: Fetching Google Trends directly from browser usually blocked by CORS.
    // We would use an API proxy or serverless function in production.
    // For this prototype, we'll return mock trending data formatted as RSS entries.
    
    return [
        { title: 'OpenAI Sora release date', category: 'Tech' },
        { title: 'Apple Vision Pro update', category: 'Tech' },
        { title: 'Llama 3 local install', category: 'Tech' },
        { title: 'Next-gen solid state battery EV', category: 'Tech' },
        { title: 'Bitcoin halving impact on altcoins', category: 'Finance' }
    ];
}

export function matchKeywordsToTrends(trackedKeywords, trendingTopics) {
    const breakouts = [];

    trackedKeywords.forEach(kwObj => {
        const kw = kwObj.keyword.toLowerCase();
        
        const match = trendingTopics.find(t => t.title.toLowerCase().includes(kw));
        
        if (match) {
            breakouts.push({
                ...kwObj,
                matchedTrend: match.title,
                status: 'breakout'
            });
        }
    });

    return breakouts;
}

export function renderTrendsEmbed(keyword) {
    const encoded = encodeURIComponent(keyword);
    return `
        <iframe 
            width="100%" 
            height="400" 
            src="https://trends.google.com/trends/embed/explore/TIMESERIES?q=${encoded}&hl=en"
            frameborder="0" 
            scrolling="0"
        ></iframe>
    `;
}

// In real app, we would import updateKeyword from api.js and use it directly.
// This file acts as business logic separated from DB api.
