// Admin endpoint: send preview emails for all templates to a target address
// POST /admin/preview
// Auth: Authorization: Bearer <ADMIN_TOKEN>
// Body: { to?: string, baseUrl?: string, templates?: string[] }

export async function onRequestPost({ request, env }) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : null;
  if (!token || token !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const toRaw = (body.to || env.ADMIN_PREVIEW_EMAIL || '').trim();
    if (!toRaw) {
      return new Response(JSON.stringify({ error: 'Provide { "to": "you@example.com" } or set ADMIN_PREVIEW_EMAIL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const to = String(toRaw).toLowerCase();
    const base = body.baseUrl || env.BASE_URL || new URL(request.url).origin;
    const chosen = Array.isArray(body.templates) && body.templates.length
      ? body.templates
      : ['confirm', 'welcome', 'day1'];

    const { createToken } = await import('../lib/tokens.js');
    const { buildConfirmEmail, buildWelcomeEmail } = await import('../lib/email.js');
    const { buildDay1Email } = await import('../lib/campaigns.js');

    const secret = env.CONFIRM_SECRET || env.ADMIN_TOKEN || '';
    const confirmToken = await createToken(to, secret, 60 * 60 * 24 * 3);
    const unsubToken = await createToken(to, secret, 60 * 60 * 24 * 30);
    const confirmUrl = `${base}/confirm?token=${encodeURIComponent(confirmToken)}`;
    const unsubscribeUrl = `${base}/unsubscribe?token=${encodeURIComponent(unsubToken)}`;

    const fromEmail = env.FROM_EMAIL || 'no-reply@yourdomain.com';
    const fromName = env.FROM_NAME || 'Your App';

    const results = [];
    async function send(subject, html, text) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: [to], subject, html, text })
      });
      const ok = res.ok;
      const data = await res.text().catch(() => '');
      return { ok, status: res.status, body: data };
    }

    for (const t of chosen) {
      if (t === 'confirm') {
        const e = buildConfirmEmail({ baseUrl: base, confirmUrl, unsubscribeUrl, userEmail: to });
        results.push({ template: 'confirm', ...(await send(e.subject, e.html, e.text)) });
      } else if (t === 'welcome') {
        const e = buildWelcomeEmail({ baseUrl: base, unsubscribeUrl, userEmail: to });
        results.push({ template: 'welcome', ...(await send(e.subject, e.html, e.text)) });
      } else if (t === 'day1') {
        const e = buildDay1Email({ baseUrl: base });
        results.push({ template: 'day1', ...(await send(e.subject, e.html, e.text)) });
      }
    }

    return new Response(JSON.stringify({ to, count: results.length, results }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Preview failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

