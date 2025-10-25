const { DateTime } = require("luxon");

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
  return Array.from(categories).sort();
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
  return Array.from(tags).sort();
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

module.exports = {
  readableDate,
  htmlDateString,
  dateToRfc3339,
  dateToRfc822,
  slugify,
  getAllCategories,
  getAllTags,
  excerpt,
  head
};
