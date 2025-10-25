const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '../content/blog');
const ASSETS_DIR = path.join(__dirname, '../content/assets/images');

// Test with a specific file that has images
const testFile = 'episode-22-nashville-milkshake-and-grills.md';
const filePath = path.join(BLOG_DIR, testFile);

console.log(`Testing with: ${testFile}\n`);

try {
  // Read and parse the markdown file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContent);

  console.log('Frontmatter:', JSON.stringify(frontmatter, null, 2));

  // Extract date and slug from frontmatter
  const { date, slug } = frontmatter;

  if (!date || !slug) {
    console.error('Missing date or slug!');
    process.exit(1);
  }

  // Parse the date and format as YYYY-MM-DD
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const datePrefix = `${year}-${month}-${day}`;

  // Create the new directory name
  const newDirName = `${datePrefix}-${slug}`;
  const newDirPath = path.join(BLOG_DIR, newDirName);

  console.log(`\nNew directory: ${newDirName}`);

  // Check if directory already exists
  if (fs.existsSync(newDirPath)) {
    console.log('Directory already exists, removing for test...');
    fs.rmSync(newDirPath, { recursive: true, force: true });
  }

  // Create the new directory
  fs.mkdirSync(newDirPath, { recursive: true });
  console.log(`Created directory: ${newDirName}`);

  // Find all image references in the content
  const imageRegex = /!\[.*?\]\((images\/[^)]+)\)/g;
  let match;
  const imageRefs = [];

  while ((match = imageRegex.exec(content)) !== null) {
    imageRefs.push(match[1]);
  }

  // Also check for images in caption shortcodes
  const captionRegex = /!\[\]\((images\/[^)]+)\)/g;
  while ((match = captionRegex.exec(content)) !== null) {
    if (!imageRefs.includes(match[1])) {
      imageRefs.push(match[1]);
    }
  }

  let updatedContent = content;

  // Move images and update paths
  if (imageRefs.length > 0) {
    console.log(`\nFound ${imageRefs.length} image reference(s):`);

    imageRefs.forEach(imageRef => {
      console.log(`  - ${imageRef}`);

      // Extract just the filename from the path
      const imagePath = imageRef.replace('images/', '');
      const sourceImagePath = path.join(ASSETS_DIR, imagePath);

      if (fs.existsSync(sourceImagePath)) {
        const destImagePath = path.join(newDirPath, imagePath);

        // Copy the image to the new directory
        fs.copyFileSync(sourceImagePath, destImagePath);
        console.log(`    ✓ Copied to: ${path.join(newDirName, imagePath)}`);

        // Update the path in the content (images/foo.jpg -> ./foo.jpg)
        updatedContent = updatedContent.replace(
          new RegExp(`images/${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
          `./${imagePath}`
        );
      } else {
        console.warn(`    ✗ Image not found: ${sourceImagePath}`);
      }
    });
  } else {
    console.log('\nNo images found in this post');
  }

  // Write the updated markdown file as index.md in the new directory
  const newFilePath = path.join(newDirPath, 'index.md');
  const newFileContent = matter.stringify(updatedContent, frontmatter);
  fs.writeFileSync(newFilePath, newFileContent);
  console.log(`\n✓ Created: ${newDirName}/index.md`);

  // Show a preview of the content changes
  console.log('\nContent preview (first 500 chars):');
  console.log('---');
  console.log(updatedContent.substring(0, 500));
  console.log('---');

  console.log('\n✓ Test successful! Check the directory:', newDirPath);
  console.log('\nOriginal file was NOT removed (test mode)');

} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
