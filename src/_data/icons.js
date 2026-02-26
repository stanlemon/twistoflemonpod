/**
 * Icon data organized by category.
 *
 * Brand icons imported from Simple Icons npm package (https://simpleicons.org/)
 * UI icons manually added from Lucide (https://lucide.dev/)
 *
 * All icons use 24x24 viewBox unless noted otherwise.
 */

import {
  siSpotify,
  siApplepodcasts,
  siYoutubemusic,
  siIheartradio,
  siOvercast,
} from "simple-icons";

/**
 * Helper to convert Simple Icons format to our format
 */
function brandIcon(icon) {
  return {
    path: icon.path,
    viewBox: "0 0 24 24",
    name: icon.title,
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
    // Custom TuneIn icon (removed from Simple Icons in v16)
    tunein: {
      path: "M7.66 11.398v.742c0 .105-.11.105-.11.105h-.847s-.11 0-.11.11v4.03c0 .11-.105.11-.105.11h-.855c-.106 0-.106-.11-.106-.11v-4.03s0-.11-.109-.11h-.844c-.105 0-.105-.105-.105-.105v-.742c0-.106.105-.106.105-.106H7.66v.106m15.458-7.52H12.301c-.68 0-.836.16-.836.816v2.414c0 .493 0 .493-.492.493H.813C.137 7.6 0 7.737 0 8.425v5.41c0 1.754 0 3.508.023 5.266 0 .922.102 1.02 1.04 1.02H9.89c.664 0 1.32.01 1.984-.01.48-.006.669-.202.669-.682v-2.56c0-.468 0-.468.469-.468h10.195c.633 0 .793-.152.793-.78V4.736c0-.7-.164-.86-.883-.86zm-11.64 14.625c0 .5-.013.5-.525.5-3.148 0-6.293 0-9.445.008-.32 0-.43-.078-.43-.418.016-3.16.008-6.324 0-9.48-.008-.34.086-.446.442-.446 3.187.012 6.363.008 9.55.008.117 0 .23.015.4.023 0 .18 0 .32.01.442-.003 3.113-.003 6.242-.003 9.363zm7.69-5.844c0 .102-.104.102-.104.102h-2.57c-.106 0-.106-.102-.106-.102v-.72c0-.1.105-.1.105-.1h.617s.102 0 .102-.102V8.659s0-.101-.102-.101h-.515c-.102 0-.102-.102-.102-.102v-.82c0-.106.102-.106.102-.106h2.367c.102 0 .102.106.102.106v.715c0 .105-.102.105-.102.105h-.516s-.101 0-.101.102v3.074s0 .105.1.105h.618c.106 0 .106.102.106.102z",
      viewBox: "0 0 24 24",
      name: "TuneIn",
    },
    overcast: brandIcon(siOvercast),

    // Custom Amazon Music icon (not available in Simple Icons)
    // Features the iconic Amazon smile/arrow logo
    amazonMusic: {
      path: "M 4 13 Q 12 16 20 13 L 20 15 Q 12 18 4 15 Z M 19 11.5 L 21.5 14 L 19 16.5 Z",
      viewBox: "0 0 24 24",
      name: "Amazon Music",
    },
  },

  ui: {
    // Share icon from Lucide
    share: {
      path: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
      viewBox: "0 0 24 24",
      name: "Share",
      strokeWidth: 2,
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },

    // Copy icon from Lucide
    copy: {
      path: "M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2zM16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2",
      viewBox: "0 0 24 24",
      name: "Copy",
      strokeWidth: 2,
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },

    // External link icon from Lucide
    externalLink: {
      path: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
      viewBox: "0 0 24 24",
      name: "External Link",
      strokeWidth: 2,
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },

    // RSS icon from Lucide
    rss: {
      path: "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2z",
      viewBox: "0 0 24 24",
      name: "RSS",
      strokeWidth: 2,
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
  },
};
