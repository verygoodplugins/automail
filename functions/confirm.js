// Confirm email endpoint: GET /confirm?token=...

import { verifyToken } from './lib/tokens.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  const secret = env.CONFIRM_SECRET || env.ADMIN_TOKEN || '';

  const email = await verifyToken(token, secret);
  if (!email) {
    return new Response('<h1>Invalid or expired confirmation link.</h1>', {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  try {
    const db = env.D1 || env.DB;
    if (!db) {
      return new Response('<h1>Database binding missing</h1>', { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    await db.prepare(
      'UPDATE waitlist SET confirmed = 1 WHERE email = ?'
    ).bind(email.toLowerCase()).run();

    // Optional: Send welcome email after confirmation
    try {
      const shouldSend = String(env.SEND_WELCOME_EMAIL || 'true').toLowerCase() !== 'false';
      if (shouldSend && env.RESEND_API_KEY) {
        const { createToken } = await import('./lib/tokens.js');
        const { buildWelcomeEmail } = await import('./lib/email.js');
        const secret = env.CONFIRM_SECRET || env.ADMIN_TOKEN || '';
        const token = await createToken(email.toLowerCase(), secret, 60 * 60 * 24 * 30);
        const originUrl = new URL(request.url);
        const base = env.BASE_URL || `${originUrl.protocol}//${originUrl.host}`;
        const unsubscribeUrl = `${base}/unsubscribe?token=${encodeURIComponent(token)}`;
        const { subject, html, text } = buildWelcomeEmail({ baseUrl: base, unsubscribeUrl, userEmail: email.toLowerCase() });

        const fromEmail = env.FROM_EMAIL || 'no-reply@yourdomain.com';
        const fromName = env.FROM_NAME || 'Your App';
        // Fire-and-forget
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: [email.toLowerCase()], subject, html, text })
        }).catch(() => {});
      }
    } catch {}

    // Optionally redirect to homepage with a confirmation parameter
    const base = env.BASE_URL || `${url.protocol}//${url.host}`;
    const redirect = new URL(base);
    redirect.searchParams.set('confirmed', '1');
    return Response.redirect(redirect.toString(), 302);
  } catch (e) {
    return new Response('<h1>Confirmation failed. Please try again.</h1>', {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
}

