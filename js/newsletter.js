import { getSubscribers } from './api.js';

/**
 * Sends a broadcast email via the secure /api/send-email serverless function.
 * Keys are stored safely in Vercel Environment Variables, never exposed to the browser.
 */
export async function sendBroadcast(subject, body, recipientType) {
    const { data: subscribers, error } = await getSubscribers();
    if (error || !subscribers) throw new Error("Could not fetch subscribers from database.");

    let targetSubs = subscribers.filter(s => s.status === 'active');
    if (recipientType === 'premium') {
        targetSubs = targetSubs.filter(s => s.premium === true);
    }

    if (targetSubs.length === 0) {
        throw new Error("No active subscribers found for this segment.");
    }

    const emails = targetSubs.map(s => s.email);

    const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: 'Fortune <newsletter@acetechinsight.com>',
            to: emails,
            subject,
            html: body
        })
    });

    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send email");
    }

    return await res.json();
}

export async function sendWelcomeEmail(email, name) {
    await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: 'Fortune <newsletter@acetechinsight.com>',
            to: [email],
            subject: "Welcome to Ace Tech Insight!",
            html: `<p>Hi ${name || 'there'},</p><p>Welcome to Ace Tech Insight. Get ready for the latest in deep tech!</p>`
        })
    });
}

export async function sendTestEmail(subject, body) {
    // For test emails, send to the admin email - update this to your admin address
    const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: 'Fortune <newsletter@acetechinsight.com>',
            to: ['admin@acetechinsight.com'], // Update this to your admin email
            subject: `[TEST] ${subject}`,
            html: body
        })
    });

    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send test email");
    }

    return await res.json();
}
