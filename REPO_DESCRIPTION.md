# GitHub Repository Settings

When creating the GitHub repository, use these settings:

## Basic Info

**Repository name:** `automail`

**Description:** 
```
Self-hosted email waitlist system on Cloudflare Workers + D1. Zero dependencies, zero cost.
```

**Topics/Tags:**
```
cloudflare, d1, waitlist, email, workers, resend, self-hosted, serverless, edge-computing, sqlite
```

**Website:** `https://automem.ai`

## About Section

**Short description:**
Deploy a production-ready email waitlist in 5 minutes. Runs entirely on Cloudflare's edge. No SaaS fees, no vendor lock-in.

## README Badges (optional)

Add these to the top of README.md:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![D1 Database](https://img.shields.io/badge/D1-Database-blue)](https://developers.cloudflare.com/d1/)
```

## Social Card

Create a social preview image (1200x630) with:
- "AutoMail" in large text
- Subtitle: "Self-hosted waitlist on Cloudflare"
- Cloudflare + D1 logos
- Clean gradient background

## First Release

After pushing to GitHub, create a release:

```bash
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0
```

Then create a GitHub release with:
- Title: "AutoMail v0.1.0 - Initial Release"
- Description: Copy from CHANGELOG.md
- Mark as latest release

## GitHub Pages (optional)

Enable GitHub Pages to host the example:
- Source: Deploy from branch
- Branch: main
- Folder: /example

## Marketing Checklist

After publishing:

- [ ] Submit to Cloudflare Developers Discord
- [ ] Post on Hacker News (Show HN)
- [ ] Post on Reddit (r/SideProject, r/webdev)
- [ ] Tweet from @automem_ai
- [ ] Add to awesome-cloudflare list
- [ ] Submit to Product Hunt
- [ ] Write blog post about building it
- [ ] Create demo video (2-3 min)
- [ ] Add to Cloudflare Workers examples

## Analytics

Consider adding:
- GitHub star count tracker
- Download statistics
- Usage metrics (anonymous)

