# Life with a Twist of Lemon

A podcast about technology, finance, life, craftsmanship, theology, and a little bit of everything else with a twist of Stan Lemon.

## Technology Stack

This site is built with [Eleventy (11ty)](https://www.11ty.dev/), a simple and powerful static site generator.

### Key Features

- **Fast Build Times**: Complete site builds in under 0.5 seconds
- **171 Episode Pages**: All podcast episodes with audio players
- **Paginated Blog Index**: 10 episodes per page
- **Category & Tag Pages**: Organized content with 15 categories and 88 tags
- **RSS Feed**: Podcast-compatible RSS feed with enclosures at `/feed.xml`
- **XML Sitemap**: Comprehensive sitemap at `/sitemap.xml`
- **SEO Optimized**: Open Graph and Twitter Card meta tags
- **Responsive Design**: Mobile-friendly grid layout
- **Audio Player**: Plyr-based podcast audio player

## Getting Started

### Prerequisites

- Node.js 22.x or later (specified in `.nvmrc`)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with live reload
npm run dev

# Or use the alias
npm start
```

The site will be available at `http://localhost:8080`

### Building

```bash
# Build the site
npm run build
```

Output will be in the `_site` directory.

### Testing

```bash
# Run validation tests
npm test
```

This runs:
- Build validation (checks for required files, correct page counts)
- Content validation (validates frontmatter for all posts)

## Project Structure

```
.
├── .eleventy.js          # 11ty configuration
├── content/
│   ├── blog/             # Blog posts (171 episodes)
│   └── assets/           # Images and assets
├── src/
│   ├── _data/            # Global data files
│   ├── _includes/        # Layouts and partials
│   │   ├── layouts/      # Page layouts
│   │   └── partials/     # Reusable components
│   ├── css/              # Stylesheets
│   ├── categories.njk    # Category pages template
│   ├── tags.njk          # Tag pages template
│   ├── feed.njk          # RSS feed template
│   └── sitemap.njk       # XML sitemap template
├── tests/                # Test files
├── index.njk             # Homepage with pagination
└── package.json
```

## Content Structure

Blog posts are stored in `content/blog/` with the following structure:

```
content/blog/YYYY-MM-DD/slug/post.md
```

### Frontmatter

Each post requires the following frontmatter:

```yaml
---
title: Episode Title
slug: custom-url-slug (optional)
episode: 1
date: '2018-07-30T23:20:55.000Z'
categories:
  - Technology
  - Lifestyle
tags:
  - podcast
  - apple
enclosure:
  url: https://example.com/episode.mp3
  length: 12345678
  type: audio/mpeg
---
```

## Deployment

The site is configured for deployment to GitHub Pages or any static hosting service.

### GitHub Pages

Build command: `npm run build`
Publish directory: `_site`

### Other Hosts

This site can be deployed to any static hosting service:
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## Performance

- **Build Time**: ~0.4 seconds
- **Total Pages**: 283
  - 171 episode pages
  - 17 pagination pages
  - 15 category pages
  - 73 tag pages
  - Plus index, feed, and sitemap

## Migration Notes

This site was migrated from Gatsby to 11ty in October 2025 to improve build performance and simplify the architecture. The migration maintained:
- All 171 blog posts with full content
- Audio player functionality for podcast episodes
- Category and tag organization
- RSS feed with podcast enclosures
- SEO metadata and sitemap
- Responsive design and styling

## License

Content © Jon Kohlmeier & Stan Lemon

## Links

- Website: https://twistoflemonpod.com/
- Twitter: [@twistoflemonpod](https://twitter.com/twistoflemonpod)
