const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../content/assets/images');
const BLOG_DIR = path.join(__dirname, '../content/blog');

// Map resized images to their full-size versions
const imageMap = {
  'IMG_6447-225x300.jpg': 'IMG_6447.jpg',
  '45327660_336045846945094_2409562380603228160_n-340x230.jpg': '45327660_336045846945094_2409562380603228160_n.jpg',
  'elliston-place-225x300.jpg': 'elliston-place.jpg',
  'elliston-place-milkshake-225x300.jpg': 'elliston-place-milkshake.jpg',
  'hattie-bs-225x300.jpg': 'hattie-bs.jpg',
  'milkshake-225x300.jpg': 'milkshake.jpg',
  'wordcamp-300x300.jpg': 'wordcamp.jpg',
  'kohlmeier-angry-225x300.jpg': 'kohlmeier-angry.jpg',
  'lemon-angry-225x300.png': 'lemon-angry.png',
  'stan-milkshake-poptarts-copy-768x1024.jpg': 'stan-milkshake-poptarts-copy.jpg',
  'jon-desk-1024x768.jpg': 'jon-desk.jpg',
  'stan-desk-768x1024.jpg': 'stan-desk.jpg',
  'tree-on-house-1024x682.jpg': 'tree-on-house.jpg',
  'taliesin-small-682x1024.jpg': 'taliesin-small.jpg',
  // Screen-Shot doesn't have a bigger version, so it maps to itself
  'Screen-Shot-2019-11-19-at-8.52.31-PM.png': 'Screen-Shot-2019-11-19-at-8.52.31-PM.png'
};

console.log('Step 1: Finding all post directories with images...\n');

const postDirs = [];

function findPostsWithImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      const images = fs.readdirSync(fullPath).filter(f => f.match(/\.(jpg|png)$/i));

      if (images.length > 0) {
        postDirs.push({ path: fullPath, images });
      }
    }
  }
}

findPostsWithImages(BLOG_DIR);

console.log(`Found ${postDirs.length} post directories with images\n`);

console.log('Step 2: Replacing resized images with full-size versions...\n');

postDirs.forEach(({ path: postPath, images }) => {
  const postName = path.basename(postPath);
  console.log(`Processing: ${postName}`);

  images.forEach(resizedImage => {
    const fullsizeImage = imageMap[resizedImage];

    if (!fullsizeImage) {
      console.log(`  ⚠️  No mapping found for: ${resizedImage}`);
      return;
    }

    if (fullsizeImage === resizedImage) {
      console.log(`  ↔️  Already full-size: ${resizedImage}`);
      return;
    }

    const sourcePath = path.join(ASSETS_DIR, fullsizeImage);
    const resizedPath = path.join(postPath, resizedImage);
    const destPath = path.join(postPath, fullsizeImage);

    if (!fs.existsSync(sourcePath)) {
      console.log(`  ✗ Full-size not found: ${fullsizeImage}`);
      return;
    }

    // Copy full-size version
    fs.copyFileSync(sourcePath, destPath);

    // Delete resized version
    if (fs.existsSync(resizedPath)) {
      fs.unlinkSync(resizedPath);
    }

    console.log(`  ✓ Replaced: ${resizedImage} -> ${fullsizeImage}`);
  });

  console.log('');
});

console.log('\nStep 3: Updating markdown files to reference full-size images...\n');

postDirs.forEach(({ path: postPath, images }) => {
  const indexPath = path.join(postPath, 'index.md');

  if (!fs.existsSync(indexPath)) {
    console.log(`⚠️  No index.md in ${path.basename(postPath)}`);
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');
  let updated = false;

  images.forEach(resizedImage => {
    const fullsizeImage = imageMap[resizedImage];

    if (!fullsizeImage || fullsizeImage === resizedImage) {
      return;
    }

    // Escape special regex characters
    const escapedResized = resizedImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedResized, 'g');

    if (content.match(regex)) {
      content = content.replace(regex, fullsizeImage);
      updated = true;
      console.log(`  ✓ Updated reference: ${resizedImage} -> ${fullsizeImage}`);
    }
  });

  if (updated) {
    fs.writeFileSync(indexPath, content);
    console.log(`  ✓ Saved: ${path.basename(postPath)}/index.md\n`);
  }
});

console.log('✓ All images replaced with full-size versions!');
