const fs = require('fs');
const path = require('path');

// Function to parse frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  return match[1];
}

// Function to extract categories and tags from frontmatter
function extractCategoriesAndTags(frontmatterText) {
  const categories = [];
  const tags = [];

  // Extract categories
  const categoriesMatch = frontmatterText.match(/^categories:\s*\n((?:\s+-\s*"[^"]+"\s*\n?)+)/m);
  if (categoriesMatch) {
    const categoryLines = categoriesMatch[1].match(/- "([^"]+)"/g);
    if (categoryLines) {
      categoryLines.forEach(line => {
        const match = line.match(/- "([^"]+)"/);
        if (match) categories.push(match[1]);
      });
    }
  }

  // Extract tags
  const tagsMatch = frontmatterText.match(/^tags:\s*\n((?:\s+-\s*"[^"]+"\s*\n?)+)/m);
  if (tagsMatch) {
    const tagLines = tagsMatch[1].match(/- "([^"]+)"/g);
    if (tagLines) {
      tagLines.forEach(line => {
        const match = line.match(/- "([^"]+)"/);
        if (match) tags.push(match[1]);
      });
    }
  }

  return { categories, tags };
}

// Function to recursively find all markdown files
function findMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });

  return results;
}

// Main function
function generateCategoriesAndTagsList(outputFormat = 'text') {
  const blogDir = path.join(__dirname, '../content/blog');
  const files = findMarkdownFiles(blogDir);

  console.log(`Analyzing ${files.length} markdown files...\n`);

  const allCategories = new Set();
  const allTags = new Set();
  const categoryUsage = new Map(); // Track usage count
  const tagUsage = new Map();

  files.forEach((file) => {
    const filename = path.basename(file, '.md');
    const content = fs.readFileSync(file, 'utf8');
    const frontmatter = parseFrontmatter(content);

    if (frontmatter) {
      const { categories, tags } = extractCategoriesAndTags(frontmatter);

      categories.forEach(cat => {
        allCategories.add(cat);
        categoryUsage.set(cat, (categoryUsage.get(cat) || 0) + 1);
      });

      tags.forEach(tag => {
        allTags.add(tag);
        tagUsage.set(tag, (tagUsage.get(tag) || 0) + 1);
      });
    }
  });

  // Convert to sorted arrays
  const categoriesList = Array.from(allCategories).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  const tagsList = Array.from(allTags).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  // Prepare output
  const output = {
    summary: {
      totalPosts: files.length,
      uniqueCategories: categoriesList.length,
      uniqueTags: tagsList.length,
      generatedAt: new Date().toISOString()
    },
    categories: categoriesList.map(cat => ({
      name: cat,
      count: categoryUsage.get(cat)
    })),
    tags: tagsList.map(tag => ({
      name: tag,
      count: tagUsage.get(tag)
    }))
  };

  // Output based on format
  if (outputFormat === 'json') {
    const outputPath = path.join(__dirname, '../categories-and-tags.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`✅ JSON output written to: ${outputPath}\n`);
  }

  // Always print to console
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Total blog posts analyzed: ${output.summary.totalPosts}`);
  console.log(`Unique categories: ${output.summary.uniqueCategories}`);
  console.log(`Unique tags: ${output.summary.uniqueTags}`);

  console.log('\n📁 CATEGORIES (sorted alphabetically)');
  console.log('═══════════════════════════════════════════');
  output.categories.forEach(cat => {
    console.log(`${cat.name.padEnd(30)} (${cat.count} posts)`);
  });

  console.log('\n🏷️  TAGS (sorted alphabetically)');
  console.log('═══════════════════════════════════════════');
  output.tags.forEach(tag => {
    console.log(`${tag.name.padEnd(30)} (${tag.count} posts)`);
  });

  // Top categories and tags
  const topCategories = output.categories
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topTags = output.tags
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  console.log('\n⭐ TOP 10 CATEGORIES BY USAGE');
  console.log('═══════════════════════════════════════════');
  topCategories.forEach((cat, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${cat.name.padEnd(25)} (${cat.count} posts)`);
  });

  console.log('\n⭐ TOP 20 TAGS BY USAGE');
  console.log('═══════════════════════════════════════════');
  topTags.forEach((tag, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${tag.name.padEnd(35)} (${tag.count} posts)`);
  });

  return output;
}

// Check for output format flag
const outputFormat = process.argv.includes('--json') ? 'json' : 'text';
generateCategoriesAndTagsList(outputFormat);
