const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(__dirname, '../content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

const categoryCount = new Map();
const tagCount = new Map();

console.log(`Analyzing ${files.length} markdown files...\n`);

// Process each file
files.forEach(file => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);

  // Count categories
  if (data.categories && Array.isArray(data.categories)) {
    data.categories.forEach(category => {
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });
  }

  // Count tags
  if (data.tags && Array.isArray(data.tags)) {
    data.tags.forEach(tag => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  }
});

// Sort alphabetically
const sortedCategories = Array.from(categoryCount.entries())
  .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));

const sortedTags = Array.from(tagCount.entries())
  .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));

// Output to console
console.log('📁 CATEGORIES');
console.log('═'.repeat(50));
sortedCategories.forEach(([category, count]) => {
  console.log(`${category.padEnd(30)} (${count} posts)`);
});

console.log('\n🏷️  TAGS');
console.log('═'.repeat(50));
sortedTags.forEach(([tag, count]) => {
  console.log(`${tag.padEnd(30)} (${count} posts)`);
});

// Output to JSON if --json flag is present
if (process.argv.includes('--json')) {
  const output = {
    categories: sortedCategories.map(([name, count]) => ({ name, count })),
    tags: sortedTags.map(([name, count]) => ({ name, count }))
  };

  const outputPath = path.join(__dirname, '../categories-and-tags.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ JSON output written to: ${outputPath}`);
}
