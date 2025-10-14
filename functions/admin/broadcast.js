// Admin broadcast endpoint to email the waitlist
// POST /admin/broadcast
// Auth: Authorization: Bearer <ADMIN_TOKEN>
// Body JSON: { template?: 'day1', subject?, html?, text?, limit?, confirmedOnly?, dryRun? }

export async function onRequestPost({ request, env, waitUntil }) {
  // Auth
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : null;
  if (!token || token !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY missing' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const template = body.template || 'day1';
    const limit = Math.max(0, Math.min(parseInt(body.limit || '0', 10) || 0, 5000));
    const confirmedOnly = body.confirmedOnly !== false; // default true
    const dryRun = !!body.dryRun;

    const db = env.D1 || env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 binding not found' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const where = confirmedOnly ? 'WHERE unsubscribed = 0 AND confirmed = 1' : 'WHERE unsubscribed = 0';
    const lim = limit > 0 ? ` LIMIT ${limit}` : '';
    const { results } = await db.prepare(
      `SELECT email FROM waitlist ${where} ORDER BY created_at DESC${lim}`
    ).all();

    const origin = new URL(request.url);
    const base = env.BASE_URL || `${origin.protocol}//${origin.host}`;
    const fromEmail = env.FROM_EMAIL || 'no-reply@yourdomain.com';
    const fromName = env.FROM_NAME || 'Your App';

    let subject = body.subject || '';
    let html = body.html || '';
    let text = body.text || '';

    if (!subject || !html) {
      if (template === 'day1') {
        const { buildDay1Email } = await import('../lib/campaigns.js');
        const e = buildDay1Email({ baseUrl: base });
        subject = subject || e.subject;
        html = html || e.html;
        text = text || e.text;
      }
    }

    if (!subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing subject/html and unknown template' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const emails = (results || []).map(r => String(r.email || '').toLowerCase()).filter(Boolean);

    if (dryRun) {
      return new Response(JSON.stringify({ count: emails.length, sample: emails.slice(0, 5), subject, preview: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send in background; return quickly
    const sendAll = async () => {
      for (const email of emails) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: [email], subject, html, text })
          });
        } catch (e) {
          // Ignore failures per recipient
        }
      }
    };

    if (typeof waitUntil === 'function') waitUntil(sendAll()); else sendAll();

    return new Response(JSON.stringify({ accepted: true, count: emails.length }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Broadcast failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

