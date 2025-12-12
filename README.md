# Life with a Twist of Lemon

A podcast about technology, finance, life, craftsmanship, theology, and a little bit of everything else with a twist of Stan Lemon.

**Website:** https://twistoflemonpod.com/
**Hosts:** Jon Kohlmeier & Stan Lemon

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Technology

Built with [Eleventy (11ty) 3.x](https://www.11ty.dev/) static site generator.

- Podcast-compatible RSS feed at `/feed.xml`
- Audio players powered by [Plyr](https://plyr.io/)
- Category and tag organization
- Full episode transcripts with AI-generated summaries

## Content

Episodes are Markdown files in `content/blog/YYYY-MM-DD/`:

```yaml
---
title: Episode Title
episode: 1
date: "2024-01-15T12:00:00.000Z"
categories: [Technology]
tags: [podcast]
enclosure:
  url: https://bucket.s3.amazonaws.com/episodes/001-episode.mp3
  length: 12345678
  type: audio/mpeg
---
Episode description and show notes...
```

## Scripts

Utility scripts in `scripts/`:

| Script | Purpose |
|--------|---------|
| `create-new-episode.js` | Create new episode from MP3 (transcription, AI summary) |
| `upload-to-r2.js` | Upload MP3 to Cloudflare R2 |
| `update-enclosure-metadata.js` | Update RSS feed metadata from MP3 files |

See [CLAUDE.md](./CLAUDE.md) for detailed development workflows and architecture.

## Deployment

Static site deployable anywhere. Output directory: `_site/`

Currently hosted on Cloudflare Pages with scheduled redeploys for future-dated posts.

## License

Content © Jon Kohlmeier & Stan Lemon
