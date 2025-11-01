# Icon System

This project uses an npm-based SVG icon system for maximum performance with automatic updates.

## Philosophy

- **Zero runtime JavaScript** - All icons are static SVGs
- **Imported from npm** - Brand icons imported from `simple-icons` package
- **Automatic updates** - Run `npm update` to get latest icon designs
- **Tree-shakeable** - Only icons you import are included in the build
- **Two categories**: Brand logos (from npm) and UI icons (manual from Lucide)
- **Consistent sources**: Brand icons from [Simple Icons](https://simpleicons.org/), UI icons from [Lucide](https://lucide.dev/)

## How to Use Icons

### Method 1: Use the Icon Component (Recommended)

```liquid
{%- comment -%} Brand icons {%- endcomment -%}
{% include "partials/icon.liquid", category: "brands", name: "spotify" %}
{% include "partials/icon.liquid", category: "brands", name: "apple" %}

{%- comment -%} UI icons {%- endcomment -%}
{% include "partials/icon.liquid", category: "ui", name: "share" %}
{% include "partials/icon.liquid", category: "ui", name: "copy" %}

{%- comment -%} With custom CSS class {%- endcomment -%}
{% include "partials/icon.liquid", category: "ui", name: "rss", class: "rss-icon" %}
```

### Method 2: Direct Access

For more control, access the icon data directly:

```liquid
<svg viewBox="{{ icons.brands.spotify.viewBox }}" fill="currentColor">
  <path d="{{ icons.brands.spotify.path }}"/>
</svg>
```

## Available Icons

### Brands (`icons.brands`)

- `spotify` - Spotify logo
- `apple` - Apple Podcasts logo

### UI Icons (`icons.ui`)

- `share` - Share/upload icon
- `copy` - Copy/duplicate icon
- `externalLink` - External link arrow
- `rss` - RSS feed icon

## Adding New Icons

### Adding a Brand Icon (from npm)

Brand icons are automatically imported from the `simple-icons` npm package:

1. Find your brand at [Simple Icons](https://simpleicons.org/)
2. Note the icon name (e.g., "Google Podcasts" = `siGooglepodcasts`)
3. Add import and register in `src/_data/icons.js`:

```javascript
// Add to imports at top
import { siSpotify, siApplepodcasts, siGooglepodcasts } from 'simple-icons';

export default {
  brands: {
    spotify: brandIcon(siSpotify),
    apple: brandIcon(siApplepodcasts),
    googlePodcasts: brandIcon(siGooglepodcasts) // Your new icon
  }
};
```

**Find icon names:** [Simple Icons slugs list](https://github.com/simple-icons/simple-icons/blob/master/slugs.md)

All icons are automatically updated when you run `npm update simple-icons`!

### Adding a UI Icon

1. Find the icon at [Lucide](https://lucide.dev/)
2. Click "Copy SVG" and extract the path
3. Add to `src/_data/icons.js`:

```javascript
export default {
  ui: {
    yourIcon: {
      path: 'M4 12v8a2...', // SVG path
      viewBox: '0 0 24 24',
      name: 'Your Icon Name',
      strokeWidth: 2,
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }
  }
};
```

## Icon Styling

Icons use `currentColor` for fill/stroke, so they inherit the text color:

```css
/* Change icon color */
.my-icon {
  color: #ff0000;
}

/* Size icons */
.icon {
  width: 20px;
  height: 20px;
}

/* Brand-specific sizing */
.podcast-platform-icon {
  width: 20px;
  height: 20px;
}
```

## Why Not Font Awesome / Iconify?

For static sites like this one:

- ❌ **Font Awesome**: Hard to tree-shake, large bundle size
- ❌ **Iconify runtime**: Loads icons at runtime, unnecessary JavaScript
- ✅ **Manual SVGs**: Zero runtime cost, smallest possible bundle, full control

## Examples in the Codebase

- **Podcast platforms**: See `src/_includes/partials/podcast-platforms.liquid`
- **Icon component**: See `src/_includes/partials/icon.liquid`
- **Icon data**: See `src/_data/icons.js`

## Future Ideas

- Add more podcast platforms (Google Podcasts, Overcast, Pocket Casts)
- Add social media icons (Twitter, GitHub, etc.)
- Add share buttons with UI icons
- Add copy-to-clipboard functionality with the copy icon
