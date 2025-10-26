#!/usr/bin/env node

/**
 * Rename transcript.md files to match their MP3 enclosure filename
 *
 * Example: transcript.md → 043-lwatol-20190502.md
 *
 * Usage: node scripts/rename-transcripts-to-match-mp3.js [--dry-run]
 */

import { readdirSync, readFileSync, renameSync } from 'fs';
import { resolve, join, dirname } from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

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
 * Find the post file that matches the transcript's frontmatter
 */
function findMatchingPost(transcriptPath, transcriptFrontmatter) {
  const dir = dirname(transcriptPath);
  const files = readdirSync(dir);

  // Find post with matching episode and slug
  for (const file of files) {
    if (file.endsWith('.md') && file !== 'transcript.md') {
      const postPath = join(dir, file);
      const postContent = readFileSync(postPath, 'utf-8');
      const { data: postFrontmatter } = matter(postContent);

      // Match by episode number and slug (transcript slug has /transcript appended)
      const transcriptSlugBase = transcriptFrontmatter.slug?.replace('/transcript', '');
      if (postFrontmatter.episode === transcriptFrontmatter.episode &&
          postFrontmatter.slug === transcriptSlugBase &&
          postFrontmatter.enclosure?.url) {
        return {
          postPath,
          enclosureUrl: postFrontmatter.enclosure.url.trim(),
          episode: postFrontmatter.episode
        };
      }
    }
  }

  return null;
}

/**
 * Main function
 */
async function main() {
  console.log('Rename Transcripts to Match MP3 Filenames');
  console.log('=========================================');
  console.log(`Content: ${CONTENT_DIR}`);
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be renamed');
  }
  console.log('');

  // Find all transcript.md files
  const transcripts = await glob('content/blog/**/transcript.md');
  console.log(`Found ${transcripts.length} transcript.md files\n`);

  let renamed = 0;
  let skipped = 0;
  let errors = 0;

  for (const transcriptPath of transcripts) {
    try {
      // Read transcript frontmatter
      const transcriptContent = readFileSync(transcriptPath, 'utf-8');
      const { data: transcriptFrontmatter } = matter(transcriptContent);

      // Find corresponding post that matches this transcript
      const postInfo = findMatchingPost(transcriptPath, transcriptFrontmatter);
      if (!postInfo) {
        console.log(`⚠️  No matching post found for: ${transcriptPath}`);
        errors++;
        continue;
      }

      // Extract MP3 filename
      const mp3Filename = getMp3Filename(postInfo.enclosureUrl);
      if (!mp3Filename) {
        console.log(`⚠️  Could not extract filename from: ${postInfo.enclosureUrl}`);
        errors++;
        continue;
      }

      // Create new filename (replace .mp3 with .md)
      const newFilename = mp3Filename.replace('.mp3', '.md');
      const newPath = join(dirname(transcriptPath), newFilename);

      // Skip if already has correct name
      if (transcriptPath === newPath) {
        skipped++;
        continue;
      }

      // Rename file
      if (!DRY_RUN) {
        renameSync(transcriptPath, newPath);
      }

      const episode = postInfo.episode || '?';
      console.log(`✓ Episode ${String(episode).padStart(3, ' ')}: transcript.md → ${newFilename}`);
      renamed++;

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
  console.log(`✅ Renamed: ${renamed}`);
  console.log(`⏭️  Skipped: ${skipped} (already correct name)`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log('═'.repeat(60));

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to actually rename files');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
