#!/usr/bin/env node

/**
 * Copy transcript files to their corresponding post directories
 * based on the enclosure URL in the post's frontmatter
 *
 * Usage: node scripts/copy-transcripts-to-posts.js [--dry-run]
 */

import { readdirSync, readFileSync, copyFileSync, existsSync } from 'fs';
import { resolve, join, dirname, basename } from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

const TRANSCRIPTS_DIR = resolve(process.env.HOME, 'Sites/twistoflemonpod-mp3s/episodes');
const CONTENT_DIR = resolve(process.cwd(), 'content/blog');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Extract MP3 filename from enclosure URL
 */
function getMp3Filename(enclosureUrl) {
  if (!enclosureUrl) return null;

  // URL formats:
  // - https://s3.us-east-2.amazonaws.com/twistoflemonpod/episodes/043-lwatol-20190502.mp3
  // - https://media.twistoflemonpod.com/043-lwatol-20190502.mp3
  const match = enclosureUrl.match(/([^\/]+\.mp3)$/);
  return match ? match[1] : null;
}

/**
 * Main function
 */
async function main() {
  console.log('Copy Transcripts to Post Directories');
  console.log('====================================');
  console.log(`Transcripts: ${TRANSCRIPTS_DIR}`);
  console.log(`Posts: ${CONTENT_DIR}`);
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be copied');
  }
  console.log('');

  // Find all blog posts
  const posts = await glob('content/blog/**/*.md');
  console.log(`Found ${posts.length} blog posts\n`);

  let copied = 0;
  let skipped = 0;
  let missing = 0;
  let errors = 0;

  for (const postPath of posts) {
    try {
      // Read post frontmatter
      const postContent = readFileSync(postPath, 'utf-8');
      const { data: frontmatter } = matter(postContent);

      // Get enclosure URL
      const enclosureUrl = frontmatter.enclosure?.url?.trim();
      if (!enclosureUrl) {
        skipped++;
        continue;
      }

      // Extract MP3 filename
      const mp3Filename = getMp3Filename(enclosureUrl);
      if (!mp3Filename) {
        console.log(`⚠️  Could not extract filename from: ${enclosureUrl}`);
        errors++;
        continue;
      }

      // Find corresponding transcript
      const transcriptFilename = mp3Filename.replace('.mp3', '.md');
      const transcriptPath = join(TRANSCRIPTS_DIR, transcriptFilename);

      if (!existsSync(transcriptPath)) {
        console.log(`❌ Missing transcript: ${transcriptFilename}`);
        missing++;
        continue;
      }

      // Determine destination
      const postDir = dirname(postPath);
      const destPath = join(postDir, 'transcript.md');

      // Check if already exists
      if (existsSync(destPath)) {
        skipped++;
        continue;
      }

      // Copy file
      if (!DRY_RUN) {
        copyFileSync(transcriptPath, destPath);
      }

      const episode = frontmatter.episode || '?';
      console.log(`✓ Episode ${String(episode).padStart(3, ' ')}: ${mp3Filename} → ${postDir}/transcript.md`);
      copied++;

    } catch (error) {
      console.error(`❌ Error processing ${postPath}: ${error.message}`);
      errors++;
    }
  }

  // Summary
  console.log('');
  console.log('═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Copied: ${copied}`);
  console.log(`⏭️  Skipped: ${skipped} (no enclosure or already exists)`);
  console.log(`❌ Missing: ${missing} (transcript not found)`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log('═'.repeat(60));

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to actually copy files');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
