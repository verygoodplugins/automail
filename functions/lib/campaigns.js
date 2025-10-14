// Email campaign templates
// Add more campaigns here for drip sequences, announcements, etc.

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildDay1Email(opts = {}) {
  const {
    baseUrl = 'https://yourdomain.com',
    docsUrl = baseUrl + '/docs',
    unsubscribeUrl = baseUrl + '/unsubscribe',
    appName = 'Your App',
    logoUrl = baseUrl + '/logo.png'
  } = opts;

  const subject = '💡 Day 1: Quick tips to get started';
  const text = [
    'Day 1 tips:',
    '1) Explore the documentation',
    '2) Try the getting started guide',
    '3) Join our community',
    `Docs: ${docsUrl}`,
    '',
    'Unsubscribe: ' + unsubscribeUrl
  ].join('\n');

  const html = `
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body{background:#f7fafc;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0}
    a{color:#111827;text-decoration:underline}
    .wrap{max-width:640px;margin:0 auto;padding:24px}
    .card{background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:24px}
    .h{display:flex;gap:12px;align-items:center}
    .chip{display:inline-block;background:linear-gradient(135deg,#7c3aed,#22d3ee);color:#fff;border-radius:999px;padding:4px 10px;font-size:12px}
    h1{font-size:22px;margin:8px 0 0 0;color:#111827}
    .btn{display:inline-block;background:linear-gradient(135deg,#7c3aed,#22d3ee);color:#fff;padding:10px 14px;border-radius:10px;font-weight:600;margin-right:8px;text-decoration:none}
    .ft{color:#6b7280;font-size:12px;margin-top:24px}
    @media (prefers-color-scheme:dark){body{background:#0f0f10;color:#eaeaea}.card{background:#111214;border-color:#2a2a2e}h1{color:#fff}.ft{color:#9ca3af}}
  </style></head>
  <body><div class="wrap"><div class="card">
    <div class="h">
      <img src="${esc(logoUrl)}" width="42" height="42" alt="${esc(appName)}" style="display:block;border-radius:8px"/>
      <div><span class="chip">${esc(appName)}</span><h1>Day 1: Quick tips</h1></div>
    </div>
    <p style="margin-top:12px">Here are three quick wins to get you started:</p>
    <ol style="margin-left:18px">
      <li><strong>Read the docs</strong> — everything you need to know</li>
      <li><strong>Try the examples</strong> — hands-on learning</li>
      <li><strong>Join the community</strong> — get help and share ideas</li>
    </ol>
    <p style="margin-top:14px">
      <a class="btn" href="${esc(docsUrl)}">Open Docs</a>
      <a class="btn" href="${esc(baseUrl)}">Visit Site</a>
    </p>
    <p class="ft">Questions? Reply to this email — we'll help you get set up.</p>
    <p class="ft">Unsubscribe: <a href="${esc(unsubscribeUrl)}">${esc(unsubscribeUrl)}</a></p>
  </div></div></body></html>`;

  return { subject, html, text };
}

