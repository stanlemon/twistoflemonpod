const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  // Copy static assets
  eleventyConfig.addPassthroughCopy({
    "src/css": "css",
    "src/images": "images",
    "static": "."
  });

  // Copy Plyr CSS and JS
  eleventyConfig.addPassthroughCopy({
    "node_modules/plyr/dist/plyr.css": "css/plyr.css",
    "node_modules/plyr/dist/plyr.js": "js/plyr.js"
  });

  // Filters
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("MMMM dd, yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-MM-dd');
  });

  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toISO();
  });

  eleventyConfig.addFilter("dateToRfc822", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toRFC2822();
  });

  // Slugify filter for categories and tags
  eleventyConfig.addFilter("slugify", (str) => {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  });

  // Get all unique categories
  eleventyConfig.addFilter("getAllCategories", collection => {
    let categories = new Set();
    collection.forEach(item => {
      (item.data.categories || []).forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  });

  // Get all unique tags
  eleventyConfig.addFilter("getAllTags", collection => {
    let tags = new Set();
    collection.forEach(item => {
      (item.data.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  // Excerpt filter
  eleventyConfig.addFilter("excerpt", (content, length = 200) => {
    const text = content.replace(/<[^>]+>/g, '');
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  });

  // Head filter - limit array to first n items
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

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
  eleventyConfig.addCollection("blog", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/blog/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Category collections - normalized by slug to avoid duplicates
  eleventyConfig.addCollection("categories", function(collectionApi) {
    let categories = {};
    const slugify = (str) => String(str).toLowerCase().trim()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    collectionApi.getFilteredByGlob("content/blog/**/*.md").forEach(item => {
      (item.data.categories || []).forEach(category => {
        const slug = slugify(category);
        if (!categories[slug]) {
          categories[slug] = {
            name: category, // Keep the first occurrence's capitalization
            slug: slug,
            posts: []
          };
        }
        categories[slug].posts.push(item);
      });
    });

    // Sort posts in each category by date
    Object.keys(categories).forEach(key => {
      categories[key].posts.sort((a, b) => b.date - a.date);
    });

    return categories;
  });

  // Tag collections - normalized by slug to avoid duplicates
  eleventyConfig.addCollection("tags", function(collectionApi) {
    let tags = {};
    const slugify = (str) => String(str).toLowerCase().trim()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    collectionApi.getFilteredByGlob("content/blog/**/*.md").forEach(item => {
      (item.data.tags || []).forEach(tag => {
        const slug = slugify(tag);
        if (!tags[slug]) {
          tags[slug] = {
            name: tag, // Keep the first occurrence's capitalization
            slug: slug,
            posts: []
          };
        }
        tags[slug].posts.push(item);
      });
    });

    // Sort posts in each tag by date
    Object.keys(tags).forEach(key => {
      tags[key].posts.sort((a, b) => b.date - a.date);
    });

    return tags;
  });

  return {
    dir: {
      input: ".",
      includes: "src/_includes",
      data: "src/_data",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
