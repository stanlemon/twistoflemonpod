import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  readableDate,
  htmlDateString,
  dateToRfc3339,
  dateToRfc822,
  slugify,
  getAllCategories,
  getAllTags,
  excerpt,
  head
} from '../../lib/filters.js';

describe('Filter: readableDate', () => {
  it('formats Date object correctly', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    assert.strictEqual(readableDate(date), 'January 15, 2024');
  });

  it('formats ISO string correctly', () => {
    assert.strictEqual(readableDate('2024-01-15'), 'January 15, 2024');
  });

  it('handles null date', () => {
    assert.strictEqual(readableDate(null), '');
  });

  it('handles undefined date', () => {
    assert.strictEqual(readableDate(undefined), '');
  });

  it('handles invalid date string', () => {
    assert.strictEqual(readableDate('not a date'), '');
  });

  it('formats edge of epoch', () => {
    const epoch = new Date('1970-01-01T00:00:00Z');
    assert.strictEqual(readableDate(epoch), 'January 01, 1970');
  });
});

describe('Filter: htmlDateString', () => {
  it('formats Date object correctly', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    assert.strictEqual(htmlDateString(date), '2024-01-15');
  });

  it('formats ISO string correctly', () => {
    assert.strictEqual(htmlDateString('2024-01-15'), '2024-01-15');
  });

  it('handles null date', () => {
    assert.strictEqual(htmlDateString(null), '');
  });

  it('handles undefined date', () => {
    assert.strictEqual(htmlDateString(undefined), '');
  });

  it('handles invalid date string', () => {
    assert.strictEqual(htmlDateString('invalid'), '');
  });
});

describe('Filter: dateToRfc3339', () => {
  it('formats Date object to RFC3339', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    const result = dateToRfc3339(date);
    assert.ok(result.includes('2024-01-15'));
    assert.ok(result.includes('T'));
  });

  it('formats ISO string to RFC3339', () => {
    const result = dateToRfc3339('2024-01-15T12:00:00Z');
    assert.ok(result.includes('2024-01-15'));
  });

  it('handles null date', () => {
    assert.strictEqual(dateToRfc3339(null), '');
  });

  it('handles undefined date', () => {
    assert.strictEqual(dateToRfc3339(undefined), '');
  });

  it('handles invalid date', () => {
    assert.strictEqual(dateToRfc3339('bad date'), '');
  });
});

describe('Filter: dateToRfc822', () => {
  it('formats Date object to RFC2822', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    const result = dateToRfc822(date);
    assert.ok(result.includes('15 Jan 2024'));
  });

  it('handles null date', () => {
    assert.strictEqual(dateToRfc822(null), '');
  });

  it('handles undefined date', () => {
    assert.strictEqual(dateToRfc822(undefined), '');
  });

  it('handles invalid date', () => {
    assert.strictEqual(dateToRfc822('not valid'), '');
  });
});

describe('Filter: slugify', () => {
  it('converts to lowercase', () => {
    assert.strictEqual(slugify('Hello World'), 'hello-world');
  });

  it('trims whitespace', () => {
    assert.strictEqual(slugify('  hello  '), 'hello');
  });

  it('removes special characters', () => {
    assert.strictEqual(slugify('hello@world!'), 'helloworld');
  });

  it('replaces spaces with dashes', () => {
    assert.strictEqual(slugify('hello world test'), 'hello-world-test');
  });

  it('replaces multiple spaces with single dash', () => {
    assert.strictEqual(slugify('hello    world'), 'hello-world');
  });

  it('replaces underscores with dashes', () => {
    assert.strictEqual(slugify('hello_world'), 'hello-world');
  });

  it('normalizes multiple dashes', () => {
    assert.strictEqual(slugify('hello---world'), 'hello-world');
  });

  it('removes leading dashes', () => {
    assert.strictEqual(slugify('---hello'), 'hello');
  });

  it('removes trailing dashes', () => {
    assert.strictEqual(slugify('hello---'), 'hello');
  });

  it('handles empty string', () => {
    assert.strictEqual(slugify(''), '');
  });

  it('handles numbers', () => {
    assert.strictEqual(slugify('episode-123'), 'episode-123');
  });

  it('handles mixed case duplicates', () => {
    assert.strictEqual(slugify('Test'), slugify('test'));
    assert.strictEqual(slugify('Test'), slugify('TEST'));
  });

  it('handles special characters and spaces together', () => {
    assert.strictEqual(slugify('Hello & World!'), 'hello-world');
  });
});

