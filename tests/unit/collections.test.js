const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  buildNormalizedCollection,
  buildCategoriesCollection,
  buildTagsCollection,
  buildBlogCollection
} = require('../../lib/collections');

describe('Collections: buildNormalizedCollection', () => {
  it('normalizes items by slug', () => {
    const items = [
      { data: { categories: ['Tech'] }, date: new Date('2024-01-01') },
      { data: { categories: ['Life'] }, date: new Date('2024-01-02') }
    ];
    const result = buildNormalizedCollection(items, 'categories');

    assert.ok(result.tech);
    assert.strictEqual(result.tech.name, 'Tech');
    assert.strictEqual(result.tech.slug, 'tech');
    assert.strictEqual(result.tech.posts.length, 1);

    assert.ok(result.life);
    assert.strictEqual(result.life.name, 'Life');
    assert.strictEqual(result.life.slug, 'life');
  });

  it('deduplicates by slug with mixed case', () => {
    const items = [
      { data: { categories: ['Tech'] }, date: new Date('2024-01-01') },
      { data: { categories: ['tech'] }, date: new Date('2024-01-02') },
      { data: { categories: ['TECH'] }, date: new Date('2024-01-03') }
    ];
    const result = buildNormalizedCollection(items, 'categories');

    assert.strictEqual(Object.keys(result).length, 1);
    assert.ok(result.tech);
    assert.strictEqual(result.tech.name, 'Tech'); // First occurrence's capitalization
    assert.strictEqual(result.tech.posts.length, 3);
  });

  it('preserves first occurrence capitalization', () => {
    const items = [
      { data: { tags: ['JavaScript'] }, date: new Date('2024-01-01') },
      { data: { tags: ['javascript'] }, date: new Date('2024-01-02') }
    ];
    const result = buildNormalizedCollection(items, 'tags');

    assert.strictEqual(result.javascript.name, 'JavaScript');
  });

  it('sorts posts by date (newest first)', () => {
    const items = [
      { data: { categories: ['Tech'] }, date: new Date('2024-01-01') },
      { data: { categories: ['Tech'] }, date: new Date('2024-01-05') },
      { data: { categories: ['Tech'] }, date: new Date('2024-01-03') }
    ];
    const result = buildNormalizedCollection(items, 'categories');

    assert.strictEqual(result.tech.posts.length, 3);
    assert.strictEqual(result.tech.posts[0].date.getTime(), new Date('2024-01-05').getTime());
    assert.strictEqual(result.tech.posts[1].date.getTime(), new Date('2024-01-03').getTime());
    assert.strictEqual(result.tech.posts[2].date.getTime(), new Date('2024-01-01').getTime());
  });

  it('handles items without the specified field', () => {
    const items = [
      { data: {}, date: new Date('2024-01-01') },
      { data: { categories: ['Tech'] }, date: new Date('2024-01-02') }
    ];
    const result = buildNormalizedCollection(items, 'categories');

    assert.strictEqual(Object.keys(result).length, 1);
    assert.ok(result.tech);
  });

  it('handles empty collection', () => {
    const result = buildNormalizedCollection([], 'categories');
    assert.deepStrictEqual(result, {});
  });

  it('handles special characters in values', () => {
    const items = [
      { data: { tags: ['C++'] }, date: new Date('2024-01-01') },
      { data: { tags: ['Node.js'] }, date: new Date('2024-01-02') }
    ];
    const result = buildNormalizedCollection(items, 'tags');

    assert.ok(result.c);
    assert.strictEqual(result.c.name, 'C++');
    assert.ok(result.nodejs);
    assert.strictEqual(result.nodejs.name, 'Node.js');
  });

  it('handles multiple values per item', () => {
    const items = [
      { data: { categories: ['Tech', 'Podcast', 'Life'] }, date: new Date('2024-01-01') }
    ];
    const result = buildNormalizedCollection(items, 'categories');

    assert.strictEqual(Object.keys(result).length, 3);
    assert.ok(result.tech);
    assert.ok(result.podcast);
    assert.ok(result.life);
    assert.strictEqual(result.tech.posts.length, 1);
  });
});

describe('Collections: buildBlogCollection', () => {
  it('returns sorted collection', () => {
    const mockApi = {
      getFilteredByGlob: (pattern) => {
        assert.strictEqual(pattern, 'content/blog/**/*.md');
        return [
          { date: new Date('2024-01-01'), data: { title: 'Post 1' } },
          { date: new Date('2024-01-05'), data: { title: 'Post 2' } },
          { date: new Date('2024-01-03'), data: { title: 'Post 3' } }
        ];
      }
    };

    const result = buildBlogCollection(mockApi);

    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].data.title, 'Post 2'); // Newest first
    assert.strictEqual(result[1].data.title, 'Post 3');
    assert.strictEqual(result[2].data.title, 'Post 1');
  });

  it('handles empty glob result', () => {
    const mockApi = {
      getFilteredByGlob: () => []
    };

    const result = buildBlogCollection(mockApi);
    assert.deepStrictEqual(result, []);
  });
});

describe('Collections: buildCategoriesCollection', () => {
  it('builds categories from blog posts', () => {
    const mockApi = {
      getFilteredByGlob: (pattern) => {
        assert.strictEqual(pattern, 'content/blog/**/*.md');
        return [
          { data: { categories: ['Tech', 'Podcast'] }, date: new Date('2024-01-01') },
          { data: { categories: ['Life'] }, date: new Date('2024-01-02') }
        ];
      }
    };

    const result = buildCategoriesCollection(mockApi);

    assert.ok(result.tech);
    assert.ok(result.podcast);
    assert.ok(result.life);
    assert.strictEqual(result.tech.posts.length, 1);
    assert.strictEqual(result.podcast.posts.length, 1);
  });

  it('handles duplicate categories with different case', () => {
    const mockApi = {
      getFilteredByGlob: () => [
        { data: { categories: ['Tech'] }, date: new Date('2024-01-01') },
        { data: { categories: ['TECH'] }, date: new Date('2024-01-02') }
      ]
    };

    const result = buildCategoriesCollection(mockApi);

    assert.strictEqual(Object.keys(result).length, 1);
    assert.strictEqual(result.tech.posts.length, 2);
  });
});

describe('Collections: buildTagsCollection', () => {
  it('builds tags from blog posts', () => {
    const mockApi = {
      getFilteredByGlob: (pattern) => {
        assert.strictEqual(pattern, 'content/blog/**/*.md');
        return [
          { data: { tags: ['javascript', 'nodejs'] }, date: new Date('2024-01-01') },
          { data: { tags: ['web'] }, date: new Date('2024-01-02') }
        ];
      }
    };

    const result = buildTagsCollection(mockApi);

    assert.ok(result.javascript);
    assert.ok(result.nodejs);
    assert.ok(result.web);
    assert.strictEqual(result.javascript.posts.length, 1);
  });

  it('handles duplicate tags with different case', () => {
    const mockApi = {
      getFilteredByGlob: () => [
        { data: { tags: ['JavaScript'] }, date: new Date('2024-01-01') },
        { data: { tags: ['javascript'] }, date: new Date('2024-01-02') }
      ]
    };

    const result = buildTagsCollection(mockApi);

    assert.strictEqual(Object.keys(result).length, 1);
    assert.strictEqual(result.javascript.posts.length, 2);
    assert.strictEqual(result.javascript.name, 'JavaScript'); // First occurrence
  });
});
