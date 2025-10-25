const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '../content/blog');

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

function extractSummary(content) {
  // Remove any markdown headers
  let text = content.replace(/^#+\s+.+$/gm, '');
  
  // Remove any markdown links but keep the text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove any markdown formatting
  text = text.replace(/[*_`]/g, '');
  
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => {
    const trimmed = p.trim();
    return trimmed.length > 0 && 
           !trimmed.match(/^Dear Listener,?\s*$/i) &&
           !trimmed.startsWith('Thanks for listening') &&
           !trimmed.startsWith('Stan Lemon') &&
           !trimmed.startsWith('Jon Kohlmeier') &&
           !trimmed.startsWith('##') &&
           !trimmed.startsWith('[');
  });
  
  if (paragraphs.length === 0) {
    return null;
  }
  
  // Get first paragraph and remove "Dear Listener," if it starts with it
  let summary = paragraphs[0].trim();
  summary = summary.replace(/^Dear Listener,?\s*/i, '');
  
  // If it's too short, try to add the second paragraph
  if (summary.length < 80 && paragraphs.length > 1) {
    let secondPara = paragraphs[1].trim().replace(/^Dear Listener,?\s*/i, '');
    summary = `${summary} ${secondPara}`;
  }
  
  // Clean up whitespace
  summary = summary.replace(/\s+/g, ' ').trim();
  
  // Truncate to a reasonable length (around 155 characters for meta description)
  if (summary.length > 155) {
    summary = summary.substring(0, 152) + '...';
  }
  
  return summary;
}

function addSummariesToPosts() {
  const markdownFiles = getAllMarkdownFiles(BLOG_DIR);
  
  console.log(`Found ${markdownFiles.length} markdown files to process\n`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const filePath of markdownFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      // Skip if summary already exists
      if (data.summary) {
        skippedCount++;
        continue;
      }
      
      // Extract summary from content
      const summary = extractSummary(content);
      
      if (!summary) {
        console.log(`⚠️  Could not extract summary from ${path.relative(BLOG_DIR, filePath)}`);
        errorCount++;
        continue;
      }
      
      // Add summary to frontmatter
      data.summary = summary;
      
      // Reconstruct the file with updated frontmatter
      const updatedContent = matter.stringify(content, data);
      
      // Write back to file
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      console.log(`✓ Added summary to ${path.relative(BLOG_DIR, filePath)}`);
      updatedCount++;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Summary:`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Skipped (already has summary): ${skippedCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log('='.repeat(50));
}

// Run the script
addSummariesToPosts();