describe('Filter: getAllCategories', () => {
  it('extracts unique categories from collection', () => {
    const collection = [
      { data: { categories: ['Tech', 'Life'] } },
      { data: { categories: ['Tech', 'Podcast'] } }
    ];
    const result = getAllCategories(collection);
    assert.deepStrictEqual(result, ['Life', 'Podcast', 'Tech']);
  });

  it('handles empty collection', () => {
    assert.deepStrictEqual(getAllCategories([]), []);
  });

  it('handles items without categories', () => {
    const collection = [
      { data: {} },
      { data: { categories: ['Tech'] } }
    ];
    const result = getAllCategories(collection);
    assert.deepStrictEqual(result, ['Tech']);
  });

  it('sorts categories alphabetically', () => {
    const collection = [
      { data: { categories: ['Zebra', 'Alpha', 'Mike'] } }
    ];
    const result = getAllCategories(collection);
    assert.deepStrictEqual(result, ['Alpha', 'Mike', 'Zebra']);
  });

  it('deduplicates categories', () => {
    const collection = [
      { data: { categories: ['Tech', 'Tech'] } },
      { data: { categories: ['Tech'] } }
    ];
    const result = getAllCategories(collection);
    assert.deepStrictEqual(result, ['Tech']);
  });
});

describe('Filter: getAllTags', () => {
  it('extracts unique tags from collection', () => {
    const collection = [
      { data: { tags: ['javascript', 'nodejs'] } },
      { data: { tags: ['javascript', 'web'] } }
    ];
    const result = getAllTags(collection);
    assert.deepStrictEqual(result, ['javascript', 'nodejs', 'web']);
  });

  it('handles empty collection', () => {
    assert.deepStrictEqual(getAllTags([]), []);
  });

  it('handles items without tags', () => {
    const collection = [
      { data: {} },
      { data: { tags: ['test'] } }
    ];
    const result = getAllTags(collection);
    assert.deepStrictEqual(result, ['test']);
  });

  it('sorts tags alphabetically', () => {
    const collection = [
      { data: { tags: ['zulu', 'alpha', 'bravo'] } }
    ];
    const result = getAllTags(collection);
    assert.deepStrictEqual(result, ['alpha', 'bravo', 'zulu']);
  });
});

describe('Filter: excerpt', () => {
  it('strips HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    assert.strictEqual(excerpt(html), 'Hello world');
  });

  it('truncates to default length', () => {
    const longText = 'a'.repeat(300);
    const result = excerpt(longText);
    assert.strictEqual(result.length, 203); // 200 + '...'
    assert.ok(result.endsWith('...'));
  });

  it('truncates to custom length', () => {
    const text = 'a'.repeat(100);
    const result = excerpt(text, 50);
    assert.strictEqual(result.length, 53); // 50 + '...'
  });

  it('does not truncate short content', () => {
    const text = 'Short text';
    assert.strictEqual(excerpt(text), 'Short text');
  });

  it('does not add ellipsis to exact length', () => {
    const text = 'a'.repeat(200);
    const result = excerpt(text, 200);
    assert.strictEqual(result, text);
  });

  it('handles empty content', () => {
    assert.strictEqual(excerpt(''), '');
  });

  it('strips complex HTML', () => {
    const html = '<div><p>Test</p><ul><li>Item</li></ul></div>';
    assert.strictEqual(excerpt(html), 'TestItem');
  });
});

describe('Filter: head', () => {
  it('returns first n items', () => {
    const arr = [1, 2, 3, 4, 5];
    assert.deepStrictEqual(head(arr, 3), [1, 2, 3]);
  });

  it('returns last n items with negative number', () => {
    const arr = [1, 2, 3, 4, 5];
    assert.deepStrictEqual(head(arr, -2), [4, 5]);
  });

  it('handles n larger than array length', () => {
    const arr = [1, 2, 3];
    assert.deepStrictEqual(head(arr, 10), [1, 2, 3]);
  });

  it('handles zero', () => {
    const arr = [1, 2, 3];
    assert.deepStrictEqual(head(arr, 0), []);
  });

  it('handles empty array', () => {
    assert.deepStrictEqual(head([], 5), []);
  });

  it('handles negative n larger than array length', () => {
    const arr = [1, 2, 3];
    assert.deepStrictEqual(head(arr, -10), [1, 2, 3]);
  });
});
