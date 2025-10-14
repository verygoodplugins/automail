# AutoMail 📬

**A self-hosted email waitlist system that runs entirely on Cloudflare's edge.**

Zero external dependencies. No SaaS fees. Deploy in 5 minutes.

## Features

✅ **Email Signup** with validation and deduplication  
✅ **Double Opt-In** (optional) with secure token-based confirmation  
✅ **Beautiful Email Templates** with dark mode support  
✅ **Bot Protection** via Cloudflare Turnstile  
✅ **Admin Dashboard** (JSON/CSV export)  
✅ **Broadcast Campaigns** to your entire list  
✅ **Template Previews** for testing  
✅ **100% Edge Native** - runs on Cloudflare Workers + D1

## Why AutoMail?

Most waitlist tools lock you into expensive SaaS platforms. AutoMail gives you:

- **Full control** - Your data stays in your D1 database
- **Zero cost** - Cloudflare's free tier covers most projects (100k reads/day, 1k writes/day)
- **Fast** - Edge-first architecture, global deployment
- **Simple** - 5-minute setup, no complex integrations

## Quick Start

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create D1 Database

```bash
npm run db:create
# Note the database_id that's returned
```

### 3. Configure

Copy `wrangler.example.toml` to `wrangler.toml` and add your database ID:

```toml
[[d1_databases]]
binding = "D1"
database_name = "automail-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 4. Apply Schema

```bash
npm run db:migrate
```

### 5. Set Environment Variables

```bash
# Required
npx wrangler secret put ADMIN_TOKEN
# Enter a secure random string

# Optional (for sending emails)
npx wrangler secret put RESEND_API_KEY
# Get your key from resend.com
```

### 6. Deploy

```bash
npm run deploy
```

Done! Your waitlist API is live at:
- `POST /api/signup` - Accept signups
- `GET /admin/waitlist` - View signups (requires auth)
- `POST /admin/broadcast` - Send campaigns

## Environment Variables

### Required

- `ADMIN_TOKEN` - Secure token for admin endpoints

### Optional (Email Sending)

- `RESEND_API_KEY` - API key from [Resend](https://resend.com)
- `FROM_EMAIL` - Sender email (default: `no-reply@yourdomain.com`)
- `FROM_NAME` - Sender name (default: `Your App`)
- `BASE_URL` - Your app's URL (for links in emails)

### Optional (Features)

- `DOUBLE_OPT_IN` - Set to `"true"` to require email confirmation
- `SEND_WELCOME_EMAIL` - Set to `"false"` to disable welcome emails
- `PUBLIC_TURNSTILE_SITE_KEY` - Enable bot protection (client-side)
- `TURNSTILE_SECRET_KEY` - Turnstile secret (server-side)

## API Reference

### POST /api/signup

Accept email signups.

```bash
curl -X POST https://your-site.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "source": "homepage"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome to the waitlist!",
  "position": 42
}
```

### GET /admin/waitlist

View waitlist data (requires authentication).

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://your-site.com/admin/waitlist
```

**Response:**
```json
{
  "stats": {
    "total_signups": 150,
    "confirmed_count": 120,
    "unsubscribed_count": 5
  },
  "signups": [
    {
      "email": "user@example.com",
      "source": "homepage",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /admin/waitlist

Export as CSV.

```bash
curl -X POST -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://your-site.com/admin/waitlist > waitlist.csv
```

### POST /admin/broadcast

Send email campaigns to your list.

```bash
# Dry run (preview recipients)
curl -X POST https://your-site.com/admin/broadcast \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "day1",
    "dryRun": true,
    "confirmedOnly": true
  }'

# Send for real
curl -X POST https://your-site.com/admin/broadcast \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "day1",
    "confirmedOnly": true
  }'
```

### POST /admin/preview

Preview email templates by sending them to yourself.

```bash
curl -X POST https://your-site.com/admin/preview \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "you@example.com"}'
```

## Frontend Integration

See [`example/signup-component.html`](./example/signup-component.html) for a complete example with:
- Email validation
- Turnstile bot protection
- Success/error handling
- Accessible form design

Basic example:

```html
<form id="signup-form">
  <input type="email" name="email" required placeholder="Enter your email">
  <button type="submit">Join Waitlist</button>
</form>

<script>
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  
  const res = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'landing' })
  });
  
  const data = await res.json();
  if (data.success) {
    alert(data.message);
  }
});
</script>
```

## Customizing Email Templates

Edit `functions/lib/email.js` and `functions/lib/campaigns.js` to customize:

- Welcome email (sent on signup or after confirmation)
- Confirmation email (double opt-in)
- Campaign emails (e.g., Day 1 tips)

All templates support:
- Dark mode
- Mobile responsive
- Plain text fallback
- Unsubscribe links

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ POST /api/signup
       ↓
┌─────────────────┐
│ Cloudflare      │
│ Workers (Edge)  │
└────┬───────┬────┘
     │       │
     ↓       ↓
┌─────┐  ┌──────┐
│  D1 │  │Resend│
│(DB) │  │(Mail)│
└─────┘  └──────┘
```

- **Frontend**: Any framework (vanilla JS, React, Vue, etc.)
- **Backend**: Cloudflare Workers (serverless functions)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Email**: Resend API (optional, or bring your own SMTP)

## Cost Breakdown

| Service | Free Tier | Typical Usage |
|---------|-----------|---------------|
| Cloudflare D1 | 100k reads/day, 1k writes/day | $0 for most projects |
| Cloudflare Workers | 100k requests/day | $0 for most projects |
| Resend | 100 emails/day | $0 for early stages |

**Total:** $0/month for projects under 1k signups/day.

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Test signup
curl -X POST http://localhost:8788/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Query database
npx wrangler d1 execute automail-db \
  --command="SELECT * FROM waitlist"
```

## Security

- **Tokens**: HMAC-signed with expiration (not reversible)
- **Admin Auth**: Bearer token in headers
- **Rate Limiting**: Configure via Cloudflare (WAF rules)
- **Bot Protection**: Optional Turnstile integration
- **CORS**: Configure in `wrangler.toml` as needed

## Roadmap

- [ ] CLI tool: `npx create-automail`
- [ ] Simple workflow builder
- [ ] Dashboard UI (view/export/manage signups)
- [ ] Webhooks support
- [ ] Segments/tags
- [ ] Email A/B testing
- [ ] Analytics dashboard

## Contributing

Contributions welcome! Please open an issue first to discuss major changes.

## License

MIT License - see [LICENSE](./LICENSE)

## Built By

AutoMail is something we created for [automem.ai](https://automem.ai).

If you found this useful, consider:
- ⭐️ Starring this repo
- 🐦 [Following us on Twitter](https://twitter.com/jjack_arturo)
- 🤖 Checking out [AutoMem](https://automem.ai)

---

**Questions?** Open an issue 🧡

