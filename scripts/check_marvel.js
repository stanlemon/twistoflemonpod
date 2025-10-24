const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = 'content/blog';
const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

const marvelCharacterTags = ['wandavision', 'loki', 'hawkeye', 'black widow', 'shang-chi', 'spiderman', 'endgame', 'avengers'];
let postsWithCharButNoMarvel = [];

files.forEach(filename => {
  const filepath = path.join(BLOG_DIR, filename);
  const fileContent = fs.readFileSync(filepath, 'utf8');
  const { data } = matter(fileContent);
  
  const tags = (data.tags || []).map(t => t.toLowerCase());
  const hasMarvelChar = marvelCharacterTags.some(char => tags.includes(char));
  const hasMarvel = tags.includes('marvel');
  
  if (hasMarvelChar && !hasMarvel) {
    postsWithCharButNoMarvel.push(filename + ': ' + tags.join(', '));
  }
});

if (postsWithCharButNoMarvel.length === 0) {
  console.log('All posts with Marvel character tags also have the marvel tag ✓');
} else {
  console.log('Posts with Marvel characters but missing marvel tag:');
  postsWithCharButNoMarvel.forEach(p => console.log('  ' + p));
}
