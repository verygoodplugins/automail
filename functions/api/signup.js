// Cloudflare Pages Function for email signup
// POST /api/signup
// Body: { email, source?, turnstileToken? }

export async function onRequestPost({ request, env, waitUntil }) {
  try {
    const { email, source = 'website', turnstileToken } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    
    // Optional: Verify Cloudflare Turnstile token if configured
    if (env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return new Response(JSON.stringify({ success: false, error: 'Verification required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      try {
        const ip = request.headers.get('CF-Connecting-IP') || undefined;
        const form = new URLSearchParams();
        form.set('secret', env.TURNSTILE_SECRET_KEY);
        form.set('response', turnstileToken);
        if (ip) form.set('remoteip', ip);
        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST', body: form
        });
        const outcome = await res.json();
        if (!outcome.success) {
          return new Response(JSON.stringify({ success: false, error: 'Verification failed' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: 'Verification error' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid email address' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.D1 || env.DB;
    if (!db) {
      throw new Error('D1 binding not found (expected env.D1)');
    }
    // Check if already exists
    const existing = await db.prepare(
      'SELECT email FROM waitlist WHERE email = ?'
    ).bind(normalizedEmail).first();
    
    if (existing) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'You are already on the waitlist!' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store in D1 database
    const isDoubleOptIn = String(env.DOUBLE_OPT_IN || 'false').toLowerCase() === 'true';
    const confirmedFlag = isDoubleOptIn ? 0 : 1;
    await db.prepare(
      'INSERT INTO waitlist (email, source, created_at, confirmed) VALUES (?, ?, ?, ?)'
    ).bind(normalizedEmail, source, new Date().toISOString(), confirmedFlag).run();

    // Optional: Double opt-in email via Resend
    const isOptIn = String(env.DOUBLE_OPT_IN || 'false').toLowerCase() === 'true';
    if (isOptIn && env.RESEND_API_KEY) {
      const { createToken } = await import('../lib/tokens.js');
      const { buildConfirmEmail } = await import('../lib/email.js');
      const secret = env.CONFIRM_SECRET || env.ADMIN_TOKEN || '';
      const token = await createToken(normalizedEmail, secret, 60 * 60 * 24 * 3); // 3 days
      const originUrl = new URL(request.url);
      const base = env.BASE_URL || `${originUrl.protocol}//${originUrl.host}`;
      const confirmUrl = `${base}/confirm?token=${encodeURIComponent(token)}`;
      const unsubscribeUrl = `${base}/unsubscribe?token=${encodeURIComponent(token)}`;
      const { subject, html, text } = buildConfirmEmail({ baseUrl: base, confirmUrl, unsubscribeUrl, userEmail: normalizedEmail });

      const fromEmail = env.FROM_EMAIL || 'no-reply@yourdomain.com';
      const fromName = env.FROM_NAME || 'Your App';
      const p = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [normalizedEmail],
          subject,
          html,
          text
        })
      }).then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('Resend email failed:', res.status, txt);
        }
      }).catch((err) => console.error('Resend error:', err));
      if (typeof waitUntil === 'function') waitUntil(p);
    }

    // Optional: Send welcome email immediately if not double opt-in
    if (!isOptIn && env.RESEND_API_KEY && String(env.SEND_WELCOME_EMAIL || 'true').toLowerCase() !== 'false') {
      const { createToken } = await import('../lib/tokens.js');
      const { buildWelcomeEmail } = await import('../lib/email.js');
      const secret = env.CONFIRM_SECRET || env.ADMIN_TOKEN || '';
      const token = await createToken(normalizedEmail, secret, 60 * 60 * 24 * 30); // 30 days
      const originUrl = new URL(request.url);
      const base = env.BASE_URL || `${originUrl.protocol}//${originUrl.host}`;
      const unsubscribeUrl = `${base}/unsubscribe?token=${encodeURIComponent(token)}`;
      const { subject, html, text } = buildWelcomeEmail({ baseUrl: base, unsubscribeUrl, userEmail: normalizedEmail });
      const fromEmail = env.FROM_EMAIL || 'no-reply@yourdomain.com';
      const fromName = env.FROM_NAME || 'Your App';
      const p = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: [normalizedEmail], subject, html, text })
      }).catch(() => {});
      if (typeof waitUntil === 'function') waitUntil(p);
    }

    // Track signup count
    const count = await db.prepare(
      'SELECT COUNT(*) as total FROM waitlist'
    ).first();

    return new Response(JSON.stringify({ 
      success: true, 
      message: isOptIn
        ? 'Check your email to confirm your signup.'
        : 'Welcome to the waitlist!',
      position: count.total
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Something went wrong. Please try again.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

