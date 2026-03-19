/**
 * Vercel Serverless Function: /api/claude
 * 
 * Proxies requests to the Anthropic Claude API.
 * The CLAUDE_API_KEY is stored securely as a Vercel Environment Variable
 * and is NEVER sent to the browser.
 * 
 * Expected POST body: { prompt, content }
 */
module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

    if (!CLAUDE_API_KEY) {
        return res.status(500).json({ error: 'Claude API not configured. Add CLAUDE_API_KEY to Vercel environment variables.' });
    }

    const { prompt, content } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: `${prompt}\n\nContent:\n${content || ''}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
        }

        const data = await response.json();
        return res.status(200).json({ text: data.content[0].text });
    } catch (error) {
        console.error('Claude API error:', error);
        return res.status(500).json({ error: 'Failed to get Claude response' });
    }
}
