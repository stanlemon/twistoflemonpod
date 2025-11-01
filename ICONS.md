# Icon System

This project uses a manual SVG icon system for maximum performance and tree-shaking.

## Philosophy

- **Zero runtime JavaScript** - All icons are static SVGs
- **Only what you need** - Add icons as needed to `src/_data/icons.js`
- **Two categories**: Brand logos and UI icons
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

### Adding a Brand Icon

1. Find the icon at [Simple Icons](https://simpleicons.org/)
2. Copy the SVG path
3. Add to `src/_data/icons.js`:

```javascript
export default {
  brands: {
    yourBrand: {
      path: 'M12 0C5.4 0...', // SVG path
      viewBox: '0 0 24 24',
      name: 'Your Brand Name'
    }
  }
};
```

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
