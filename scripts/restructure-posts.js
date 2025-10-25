const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '../content/blog');
const ASSETS_DIR = path.join(__dirname, '../content/assets/images');

// Get all markdown files in the blog directory
const markdownFiles = fs.readdirSync(BLOG_DIR)
  .filter(file => file.endsWith('.md'))
  .map(file => path.join(BLOG_DIR, file));

console.log(`Found ${markdownFiles.length} markdown files to process`);

markdownFiles.forEach(filePath => {
  try {
    // Read and parse the markdown file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);

    // Extract date and slug from frontmatter
    const { date, slug } = frontmatter;

    if (!date || !slug) {
      console.warn(`Skipping ${path.basename(filePath)}: missing date or slug`);
      return;
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

    // Check if directory already exists
    if (fs.existsSync(newDirPath)) {
      console.log(`Directory already exists: ${newDirName}, skipping...`);
      return;
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
      console.log(`  Found ${imageRefs.length} image reference(s)`);

      imageRefs.forEach(imageRef => {
        // Extract just the filename from the path
        const imagePath = imageRef.replace('images/', '');
        const sourceImagePath = path.join(ASSETS_DIR, imagePath);

        if (fs.existsSync(sourceImagePath)) {
          const destImagePath = path.join(newDirPath, imagePath);

          // Copy the image to the new directory
          fs.copyFileSync(sourceImagePath, destImagePath);
          console.log(`    Copied image: ${imagePath}`);

          // Update the path in the content (images/foo.jpg -> ./foo.jpg)
          updatedContent = updatedContent.replace(
            new RegExp(`images/${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
            `./${imagePath}`
          );
        } else {
          console.warn(`    Image not found: ${sourceImagePath}`);
        }
      });
    }

    // Write the updated markdown file as index.md in the new directory
    const newFilePath = path.join(newDirPath, 'index.md');
    const newFileContent = matter.stringify(updatedContent, frontmatter);
    fs.writeFileSync(newFilePath, newFileContent);
    console.log(`  Created: ${newDirName}/index.md`);

    // Remove the original file
    fs.unlinkSync(filePath);
    console.log(`  Removed original: ${path.basename(filePath)}`);

  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}:`, error.message);
  }
});

console.log('\nRestructuring complete!');
