/**
 * Vercel Serverless Function: /api/gemini
 * 
 * Proxies requests to the Google Gemini API.
 * The GEMINI_API_KEY is stored securely as a Vercel Environment Variable
 * and is NEVER sent to the browser.
 * 
 * Expected POST body: { keyword, content }
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API not configured. Add GEMINI_API_KEY to Vercel environment variables.' });
    }

    const { keyword, content } = req.body;

    if (!keyword) {
        return res.status(400).json({ error: 'Missing required field: keyword' });
    }

    const prompt = `Analyze this focus keyword: "${keyword}" and the provided content. 
Return ONLY a valid JSON object with the following structure:
{
  "recommendedWordCount": number,
  "nlpTerms": ["term1", "term2", "term3", "term4", "term5"],
  "competitorTitles": ["title1", "title2", "title3"],
  "peopleAlsoAsk": ["question1", "question2", "question3"]
}

Content:
${content || '(No content provided)'}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
        );

        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: `Gemini API error: ${response.status}` });
        }

        const data = await response.json();
        let resultText = data.candidates[0].content.parts[0].text;
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        return res.status(200).json(JSON.parse(resultText));
    } catch (error) {
        console.error('Gemini API error:', error);
        return res.status(500).json({ error: 'Failed to get Gemini response' });
    }
}
