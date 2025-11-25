# Life with a Twist of Lemon

A podcast about technology, finance, life, craftsmanship, theology, and a little bit of everything else with a twist of Stan Lemon.

**Website:** https://twistoflemonpod.com/
**Twitter:** [@twistoflemonpod](https://twitter.com/twistoflemonpod)

## Quick Start

### Prerequisites

- Node.js 22.x or later (see `.nvmrc`)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Site available at http://localhost:8080 with live reload.

### Build

```bash
npm run build
```

Output in `_site/` directory.

### Test

```bash
npm test
```

Runs build and content validation.

## Technology

Built with [Eleventy (11ty)](https://www.11ty.dev/) for fast builds and simple architecture.

**Key Features:**

- 172 podcast episodes with audio players
- Podcast-compatible RSS feed at `/feed.xml`
- Category and tag organization (15 categories, 88 tags)
- Responsive design
- SEO optimized with Open Graph and Twitter Cards
- Fast builds (~0.4s for 283 pages)

## Content Structure

Episodes are stored as Markdown files in `content/blog/YYYY-MM-DD/slug.md`:

```yaml
---
title: Episode Title
episode: 1
date: "2018-07-30T23:20:55.000Z"
categories:
  - Technology
tags:
  - podcast
enclosure:
  url: https://example.com/episode.mp3
  length: 12345678
  type: audio/mpeg
---
```

## Deployment

Deploy to any static hosting service:

**Build Command:** `npm run build`
**Publish Directory:** `_site`

Supports GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.

## Development Guide

For detailed development workflows, architecture documentation, and best practices, see [CLAUDE.md](./CLAUDE.md).

## Scripts

Utility scripts in `scripts/` directory for maintenance tasks:

- `update-enclosure-metadata.js` - Update podcast RSS metadata
- `add-episode-numbers.js` - Add episode numbers
- `add-slug-to-frontmatter.js` - Generate URL slugs

Run with: `node scripts/script-name.js`

## Performance

- **Build Time:** ~0.4 seconds
- **Total Pages:** 283
- **Episodes:** 172

## License

Content © Jon Kohlmeier & Stan Lemon
