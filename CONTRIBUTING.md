# Contributing to AutoMail

Thanks for your interest in contributing! AutoMail is open source and we welcome improvements.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/automail.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test locally (see Development section in README)
6. Commit with clear messages: `git commit -m "Add feature: X"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Set up local environment
cp wrangler.example.toml wrangler.toml
# Edit wrangler.toml with your database ID

# Create local D1 database
npm run db:create

# Apply schema
npm run db:migrate

# Run locally
npm run dev
```

## Guidelines

### Code Style

- Use modern JavaScript (ES modules, async/await)
- Keep functions small and focused
- Comment complex logic
- Use meaningful variable names

### Email Templates

- Test in multiple clients (Gmail, Outlook, Apple Mail)
- Ensure dark mode compatibility
- Include plain text versions
- Keep HTML simple (email clients are limited)

### Security

- Never log or expose user emails
- Validate all inputs
- Use parameterized queries (protect against SQL injection)
- Rate limit sensitive endpoints

### Performance

- Minimize database queries
- Use indexes for common queries
- Keep Workers functions lightweight
- Use `waitUntil` for background tasks

## What to Contribute

### High Priority

- [ ] Dashboard UI for viewing/managing signups
- [ ] CLI tool: `npx create-automail`
- [ ] Webhook support for integrations
- [ ] Better error handling and logging
- [ ] Rate limiting implementation
- [ ] Email template examples (more campaigns)

### Medium Priority

- [ ] Segments/tags for subscribers
- [ ] Email A/B testing
- [ ] Analytics dashboard
- [ ] Custom fields in signup
- [ ] Import/export tools
- [ ] GDPR compliance helpers

### Nice to Have

- [ ] TypeScript types
- [ ] Automated tests
- [ ] Alternative email providers (SendGrid, Mailgun)
- [ ] Scheduled campaigns
- [ ] Email previews in admin
- [ ] Multi-language templates

## Testing

Before submitting a PR:

1. Test the signup flow end-to-end
2. Verify emails are sent correctly
3. Test error cases (invalid email, duplicate signup)
4. Check admin endpoints work with auth
5. Ensure CSV export works

## Pull Request Process

1. Update README if you've added features
2. Add your changes to a "Unreleased" section in CHANGELOG (if we add one)
3. Ensure your code follows existing style
4. Describe what your PR does and why
5. Link any relevant issues

## Questions?

Open an issue or reach out at hello@automem.ai

## License

By contributing, you agree your contributions will be licensed under the MIT License.

