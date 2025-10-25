const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Find all markdown files in content/blog
function findMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
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

// Update enclosure URL from S3 to media CDN
function updateEnclosureUrl(url) {
  if (!url) return url;

  // Match the old S3 URL pattern and extract filename
  const oldPattern = /https:\/\/twistoflemonpod\.s3\.us-east-2\.amazonaws\.com\/episodes\/(.+)/;
  const match = url.match(oldPattern);

  if (match) {
    const filename = match[1]; // Extract filename verbatim
    return `https://media.twistoflemonpod.com/${filename}`;
  }

  return url; // Return unchanged if pattern doesn't match
}

// Main function
function main() {
  const contentDir = path.join(__dirname, '..', 'content', 'blog');
  const files = findMarkdownFiles(contentDir);

  console.log(`Found ${files.length} markdown files`);

  let updatedCount = 0;
  let errorCount = 0;

  files.forEach((filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Check if enclosure.url exists and needs updating
      if (data.enclosure && data.enclosure.url) {
        const oldUrl = data.enclosure.url;
        const newUrl = updateEnclosureUrl(oldUrl);

        if (oldUrl !== newUrl) {
          data.enclosure.url = newUrl;

          // Rebuild the file with updated frontmatter
          const updatedContent = matter.stringify(content, data);
          fs.writeFileSync(filePath, updatedContent, 'utf8');

          console.log(`✓ Updated: ${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`);
          console.log(`  Old: ${oldUrl}`);
          console.log(`  New: ${newUrl}`);
          updatedCount++;
        }
      }
    } catch (error) {
      console.error(`✗ Error processing ${filePath}:`, error.message);
      errorCount++;
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`Total files: ${files.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Unchanged: ${files.length - updatedCount - errorCount}`);
}

main();
