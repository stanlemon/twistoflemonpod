#!/usr/bin/env node
/**
 * Update blog posts with improved categories and tags using gray-matter
 * to preserve original YAML formatting.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');

// Category detection rules
const CATEGORY_RULES = {
  'Movies': {
    keywords: ['movie', 'film', 'endgame', 'avengers', 'black widow', 'shang-chi', 'shang chi',
               'wandavision', 'falcon and the winter soldier', 'loki', 'hawkeye', 
               'captain marvel', 'spider-man', 'spiderman', 'infinity war',
               'star wars', 'skywalker', 'mandalorian', 'hamilton', 'disney+',
               'pixar', 'picard', 'star trek'],
    title_keywords: ['review', 'spoil'],
  }
};

// Tag detection rules - specific content-based tags
const TAG_RULES = {
  'iphone': ['iphone 12', 'iphone 13', 'iphone 14', 'iphone 15'],
  'ipad': ['ipad', 'ipad pro', 'ipad mini'],
  'macbook': ['macbook', 'macbook pro', 'macbook air'],
  'mac mini': ['mac mini'],
  'apple watch': ['apple watch'],
  'airpods': ['airpods', 'airpods pro', 'airpods max'],
  'wandavision': ['wandavision', 'wanda maximoff', 'vision'],
  'falcon and the winter soldier': ['falcon', 'winter soldier', 'sam wilson', 'bucky barnes'],
  'loki': ['loki'],
  'hawkeye': ['hawkeye', 'clint barton'],
  'black widow': ['black widow', 'natasha romanoff'],
  'shang-chi': ['shang-chi', 'shang chi'],
  'spiderman': ['spider-man', 'spiderman', 'peter parker', 'far from home', 'homecoming', 'no way home'],
  'endgame': ['endgame', 'infinity war'],
  'avengers': ['avengers'],
  'star wars': ['star wars', 'skywalker', 'mandalorian', 'baby yoda', 'grogu'],
  'star trek': ['star trek', 'picard'],
  'disney': ['disney world', 'epcot', 'magic kingdom'],
  'disney+': ['disney+', 'disney plus'],
  'tacos': ['taco bell', 'tacos'],
  'pizza': ['pizza'],
  'milkshakes': ['milkshake'],
  'meat rubs': ['meat rub', 'smoking meat', 'treager', 'smoker'],
  'grilled cheese': ['grilled cheese'],
  'beer': ['beer'],
  'home ownership': ['homeownership'],
  'lawn care': ['lawn mowing', 'lawn care', 'mowing'],
  'home improvement': ['home improvement', 'renovation', 'repair'],
  'roof': ['roof', 'roofing'],
  'budgeting': ['budget', 'budgeting'],
  'investing': ['investing', 'investment', 'stock market'],
  'mortgage': ['mortgage', 'refinancing', 'refinance'],
  'productivity': ['productivity'],
  'minimalism': ['minimalism', 'digital minimalism'],
  'email': ['email'],
  'vacation': ['vacation'],
  'thanksgiving': ['thanksgiving'],
  'christmas': ['christmas'],
  'patrick sturdivant': ['patrick sturdivant'],
  'music': ['apple music', 'spotify'],
  'baseball': ['baseball'],
  'football': ['football', 'nfl'],
  'politics': ['politics', 'voting', 'election', 'caucuses'],
};

// Tags to remove because they're too generic (match categories)
const TAGS_TO_REMOVE = ['marvel', 'movies', 'food', 'technology', 'home ownership', 'finance', 
                        'books', 'productivity', 'career advice'];

function shouldAddCategory(category, frontmatter, body, title) {
  const currentCategories = frontmatter.categories || [];
  
  // Don't add if already present
  if (currentCategories.includes(category)) {
    return false;
  }
  
  const rules = CATEGORY_RULES[category];
  if (!rules) {
    return false;
  }
  
  const allText = (title + ' ' + body).toLowerCase();
  
  // Check keywords in body/title
  const keywordMatch = rules.keywords.some(keyword => allText.includes(keyword.toLowerCase()));
  
  // Check title keywords if specified
  let titleMatch = false;
  if (rules.title_keywords) {
    titleMatch = rules.title_keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));
  }
  
  return keywordMatch || titleMatch;
}

function shouldAddTag(tag, frontmatter, body, title) {
  const currentTags = (frontmatter.tags || []).map(t => t.toLowerCase());
  
  // Don't add if already present (case-insensitive)
  if (currentTags.includes(tag.toLowerCase())) {
    return false;
  }
  
  const keywords = TAG_RULES[tag] || [];
  if (keywords.length === 0) {
    return false;
  }
  
  const allText = (title + ' ' + body).toLowerCase();
  
  // Check if any keyword appears in text
  return keywords.some(keyword => allText.includes(keyword.toLowerCase()));
}

function cleanTags(tags) {
  return tags.filter(tag => !TAGS_TO_REMOVE.includes(tag.toLowerCase()));
}

// First pass: collect all tags to count usage
function collectAllTags() {
  const tagCounts = {};
  
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  
  for (const filename of files) {
    const filepath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filepath, 'utf8');
    const { data } = matter(fileContent);
    
    const tags = data.tags || [];
    tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  }
  
  return tagCounts;
}

function updatePost(filepath, tagCounts, minTagUsage = 3) {
  const fileContent = fs.readFileSync(filepath, 'utf8');
  const { data: frontmatter, content: body } = matter(fileContent);
  
  const title = frontmatter.title || '';
  const currentCategories = frontmatter.categories || [];
  const currentTags = frontmatter.tags || [];
  
  let changes = {
    file: path.basename(filepath),
    title: title,
    added_categories: [],
    added_tags: [],
    removed_tags: []
  };
  
  // Add missing categories
  const newCategories = [...currentCategories];
  for (const category of Object.keys(CATEGORY_RULES)) {
    if (shouldAddCategory(category, frontmatter, body, title)) {
      newCategories.push(category);
      changes.added_categories.push(category);
    }
  }
  
  // Clean and filter tags
  let cleanedTags = cleanTags(currentTags);
  const removed = currentTags.filter(tag => !cleanedTags.includes(tag));
  changes.removed_tags = removed;
  
  // Remove tags used less than minTagUsage times
  const keptTags = cleanedTags.filter(tag => (tagCounts[tag] || 0) >= minTagUsage);
  const removedLowUsage = cleanedTags.filter(tag => !keptTags.includes(tag));
  changes.removed_tags = [...changes.removed_tags, ...removedLowUsage];
  
  let newTags = keptTags;
  
  // Add new specific tags
  for (const tag of Object.keys(TAG_RULES)) {
    if (shouldAddTag(tag, frontmatter, body, title)) {
      newTags.push(tag);
      changes.added_tags.push(tag);
    }
  }
  
  // Normalize tag capitalization
  const TAG_NORMALIZATION = {
    'milkshake': 'milkshakes',
    'patrick sturdivant': 'patrick sturdivant',
    'falcon and the winter soilder': 'falcon and the winter soldier',
  };
  
  newTags = newTags.map(tag => {
    const normalized = TAG_NORMALIZATION[tag.toLowerCase()];
    return normalized || tag;
  });
  
  // Remove duplicates while preserving order
  newTags = [...new Set(newTags)];
  
  // Update frontmatter if changes were made
  if (changes.added_categories.length > 0 || changes.added_tags.length > 0 || changes.removed_tags.length > 0) {
    frontmatter.categories = newCategories.length > 0 ? newCategories : null;
    frontmatter.tags = newTags.length > 0 ? newTags : null;
    
    // Use gray-matter to write back with preserved formatting
    const newContent = matter.stringify(body, frontmatter);
    fs.writeFileSync(filepath, newContent, 'utf8');
    
    return changes;
  }
  
  return null;
}

function main() {
  console.log('='.repeat(80));
  console.log('COLLECTING TAG USAGE COUNTS');
  console.log('='.repeat(80));
  
  const tagCounts = collectAllTags();
  const totalTags = Object.keys(tagCounts).length;
  const singleUseTags = Object.values(tagCounts).filter(c => c === 1).length;
  
  console.log(`Total unique tags: ${totalTags}`);
  console.log(`Tags used 1 time: ${singleUseTags}`);
  console.log(`Tags used 2 times: ${Object.values(tagCounts).filter(c => c === 2).length}`);
  console.log(`Tags used 3+ times: ${Object.values(tagCounts).filter(c => c >= 3).length}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('UPDATING BLOG POSTS');
  console.log('='.repeat(80));
  
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md')).sort();
  const allChanges = [];
  
  for (const filename of files) {
    const filepath = path.join(BLOG_DIR, filename);
    const changes = updatePost(filepath, tagCounts);
    
    if (changes) {
      allChanges.push(changes);
      console.log(`\nUpdated: ${changes.file}`);
      if (changes.added_categories.length > 0) {
        console.log(`  Added categories: ${changes.added_categories.join(', ')}`);
      }
      if (changes.added_tags.length > 0) {
        console.log(`  Added tags: ${changes.added_tags.join(', ')}`);
      }
      if (changes.removed_tags.length > 0) {
        console.log(`  Removed tags: ${changes.removed_tags.join(', ')}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Posts updated: ${allChanges.length}`);
  
  // Recount final state
  const finalTagCounts = collectAllTags();
  
  const allCategories = {};
  for (const filename of files) {
    const filepath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filepath, 'utf8');
    const { data } = matter(fileContent);
    
    const categories = data.categories || [];
    categories.forEach(cat => {
      allCategories[cat] = (allCategories[cat] || 0) + 1;
    });
  }
  
  console.log(`\nFinal unique categories: ${Object.keys(allCategories).length}`);
  console.log(`Final unique tags: ${Object.keys(finalTagCounts).length}`);
}

main();
