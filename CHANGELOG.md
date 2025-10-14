# Changelog

All notable changes to AutoMail will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Dashboard UI for managing signups
- CLI tool: `npx create-automail`
- Webhook support for integrations
- Segments and tags
- Email A/B testing

## [0.1.0] - 2024-01-15

### Added
- Initial release
- Email signup with validation
- Double opt-in support (optional)
- Beautiful email templates (welcome, confirm, campaigns)
- Dark mode email support
- Bot protection via Cloudflare Turnstile
- Admin API endpoints (view, export, broadcast, preview)
- HMAC-based secure tokens for confirm/unsubscribe
- CSV export functionality
- Broadcast campaigns to waitlist
- Template preview system
- Complete documentation (README, SETUP, CONTRIBUTING)
- Example frontend component
- SQLite-based storage via Cloudflare D1
- Edge-native architecture on Cloudflare Workers

### Security
- Bearer token authentication for admin endpoints
- Parameterized SQL queries
- Token-based email verification
- Turnstile bot protection support

[Unreleased]: https://github.com/verygoodplugins/automail/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/verygoodplugins/automail/releases/tag/v0.1.0

