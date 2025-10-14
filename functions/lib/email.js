// Branded email templates
// Customize these for your application

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildWelcomeEmail(opts) {
  const {
    baseUrl = 'https://yourdomain.com',
    docsUrl = baseUrl + '/docs',
    unsubscribeUrl = baseUrl + '/unsubscribe',
    userEmail = '',
    appName = 'Your App',
    logoUrl = baseUrl + '/logo.png'
  } = opts || {};

  const subject = `🎉 Welcome to ${appName}!`;
  const preheader = 'Thanks for joining. Here\'s what to do next.';

  const text = [
    `Welcome to ${appName}!`,
    'Thanks for signing up. We\'re excited to have you.',
    `Documentation: ${docsUrl}`,
    '',
    'Unsubscribe: ' + unsubscribeUrl,
  ].join('\n');

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${escapeHtml(subject)}</title>
       <style>
        body { background:#f7fafc; margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#111827; line-height:1.6; }
        a { color:#111827; text-decoration:underline; }
        .container { max-width:680px; margin:0 auto; padding:32px; }
        .card { background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; padding:32px; }
        .brand { display:flex; align-items:center; gap:16px; }
        .title { font-size:24px; margin:6px 0 0 0; color:#111827; }
        .label { display:inline-block; padding:4px 10px; border-radius:999px; background:#eef2f7; color:#374151; font-size:12px; border:1px solid #e5e7eb; }
        .btn { display:inline-block; background:#374151; color:#ffffff !important; padding:14px 18px; border-radius:12px; font-weight:600; margin-top:8px; text-decoration:none; }
        .footer { color:#6b7280; font-size:12px; margin-top:28px; }
        @media (prefers-color-scheme: dark) {
          body { background:#0f0f10; color:#eaeaea; }
          .card { background:#111214; border-color:#2a2a2e; }
          .title { color:#ffffff; }
          a { color:#e5e7eb; }
          .label { background:#1f2937; color:#e5e7eb; border-color:#374151; }
          .footer { color:#9ca3af; }
        }
       </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="brand">
            <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(appName)}" width="48" height="48" style="display:block;border-radius:8px;" />
            <div>
              <span class="label">${escapeHtml(appName)}</span>
              <h1 class="title">Welcome! You're all set.</h1>
            </div>
          </div>
          <p style="margin-top:20px">Hello${userEmail ? ' ' + escapeHtml(userEmail) : ''}! Thanks for joining ${escapeHtml(appName)}. We're excited to have you on board.</p>
          <p>Here's what to do next:</p>
          <ul style="list-style:none; padding-left:0; margin:12px 0;">
            <li style="margin:10px 0;">📚 Check out our <a href="${escapeHtml(docsUrl)}">documentation</a></li>
            <li style="margin:10px 0;">💬 Reply to this email if you have questions</li>
          </ul>
          <div style="margin-top:16px;">
            <a class="btn" href="${escapeHtml(baseUrl)}">Get Started</a>
          </div>
          <p class="footer">Unsubscribe: <a href="${escapeHtml(unsubscribeUrl)}">${escapeHtml(unsubscribeUrl)}</a></p>
        </div>
      </div>
      <div style="display:none;overflow:hidden;height:0;width:0;">${escapeHtml(preheader)}</div>
    </body>
  </html>`;

  return { subject, html, text };
}

export function buildConfirmEmail(opts) {
  const {
    baseUrl = 'https://yourdomain.com',
    confirmUrl = baseUrl + '/confirm',
    unsubscribeUrl = baseUrl + '/unsubscribe',
    userEmail = '',
    appName = 'Your App',
    logoUrl = baseUrl + '/logo.png'
  } = opts || {};

  const subject = '✅ Confirm your email';
  const preheader = 'One click to activate.';
  const text = [
    `Please confirm your email to activate ${appName}.`,
    'Confirm: ' + confirmUrl,
    'If this wasn\'t you, ignore this email.',
    'Unsubscribe: ' + unsubscribeUrl,
  ].join('\n');

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${escapeHtml(subject)}</title>
       <style>
        body { background:#f7fafc; margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#111827; line-height:1.6; }
        a { color:#111827; text-decoration:underline; }
        .container { max-width:680px; margin:0 auto; padding:32px; }
        .card { background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; padding:32px; }
        .title { font-size:24px; margin:6px 0 0 0; color:#111827; }
        .chip { display:inline-block; padding:4px 10px; border-radius:999px; background:#eef2f7; color:#374151; font-size:12px; border:1px solid #e5e7eb; }
        .btn { display:inline-block; background:#374151; color:#fff !important; padding:14px 18px; border-radius:12px; font-weight:600; margin-top:8px; text-decoration:none; }
        .footer { color:#6b7280; font-size:12px; margin-top:28px; }
        @media (prefers-color-scheme:dark) { body { background:#0f0f10; color:#eaeaea; } .card { background:#111214; border-color:#2a2a2e; } .title{color:#ffffff;} a{color:#e5e7eb;} .chip{background:#1f2937;color:#e5e7eb;border-color:#374151} .footer{color:#9ca3af;} }
       </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div style="display:flex; align-items:center; gap:16px;">
            <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(appName)}" width="48" height="48" style="display:block;border-radius:8px;" />
            <div>
              <span class="chip">${escapeHtml(appName)}</span>
              <h1 class="title">Confirm your email ✅</h1>
            </div>
          </div>
          <p style="margin-top:18px">Hi${userEmail ? ' ' + escapeHtml(userEmail) : ''}! Click once to confirm your email.</p>
          <p style="margin-top:20px"><a class="btn" href="${escapeHtml(confirmUrl)}">Confirm Email</a></p>
          <p class="footer">Questions? Reply to this email — we read every message.</p>
          <p class="footer">If this wasn't you, ignore this message. Unsubscribe: <a href="${escapeHtml(unsubscribeUrl)}">${escapeHtml(unsubscribeUrl)}</a></p>
        </div>
      </div>
      <div style="display:none;overflow:hidden;height:0;width:0;">${escapeHtml(preheader)}</div>
    </body>
  </html>`;
  return { subject, html, text };
}

