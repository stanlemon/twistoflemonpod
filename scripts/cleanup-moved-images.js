const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../content/assets/images');

// List of images that were moved to post directories
const movedImages = [
  'IMG_6447-225x300.jpg',
  'kohlmeier-angry-225x300.jpg',
  'lemon-angry-225x300.png',
  'stan-milkshake-poptarts-copy-768x1024.jpg',
  'Screen-Shot-2019-11-19-at-8.52.31-PM.png',
  'tree-on-house-1024x682.jpg',
  'stan-desk-768x1024.jpg',
  'jon-desk-1024x768.jpg',
  'milkshake-225x300.jpg',
  'elliston-place-milkshake-225x300.jpg',
  'hattie-bs-225x300.jpg',
  'wordcamp-300x300.jpg',
  'elliston-place-225x300.jpg',
  '45327660_336045846945094_2409562380603228160_n-340x230.jpg',
  'taliesin-small-682x1024.jpg'
];

console.log(`Removing ${movedImages.length} images from assets directory...\n`);

movedImages.forEach(image => {
  const imagePath = path.join(ASSETS_DIR, image);

  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
    console.log(`✓ Removed: ${image}`);
  } else {
    console.warn(`✗ Not found: ${image}`);
  }
});

console.log('\n✓ Cleanup complete!');
console.log('\nRemaining images in assets directory:');
const remaining = fs.readdirSync(ASSETS_DIR).filter(f => f.match(/\.(jpg|png|jpeg|gif)$/i));
console.log(`  ${remaining.length} files remaining`);
remaining.forEach(f => console.log(`  - ${f}`));
