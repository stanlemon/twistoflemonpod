import { describe, test } from 'node:test';
import assert from 'node:assert';
import { parseDate, formatDateForDir } from '../../scripts/lib/utils.js';

describe('Utils: parseDate', () => {
  test('should parse date string and set time to 6am UTC', () => {
    const date = parseDate('2024-11-20');
    
    // Check the date components
    assert.strictEqual(date.getUTCFullYear(), 2024);
    assert.strictEqual(date.getUTCMonth(), 10); // November (0-indexed)
    assert.strictEqual(date.getUTCDate(), 20);
    
    // Check the time is set to 6am UTC
    assert.strictEqual(date.getUTCHours(), 6);
    assert.strictEqual(date.getUTCMinutes(), 0);
    assert.strictEqual(date.getUTCSeconds(), 0);
  });

  test('should handle different dates correctly', () => {
    const date1 = parseDate('2023-01-01');
    assert.strictEqual(date1.getUTCFullYear(), 2023);
    assert.strictEqual(date1.getUTCMonth(), 0);
    assert.strictEqual(date1.getUTCDate(), 1);
    assert.strictEqual(date1.getUTCHours(), 6);

    const date2 = parseDate('2025-12-31');
    assert.strictEqual(date2.getUTCFullYear(), 2025);
    assert.strictEqual(date2.getUTCMonth(), 11);
    assert.strictEqual(date2.getUTCDate(), 31);
    assert.strictEqual(date2.getUTCHours(), 6);
  });

  test('should produce correct ISO string format', () => {
    const date = parseDate('2024-11-20');
    const isoString = date.toISOString();
    
    // Should be 2024-11-20T06:00:00.000Z
    assert.strictEqual(isoString, '2024-11-20T06:00:00.000Z');
  });
});

describe('Utils: formatDateForDir', () => {
  test('should format date correctly for directory name', () => {
    const date = parseDate('2024-11-20');
    const formatted = formatDateForDir(date);
    
    assert.strictEqual(formatted, '2024-11-20');
  });

  test('should handle single digit months and days', () => {
    const date = parseDate('2024-01-05');
    const formatted = formatDateForDir(date);
    
    assert.strictEqual(formatted, '2024-01-05');
  });
});
