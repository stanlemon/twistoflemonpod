const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '../content/blog');
const MP3_DIR = '~/Sites/twistoflemonpod-mp3s/episodes';

function expandTilde(filepath) {
  if (filepath[0] === '~') {
    return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

function getAllMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function getFilenameFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 1].trim();
}

function updateEnclosureMetadata() {
  const mp3Dir = expandTilde(MP3_DIR);
  const markdownFiles = getAllMarkdownFiles(BLOG_DIR);

  console.log(`Found ${markdownFiles.length} markdown files to process`);

  let updatedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const filePath of markdownFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(content);

      // Check if post has enclosure data
      if (!parsed.data.enclosure || !parsed.data.enclosure.url) {
        console.log(`⚠️  Skipping ${path.basename(path.dirname(filePath))}/${path.basename(filePath)} - no enclosure URL`);
        skippedCount++;
        continue;
      }

      // Extract filename from URL
      const filename = getFilenameFromUrl(parsed.data.enclosure.url);
      const mp3Path = path.join(mp3Dir, filename);

      // Check if MP3 file exists
      if (!fs.existsSync(mp3Path)) {
        console.log(`❌ MP3 file not found: ${filename}`);
        errorCount++;
        continue;
      }

      // Get file stats
      const stats = fs.statSync(mp3Path);
      const fileSize = stats.size;

      // Check if update is needed
      const needsUpdate =
        parsed.data.enclosure.length !== fileSize ||
        parsed.data.enclosure.type !== 'audio/mpeg';

      if (!needsUpdate) {
        console.log(`✓ Already correct: ${filename}`);
        continue;
      }

      // Update enclosure metadata
      parsed.data.enclosure.length = fileSize;
      parsed.data.enclosure.type = 'audio/mpeg';

      // Write back to file
      const updatedContent = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(filePath, updatedContent, 'utf8');

      console.log(`✅ Updated ${filename}: ${fileSize} bytes`);
      updatedCount++;

    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total files: ${markdownFiles.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Already correct: ${markdownFiles.length - updatedCount - errorCount - skippedCount}`);
  console.log(`Skipped (no enclosure): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Run the update
updateEnclosureMetadata();
