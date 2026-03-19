/**
 * Vercel Serverless Function: /api/send-email
 * 
 * Proxies requests to the Resend API.
 * The RESEND_API_KEY is stored securely as a Vercel Environment Variable
 * and is NEVER sent to the browser.
 * 
 * Expected POST body: { to, subject, html, from }
 */
module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        return res.status(500).json({ error: 'Email service not configured. Add RESEND_API_KEY to Vercel environment variables.' });
    }

    const { to, subject, html, from } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: from || 'Fortune <newsletter@acetechinsight.com>',
                to: Array.isArray(to) ? to : [to],
                subject,
                html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'Failed to send email' });
        }

        return res.status(200).json({ success: true, id: data.id });
    } catch (error) {
        console.error('Email send error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
