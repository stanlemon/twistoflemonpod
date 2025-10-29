import { DateTime } from "luxon";

/**
 * Format date as human-readable string (MMMM dd, yyyy)
 * @param {Date|string} dateObj - Date object or ISO string
 * @returns {string} Formatted date or empty string if invalid
 */
function readableDate(dateObj) {
  if (!dateObj) return '';
  const dt = dateObj instanceof Date
    ? DateTime.fromJSDate(dateObj, {zone: 'utc'})
    : DateTime.fromISO(dateObj, {zone: 'utc'});
  return dt.isValid ? dt.toFormat("MMMM dd, yyyy") : '';
}

/**
 * Format date as HTML date string (yyyy-MM-dd)
 * @param {Date|string} dateObj - Date object or ISO string
 * @returns {string} HTML date string or empty string if invalid
 */
function htmlDateString(dateObj) {
  if (!dateObj) return '';
  const dt = dateObj instanceof Date
    ? DateTime.fromJSDate(dateObj, {zone: 'utc'})
    : DateTime.fromISO(dateObj, {zone: 'utc'});
  return dt.isValid ? dt.toFormat('yyyy-MM-dd') : '';
}

/**
 * Format date as RFC3339/ISO 8601 string
 * @param {Date|string} dateObj - Date object or ISO string
 * @returns {string} RFC3339 string or empty string if invalid
 */
function dateToRfc3339(dateObj) {
  if (!dateObj) return '';
  const dt = dateObj instanceof Date
    ? DateTime.fromJSDate(dateObj, {zone: 'utc'})
    : DateTime.fromISO(dateObj, {zone: 'utc'});
  return dt.isValid ? dt.toISO() : '';
}

/**
 * Format date as RFC2822 string
 * @param {Date|string} dateObj - Date object or ISO string
 * @returns {string} RFC2822 string or empty string if invalid
 */
function dateToRfc822(dateObj) {
  if (!dateObj) return '';
  const dt = dateObj instanceof Date
    ? DateTime.fromJSDate(dateObj, {zone: 'utc'})
    : DateTime.fromISO(dateObj, {zone: 'utc'});
  return dt.isValid ? dt.toRFC2822() : '';
}

/**
 * Convert string to URL-safe slug
 * @param {string} str - String to slugify
 * @returns {string} URL-safe slug
 */
function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get all unique categories from collection
 * @param {Array} collection - Collection of items with categories
 * @returns {Array<string>} Sorted array of unique categories
 */
function getAllCategories(collection) {
  let categories = new Set();
  collection.forEach(item => {
    (item.data.categories || []).forEach(cat => categories.add(cat));
  });
  return Array.from(categories).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

/**
 * Get all unique tags from collection
 * @param {Array} collection - Collection of items with tags
 * @returns {Array<string>} Sorted array of unique tags
 */
function getAllTags(collection) {
  let tags = new Set();
  collection.forEach(item => {
    (item.data.tags || []).forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

/**
 * Extract excerpt from content
 * @param {string} content - HTML content
 * @param {number} length - Maximum length (default 200)
 * @returns {string} Excerpt text
 */
function excerpt(content, length = 200) {
  const text = content.replace(/<[^>]+>/g, '');
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Get first or last n items from array
 * @param {Array} array - Input array
 * @param {number} n - Number of items (negative for last n)
 * @returns {Array} Sliced array
 */
function head(array, n) {
  if (n < 0) {
    return array.slice(n);
  }
  return array.slice(0, n);
}

/**
 * Find transcript for a given post by episode number
 * @param {Object} collections - Eleventy collections
 * @param {number} episode - Episode number
 * @returns {Object|null} Transcript page object or null if not found
 */
function findTranscript(collections, episode) {
  if (!episode || !collections.transcripts) return null;
  return collections.transcripts.find(t => t.data.episode === episode) || null;
}

/**
 * Convert relative URLs to absolute URLs for RSS feeds
 * @param {string} content - HTML content
 * @param {string} baseUrl - Base URL (e.g., https://example.com)
 * @returns {string} Content with absolute URLs
 */
function absoluteUrls(content, baseUrl) {
  if (!content || !baseUrl) return content;

  // Remove trailing slash from baseUrl
  const base = baseUrl.replace(/\/$/, '');

  // Replace src="/..." with src="baseUrl/..."
  content = content.replace(/src="\/([^"]+)"/g, `src="${base}/$1"`);

  // Replace href="/..." with href="baseUrl/..."
  content = content.replace(/href="\/([^"]+)"/g, `href="${base}/$1"`);

  return content;
}

/**
 * Remove content marked for feed exclusion
 * Content between <!-- feed-exclude-start --> and <!-- feed-exclude-end --> will be removed
 * @param {string} content - HTML content
 * @returns {string} Content with excluded sections removed
 */
function excludeFromFeed(content) {
  if (!content) return content;

  // Remove content between feed-exclude markers
  return content.replace(/<!--\s*feed-exclude-start\s*-->[\s\S]*?<!--\s*feed-exclude-end\s*-->/g, '');
}

export {
  readableDate,
  htmlDateString,
  dateToRfc3339,
  dateToRfc822,
  slugify,
  getAllCategories,
  getAllTags,
  excerpt,
  head,
  findTranscript,
  absoluteUrls,
  excludeFromFeed
};
