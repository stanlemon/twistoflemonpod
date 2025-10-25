const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const siteDir = path.join(__dirname, '..', '..', '_site');

describe('Build Validation', () => {
  it('should create _site directory', () => {
    assert.ok(fs.existsSync(siteDir), '_site directory should exist');
  });

  describe('Required files', () => {
    const requiredFiles = [
      'index.html',
      'feed.xml',
      'sitemap.xml',
      'css/plyr.css',
      'js/plyr.js',
      'css/main.css',
      'css/typography.css'
    ];

    requiredFiles.forEach(file => {
      it(`should generate ${file}`, () => {
        const filePath = path.join(siteDir, file);
        assert.ok(fs.existsSync(filePath), `${file} should exist`);
      });
    });
  });

  describe('Blog posts', () => {
    it('should generate at least 170 blog post directories', () => {
      const blogPosts = fs.readdirSync(siteDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(dirent.name))
        .length;

      assert.ok(blogPosts >= 170, `Expected at least 170 blog posts, found ${blogPosts}`);
    });
  });

  describe('Category pages', () => {
    const categoryDir = path.join(siteDir, 'category');

    it('should create category directory', () => {
      assert.ok(fs.existsSync(categoryDir), 'Category directory should exist');
    });

    it('should generate at least 10 category pages', () => {
      if (fs.existsSync(categoryDir)) {
        const categories = fs.readdirSync(categoryDir).length;
        assert.ok(categories >= 10, `Expected at least 10 categories, found ${categories}`);
      }
    });
  });

  describe('Tag pages', () => {
    const tagDir = path.join(siteDir, 'tag');

    it('should create tag directory', () => {
      assert.ok(fs.existsSync(tagDir), 'Tag directory should exist');
    });

    it('should generate at least 50 tag pages', () => {
      if (fs.existsSync(tagDir)) {
        const tags = fs.readdirSync(tagDir).length;
        assert.ok(tags >= 50, `Expected at least 50 tags, found ${tags}`);
      }
    });
  });

  describe('Pagination', () => {
    it('should generate at least 15 pagination pages', () => {
      const paginationPages = fs.readdirSync(siteDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && /^\d+$/.test(dirent.name))
        .length;

      assert.ok(paginationPages >= 15, `Expected at least 15 pagination pages, found ${paginationPages}`);
    });
  });
});
