/**
 * Icon data organized by category.
 *
 * Brand icons imported from Simple Icons npm package (https://simpleicons.org/)
 * UI icons manually added from Lucide (https://lucide.dev/)
 *
 * All icons use 24x24 viewBox unless noted otherwise.
 */

import { siSpotify, siApplepodcasts, siYoutubemusic, siIheartradio, siTunein } from 'simple-icons';

/**
 * Helper to convert Simple Icons format to our format
 */
function brandIcon(icon) {
  return {
    path: icon.path,
    viewBox: '0 0 24 24',
    name: icon.title
  };
}

export default {
  brands: {
    // Brand icons automatically imported from Simple Icons npm package
    // Add new brands by importing from 'simple-icons' and adding here
    // Find icon names at: https://github.com/simple-icons/simple-icons/blob/master/slugs.md
    spotify: brandIcon(siSpotify),
    apple: brandIcon(siApplepodcasts),
    youtubeMusic: brandIcon(siYoutubemusic),
    iheart: brandIcon(siIheartradio),
    tunein: brandIcon(siTunein)
  },

  ui: {
    // Share icon from Lucide
    share: {
      path: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
      viewBox: '0 0 24 24',
      name: 'Share',
      strokeWidth: 2,
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },

    // Copy icon from Lucide
    copy: {
      path: 'M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2zM16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2',
      viewBox: '0 0 24 24',
      name: 'Copy',
      strokeWidth: 2,
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },

    // External link icon from Lucide
    externalLink: {
      path: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
      viewBox: '0 0 24 24',
      name: 'External Link',
      strokeWidth: 2,
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },

    // RSS icon from Lucide
    rss: {
      path: 'M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
      viewBox: '0 0 24 24',
      name: 'RSS',
      strokeWidth: 2,
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }
  }
};
