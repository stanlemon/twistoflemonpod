#!/usr/bin/env node

/**
 * Add frontmatter to transcript files based on their corresponding post
 *
 * Copies title, episode, date, and slug (with /transcript appended) from the post
 * Adds type: transcript field
 *
 * Usage: node scripts/add-frontmatter-to-transcripts.js [--dry-run]
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

const CONTENT_DIR = resolve(process.cwd(), 'content/blog');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Find the post file in the same directory as the transcript
 */
function findPostFile(transcriptPath) {
  const dir = dirname(transcriptPath);
  const files = readdirSync(dir);

  // Find any .md file that's not transcript.md
  const postFile = files.find(f => f.endsWith('.md') && f !== 'transcript.md');

  return postFile ? join(dir, postFile) : null;
}

/**
 * Main function
 */
async function main() {
  console.log('Add Frontmatter to Transcripts');
  console.log('==============================');
  console.log(`Content: ${CONTENT_DIR}`);
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
  }
  console.log('');

  // Find all transcript.md files
  const transcripts = await glob('content/blog/**/transcript.md');
  console.log(`Found ${transcripts.length} transcripts\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const transcriptPath of transcripts) {
    try {
      // Find corresponding post
      const postPath = findPostFile(transcriptPath);
      if (!postPath) {
        console.log(`⚠️  No post found for: ${transcriptPath}`);
        errors++;
        continue;
      }

      // Read post frontmatter
      const postContent = readFileSync(postPath, 'utf-8');
      const { data: postFrontmatter } = matter(postContent);

      // Read transcript
      const transcriptContent = readFileSync(transcriptPath, 'utf-8');
      const { data: existingFrontmatter, content: transcriptBody } = matter(transcriptContent);

      // Check if already has frontmatter with type: transcript
      if (existingFrontmatter.type === 'transcript') {
        skipped++;
        continue;
      }

      // Create new frontmatter
      const newFrontmatter = {
        title: postFrontmatter.title,
        episode: postFrontmatter.episode,
        date: postFrontmatter.date,
        slug: postFrontmatter.slug ? `${postFrontmatter.slug}/transcript` : null,
        type: 'transcript'
      };

      // Create new file with frontmatter
      const newContent = matter.stringify(transcriptBody, newFrontmatter);

      // Write file
      if (!DRY_RUN) {
        writeFileSync(transcriptPath, newContent, 'utf-8');
      }

      const episode = postFrontmatter.episode || '?';
      console.log(`✓ Episode ${String(episode).padStart(3, ' ')}: ${transcriptPath}`);
      updated++;

    } catch (error) {
      console.error(`❌ Error processing ${transcriptPath}: ${error.message}`);
      errors++;
    }
  }

  // Summary
  console.log('');
  console.log('═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped} (already has frontmatter)`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log('═'.repeat(60));

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to actually update files');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
