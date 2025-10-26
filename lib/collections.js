import { slugify } from './filters.js';

/**
 * Build collection with normalized slugs to avoid duplicates
 * @param {Array} items - Collection items
 * @param {string} fieldName - Field name ('categories' or 'tags')
 * @returns {Object} Object with slugs as keys and metadata as values
 */
function buildNormalizedCollection(items, fieldName) {
  let collection = {};

  items.forEach(item => {
    (item.data[fieldName] || []).forEach(value => {
      const slug = slugify(value);
      if (!collection[slug]) {
        collection[slug] = {
          name: value, // Keep the first occurrence's capitalization
          slug: slug,
          posts: []
        };
      }
      collection[slug].posts.push(item);
    });
  });

  // Sort posts in each collection item by date (newest first)
  Object.keys(collection).forEach(key => {
    collection[key].posts.sort((a, b) => b.date - a.date);
  });

  return collection;
}

/**
 * Build categories collection with normalized slugs
 * @param {Object} collectionApi - Eleventy collection API
 * @returns {Object} Categories collection
 */
function buildCategoriesCollection(collectionApi) {
  const items = collectionApi.getFilteredByGlob("content/blog/**/*.md")
    .filter(item => item.data.type !== 'transcript');
  return buildNormalizedCollection(items, 'categories');
}

/**
 * Build tags collection with normalized slugs
 * @param {Object} collectionApi - Eleventy collection API
 * @returns {Object} Tags collection
 */
function buildTagsCollection(collectionApi) {
  const items = collectionApi.getFilteredByGlob("content/blog/**/*.md")
    .filter(item => item.data.type !== 'transcript');
  return buildNormalizedCollection(items, 'tags');
}

/**
 * Build blog collection sorted by date
 * @param {Object} collectionApi - Eleventy collection API
 * @returns {Array} Blog posts sorted by date (newest first)
 */
function buildBlogCollection(collectionApi) {
  return collectionApi.getFilteredByGlob("content/blog/**/*.md")
    .filter(item => item.data.type !== 'transcript')
    .sort((a, b) => b.date - a.date);
}

/**
 * Build transcripts collection
 * @param {Object} collectionApi - Eleventy collection API
 * @returns {Array} Transcripts sorted by episode
 */
function buildTranscriptsCollection(collectionApi) {
  return collectionApi.getFilteredByGlob("content/blog/**/*.md")
    .filter(item => item.data.type === 'transcript')
    .sort((a, b) => (a.data.episode || 0) - (b.data.episode || 0));
}

export {
  buildNormalizedCollection,
  buildCategoriesCollection,
  buildTagsCollection,
  buildBlogCollection,
  buildTranscriptsCollection
};
