const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

console.log('Running content validation tests...\n');

const blogDir = path.join(__dirname, '..', 'content', 'blog');
let errors = 0;
let warnings = 0;
let postsChecked = 0;

function checkPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdown } = matter(content);
  const relativePath = path.relative(blogDir, filePath);

  postsChecked++;

  // Required fields
  if (!data.title) {
    console.error(`❌ ${relativePath}: Missing title`);
    errors++;
  }

  if (!data.date) {
    console.error(`❌ ${relativePath}: Missing date`);
    errors++;
  }

  // Warn about missing optional fields
  if (!data.episode) {
    console.warn(`⚠️  ${relativePath}: Missing episode number`);
    warnings++;
  }

  if (!data.categories || data.categories.length === 0) {
    console.warn(`⚠️  ${relativePath}: Missing categories`);
    warnings++;
  }

  if (!data.tags || data.tags.length === 0) {
    console.warn(`⚠️  ${relativePath}: Missing tags`);
    warnings++;
  }

  // Check for enclosure if episode number exists
  if (data.episode && (!data.enclosure || !data.enclosure.url)) {
    console.warn(`⚠️  ${relativePath}: Episode ${data.episode} missing audio enclosure`);
    warnings++;
  }

  // Check for empty content
  if (!markdown || markdown.trim().length === 0) {
    console.warn(`⚠️  ${relativePath}: Empty content`);
    warnings++;
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      checkPost(fullPath);
    }
  }
}

try {
  scanDirectory(blogDir);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Checked ${postsChecked} posts`);

  if (errors === 0) {
    console.log('✅ All content validation tests passed!');
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warning(s) - non-critical issues`);
    }
    process.exit(0);
  } else {
    console.error(`❌ ${errors} error(s) found`);
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warning(s)`);
    }
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error running content tests:', error.message);
  process.exit(1);
}
