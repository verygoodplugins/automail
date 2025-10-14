// Unsubscribe endpoint: GET /unsubscribe?token=...

import { verifyToken } from './lib/tokens.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  const secret = env.CONFIRM_SECRET || env.ADMIN_TOKEN || '';

  const email = await verifyToken(token, secret);
  if (!email) {
    return new Response('<h1>Invalid or expired unsubscribe link.</h1>', {
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
      'UPDATE waitlist SET unsubscribed = 1 WHERE email = ?'
    ).bind(email.toLowerCase()).run();

    return new Response(`
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Unsubscribed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 60px auto; padding: 20px; text-align: center; }
          h1 { color: #111827; }
          p { color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>✅ You've been unsubscribed</h1>
        <p>We've removed ${email} from our mailing list.</p>
        <p>Sorry to see you go!</p>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  } catch (e) {
    return new Response('<h1>Unsubscribe failed. Please try again.</h1>', {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
}

