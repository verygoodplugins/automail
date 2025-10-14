# AutoMail Setup Guide

Complete step-by-step setup instructions.

## Prerequisites

- Node.js 18+ installed
- A Cloudflare account (free tier works)
- A domain (optional, but recommended)
- Resend account for sending emails (free tier: 100 emails/day)

## Step 1: Install Wrangler

Wrangler is Cloudflare's CLI tool.

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

## Step 2: Clone and Install

```bash
git clone https://github.com/verygoodplugins/automail.git
cd automail
npm install
```

## Step 3: Create D1 Database

```bash
npm run db:create
```

You'll see output like:

```
✅ Successfully created DB 'automail-db'
📋 Database ID: abc123def456
```

**Copy the Database ID** — you'll need it in the next step.

## Step 4: Configure Wrangler

```bash
cp wrangler.example.toml wrangler.toml
```

Edit `wrangler.toml` and add your database ID:

```toml
[[d1_databases]]
binding = "D1"
database_name = "automail-db"
database_id = "abc123def456"  # ← Replace with your ID
```

Also update the `[vars]` section:

```toml
[vars]
BASE_URL = "https://yourdomain.com"  # Your site URL
FROM_EMAIL = "no-reply@yourdomain.com"
FROM_NAME = "Your App Name"
```

## Step 5: Apply Database Schema

```bash
npm run db:migrate
```

This creates the `waitlist` table and views in your D1 database.

## Step 6: Set Secrets

Secrets are sensitive values that shouldn't be in `wrangler.toml`.

### Required: Admin Token

```bash
npx wrangler secret put ADMIN_TOKEN
```

Enter a secure random string (use a password generator). This protects your admin endpoints.

### Optional: Email Sending (Resend)

Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day).

Get your API key from the dashboard, then:

```bash
npx wrangler secret put RESEND_API_KEY
```

Paste your Resend API key.

### Optional: Turnstile Bot Protection

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Turnstile
2. Create a new site widget
3. Get your Site Key and Secret Key

```bash
# Add to wrangler.toml [vars]
PUBLIC_TURNSTILE_SITE_KEY = "your-site-key"

# Set secret
npx wrangler secret put TURNSTILE_SECRET_KEY
```

## Step 7: Test Locally

```bash
npm run dev
```

This starts a local dev server at `http://localhost:8788`.

### Test Signup

```bash
curl -X POST http://localhost:8788/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"landing"}'
```

Expected response:

```json
{
  "success": true,
  "message": "Welcome to the waitlist!",
  "position": 1
}
```

### Test Admin (View Data)

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:8788/admin/waitlist
```

## Step 8: Deploy to Cloudflare

```bash
npm run deploy
```

Wrangler will output your deployment URL, e.g.:

```
✨ Deployment complete!
🌎 https://automail.pages.dev
```

## Step 9: (Optional) Add Custom Domain

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Your project
3. Go to **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter your domain (e.g., `api.yourdomain.com`)

Cloudflare will automatically configure DNS.

## Step 10: Integrate with Your Frontend

Copy `example/signup-component.html` or integrate the API into your existing site.

Basic integration:

```html
<form id="signup-form">
  <input type="email" name="email" required>
  <button type="submit">Join Waitlist</button>
</form>

<script>
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  
  const res = await fetch('https://your-api.com/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'homepage' })
  });
  
  const data = await res.json();
  alert(data.message);
});
</script>
```

## Configuration Options

### Double Opt-In

Require email confirmation before adding to list:

```toml
# In wrangler.toml [vars]
DOUBLE_OPT_IN = "true"
```

Users will receive a confirmation email with a link to verify.

### Disable Welcome Email

```toml
# In wrangler.toml [vars]
SEND_WELCOME_EMAIL = "false"
```

### Custom Confirmation Secret

By default, tokens use `ADMIN_TOKEN`. To use a separate secret:

```bash
npx wrangler secret put CONFIRM_SECRET
```

## Managing Your Waitlist

### View Signups

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://your-api.com/admin/waitlist
```

### Export as CSV

```bash
curl -X POST -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://your-api.com/admin/waitlist > waitlist.csv
```

### Send a Campaign

```bash
curl -X POST https://your-api.com/admin/broadcast \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "day1",
    "confirmedOnly": true
  }'
```

### Preview Templates

Send test emails to yourself:

```bash
curl -X POST https://your-api.com/admin/preview \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"you@example.com"}'
```

## Troubleshooting

### "D1 binding not found"

Make sure `wrangler.toml` has the correct database ID and binding name is `D1`.

### "ADMIN_TOKEN missing"

You need to set the secret:

```bash
npx wrangler secret put ADMIN_TOKEN
```

### Emails not sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify your domain in Resend dashboard
3. Check Resend logs for errors

### Turnstile not working

1. Verify `PUBLIC_TURNSTILE_SITE_KEY` in `wrangler.toml`
2. Set `TURNSTILE_SECRET_KEY` secret
3. Make sure domain matches Turnstile widget configuration

## Next Steps

- Customize email templates in `functions/lib/email.js`
- Add more campaign templates in `functions/lib/campaigns.js`
- Build a dashboard UI for managing signups
- Set up monitoring/alerts

## Need Help?

- Open an issue: https://github.com/verygoodplugins/automail/issues
- Email: hello@automem.ai
- Twitter: @automem_ai

## Cost Estimate

| Users | D1 Requests | Workers | Resend | Total |
|-------|-------------|---------|--------|-------|
| 100 | Free | Free | Free | $0 |
| 1,000 | Free | Free | Free | $0 |
| 10,000 | Free | Free | ~$4/mo | ~$4/mo |

Cloudflare's free tier is very generous. You won't pay until you have significant traffic.

