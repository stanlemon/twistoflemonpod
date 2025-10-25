const fs = require('fs');
const path = require('path');

console.log('Running build validation tests...\n');

const siteDir = path.join(__dirname, '..', '_site');
let errors = 0;

// Check if _site directory exists
if (!fs.existsSync(siteDir)) {
  console.error('❌ _site directory does not exist. Build may have failed.');
  process.exit(1);
}

// Check for required files
const requiredFiles = [
  'index.html',
  'feed.xml',
  'sitemap.xml',
  'css/plyr.css',
  'js/plyr.js',
  'css/main.css',
  'css/typography.css'
];

console.log('Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(siteDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    errors++;
  }
});

// Count blog posts
const blogPosts = fs.readdirSync(siteDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(dirent.name))
  .length;

console.log(`\n✓ Found ${blogPosts} blog post directories`);

if (blogPosts < 170) {
  console.error(`❌ Expected at least 170 blog posts, found ${blogPosts}`);
  errors++;
}

// Check category pages
const categoryDir = path.join(siteDir, 'category');
if (fs.existsSync(categoryDir)) {
  const categories = fs.readdirSync(categoryDir).length;
  console.log(`✓ Found ${categories} category pages`);

  if (categories < 10) {
    console.error(`❌ Expected at least 10 categories, found ${categories}`);
    errors++;
  }
} else {
  console.error('❌ Category directory missing');
  errors++;
}

// Check tag pages
const tagDir = path.join(siteDir, 'tag');
if (fs.existsSync(tagDir)) {
  const tags = fs.readdirSync(tagDir).length;
  console.log(`✓ Found ${tags} tag pages`);

  if (tags < 50) {
    console.error(`❌ Expected at least 50 tags, found ${tags}`);
    errors++;
  }
} else {
  console.error('❌ Tag directory missing');
  errors++;
}

// Check pagination
const paginationPages = fs.readdirSync(siteDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && /^\d+$/.test(dirent.name))
  .length;

console.log(`✓ Found ${paginationPages} pagination pages`);

if (paginationPages < 15) {
  console.error(`❌ Expected at least 15 pagination pages, found ${paginationPages}`);
  errors++;
}

// Summary
console.log(`\n${'='.repeat(50)}`);
if (errors === 0) {
  console.log('✅ All build validation tests passed!');
  process.exit(0);
} else {
  console.error(`❌ ${errors} test(s) failed`);
  process.exit(1);
}
