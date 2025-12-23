# Development Guide

## Architecture

### Directory Structure

```
content/blog/YYYY-MM-DD/   # Episode posts and transcripts
src/
├── _data/                 # Global site data
├── _includes/
│   ├── layouts/           # Page templates (base, post, transcript)
│   └── partials/          # Reusable components
├── css/                   # Stylesheets
├── images/                # Static images
├── feed.liquid            # RSS/Podcast feed
├── sitemap.liquid         # XML sitemap
├── categories.liquid      # Category archives
└── tags.liquid            # Tag archives
scripts/                   # Utility scripts
tests/                     # Test suite
```

### Episode Frontmatter Schema

```yaml
---
title: Episode Title
slug: url-slug              # Optional, auto-generated from title
episode: 123
date: "2024-01-15T12:00:00.000Z"
categories: [Technology, Life]
tags: [podcast, topic]
enclosure:
  url: https://media.twistoflemonpod.com/123-lwatol-20240115.mp3
  length: 45678901          # File size in bytes
  type: audio/mpeg
---
```

### Scheduled Posts

Future-dated posts are excluded from builds by default. Override with:

```bash
INCLUDE_FUTURE_POSTS=true npm run build
```

Implementation: `lib/collections.js` (`shouldIncludePost()`) and `.eleventy.js` computed data.

## Development Workflow

**Work in small, iterative phases:**

1. Run `npm test` to establish baseline
2. Make one logical change
3. Run `npm test && npm run build`
4. Commit
5. Repeat

### Performance Guardrails

When adding features:
- Keep third-party scripts off the critical path (defer/async)
- Prefer single preloaded stylesheet; inline only critical styles
- Use modern images (AVIF/WEBP) with explicit dimensions
- Re-run Lighthouse when adding blocking assets

### Git Workflow

```bash
git checkout -b feature/description
# Make changes
npm test && npm run build
git commit -m "Descriptive message"
git push origin feature/description
```

## Scripts

All scripts in `scripts/`. Run with `node scripts/<script>.js`.

### Creating New Episodes

**Workflow:**

1. Record episode in Zencastr (provides transcript automatically)
2. Export the transcript as markdown
3. Run the slash command with the transcript path:
   ```
   /create-episode ~/Downloads/transcript.md
   ```

The command prompts for episode details (number, title, date), moves the transcript to the correct directory, analyzes content, and creates both the episode post and formatted transcript with proper frontmatter.

### Uploading Audio

```bash
# First, authenticate with R2 (pulls credentials from 1Password)
r2auth

# Then upload
node scripts/upload-to-r2.js ~/path/to/episode.mp3
```

**Note:** `r2auth()` is defined in `~/.shell_local` and uses the 1Password CLI (`op`) to fetch R2 credentials. Run it in your shell before executing the upload script.

### Other Scripts

| Script | Purpose |
|--------|---------|
| `upload-to-r2.js` | Upload MP3 files to Cloudflare R2 |
| `list-categories-and-tags.js` | List all categories and tags in use |

### Script Policy

- **Commit**: Reusable scripts run multiple times
- **Don't commit**: One-off refactoring scripts (delete after use)

## RSS Feed

Generated from `src/feed.liquid`. Podcast-compatible with iTunes namespace.

### Validation

Always validate after changes:
- [W3C Feed Validator](https://validator.w3.org/feed/)
- [Podbase Validator](https://podbase.org/validate)

### Best Practices

**Required per item:** `<title>`, `<link>`, `<guid>`, `<pubDate>`, `<description>`, `<enclosure>`

**Omit empty optional tags** - use conditionals:
```liquid
{% if post.data.enclosure.duration %}
<itunes:duration>{{ post.data.enclosure.duration }}</itunes:duration>
{% endif %}
```

**Escape content:**
```liquid
{{ title | escape }}
```

### Common Errors

- Empty tags (use conditionals)
- Malformed URLs (must be absolute)
- Missing required fields
- Unescaped HTML entities
- Invalid enclosure `length` (must be file size in bytes)

## Deployment

Hosted on Cloudflare Pages.

**Scheduled redeploys:** `.github/workflows/cloudflare-pages-redeploy.yml` runs Thursdays at 04:00 EST to publish future-dated posts.

Required secrets: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`

## Audio Files

- **Hosted:** Cloudflare R2 bucket `twistoflemonpod`
- **Path format:** `NNN-lwatol-YYYYMMDD.mp3` (in bucket root)
- **Local copies:** `~/Sites/twistoflemonpod-mp3s/`

## Troubleshooting

### Build Fails

1. Run `npm test` for validation errors
2. Check frontmatter YAML syntax
3. Verify required fields present
4. Check template syntax

### Feed Invalid

1. Verify enclosure URLs accessible
2. Check `length` values are actual file sizes
3. Validate with [Podbase](https://podbase.org/validate)

### Missing Pages

1. Check `.eleventy.js` configuration
2. Run `npm run clean && npm run build`
