import dotenv from "dotenv";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginRss from "@11ty/eleventy-plugin-rss";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import Image from "@11ty/eleventy-img";
import * as filters from "./lib/filters.js";
import * as collections from "./lib/collections.js";
import siteData from "./src/_data/site.js";

// Load environment variables
dotenv.config();

export default function(eleventyConfig) {
  // Override site URL with environment variable if set
  // Use empty string for local dev, production URL otherwise
  eleventyConfig.addGlobalData("site", {
    ...siteData,
    url: process.env.SITE_URL !== undefined ? process.env.SITE_URL : siteData.url
  });
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  // Ignore documentation files
  eleventyConfig.ignores.add("CLAUDE.md");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("AGENTS.md");
  eleventyConfig.ignores.add("SEO-GUIDE.md");
  eleventyConfig.ignores.add("SECURITY-HEADERS.md");

  // Copy static assets
  eleventyConfig.addPassthroughCopy({
    "src/css": "css",
    "src/js": "js",
    "src/images": "images",
    "static": "."
  });

  // Copy Plyr CSS and JS
  eleventyConfig.addPassthroughCopy({
    "node_modules/plyr/dist/plyr.css": "css/plyr.css",
    "node_modules/plyr/dist/plyr.js": "js/plyr.js"
  });

  // Filters
  eleventyConfig.addFilter("readableDate", filters.readableDate);
  eleventyConfig.addFilter("htmlDateString", filters.htmlDateString);
  eleventyConfig.addFilter("dateToRfc3339", filters.dateToRfc3339);
  eleventyConfig.addFilter("dateToRfc822", filters.dateToRfc822);
  eleventyConfig.addFilter("slugify", filters.slugify);
  eleventyConfig.addFilter("getAllCategories", filters.getAllCategories);
  eleventyConfig.addFilter("getAllTags", filters.getAllTags);
  eleventyConfig.addFilter("excerpt", filters.excerpt);
  eleventyConfig.addFilter("head", filters.head);
  eleventyConfig.addFilter("findTranscript", filters.findTranscript);

  // Custom markdown library with anchor support
  let markdownLib = markdownIt({
    html: true,
    breaks: false,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: false
  });

  eleventyConfig.setLibrary("md", markdownLib);

  // Shortcode for responsive images
  eleventyConfig.addAsyncShortcode("image", async function(src, alt, sizes = "100vw") {
    if (!src) {
      return "";
    }

    let metadata = await Image(src, {
      widths: [300, 600, 900, 1200],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "./_site/img/",
      urlPath: "/img/"
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes);
  });

  // Transform caption shortcodes to figure/figcaption
  eleventyConfig.addTransform("transformCaptions", function(content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      // Transform [caption ...]...[/caption] to <figure><img/><figcaption>...</figcaption></figure>
      content = content.replace(
        /\[caption[^\]]*\](.*?)\[\/caption\]/gs,
        (match, inner) => {
          // Extract image and caption text
          const imgMatch = inner.match(/<img[^>]*>/);
          const img = imgMatch ? imgMatch[0] : '';
          const caption = inner.replace(/<img[^>]*>/, '').trim();

          if (img && caption) {
            return `<figure>${img}<figcaption>${caption}</figcaption></figure>`;
          }
          return inner;
        }
      );
    }
    return content;
  });

  // Collections
  eleventyConfig.addCollection("blog", collections.buildBlogCollection);
  eleventyConfig.addCollection("categories", collections.buildCategoriesCollection);
  eleventyConfig.addCollection("tags", collections.buildTagsCollection);
  eleventyConfig.addCollection("transcripts", collections.buildTranscriptsCollection);

  // Dev server configuration
  // Note: Using port 8081 instead of 8080 due to macOS Sonoma (14.x+) reserving port 8080
  // This fixes "Invalid WebSocket frame: RSV1 must be clear" errors
  eleventyConfig.setServerOptions({
    port: 8081,
    liveReload: true,
    domDiff: false,
  });

  return {
    dir: {
      input: ".",
      includes: "src/_includes",
      data: "src/_data",
      output: "_site"
    },
    templateFormats: ["md", "html", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    dataTemplateEngine: "liquid"
  };
};
