#!/usr/bin/env node

/**
 * Create a new podcast episode with transcription and AI-generated content
 *
 * This script automates the complete workflow for creating a new episode:
 * 1. Prompts for episode details (title, number, date)
 * 2. Transcribes audio with Deepgram (speaker diarization)
 * 3. Generates AI summary and keywords with Ollama
 * 4. Creates both episode post and transcript files with complete frontmatter
 * 5. Prints next steps for publishing
 *
 * Usage: node scripts/create-new-episode.js <mp3-file> [--skip-transcription] [--upload]
 *
 * Example: node scripts/create-new-episode.js ~/Sites/twistoflemonpod-mp3s/episodes/173-new-episode.mp3
 *
 * Requirements:
 *   - DEEPGRAM_API_KEY environment variable set in .env
 *   - Ollama installed and running (brew install ollama && brew services start ollama)
 *   - Model pulled (ollama pull llama3.2:3b)
 */

import { spawnSync } from 'child_process';
import { resolve, basename, extname } from 'path';
import {
  DEEPGRAM_API_KEY,
  MEDIA_BASE_URL,
  checkOllama,
  ensureDir,
  formatDateForDir,
  formatTimestamp,
  formatTranscript,
  generateSummary,
  getFileSize,
  parseDate,
  prompt,
  slugify,
  transcribeFile,
  writeMarkdownFile,
} from './lib/utils.js';

const DEFAULT_TRANSCRIPT_PLACEHOLDER = 'Transcript will be available soon.';
const DEFAULT_SUMMARY_PLACEHOLDER = 'Summary will be added soon.';
const R2_BUCKET = process.env.R2_BUCKET || 's3://twistoflemonpod/episodes';
const R2_ENDPOINT_URL = process.env.R2_ENDPOINT_URL;

/**
 * Validate date string (YYYY-MM-DD)
 */
function isValidDate(dateStr) {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === parseInt(year) &&
    date.getMonth() === parseInt(month) - 1 &&
    date.getDate() === parseInt(day)
  );
}

/**
 * Prompt for episode details
 */
async function promptEpisodeDetails() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Episode Details');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Episode number
  let episodeNumber;
  while (true) {
    const input = await prompt('Episode number: ');
    episodeNumber = parseInt(input);
    if (episodeNumber > 0) break;
    console.log('Please enter a valid episode number');
  }

  // Title
  let title;
  while (true) {
    title = await prompt('Episode title: ');
    if (title.length > 0) break;
    console.log('Please enter a title');
  }

  // Date
  let date;
  while (true) {
    const input = await prompt('Publish date (YYYY-MM-DD) [today]: ');
    if (input === '') {
      date = new Date();
      break;
    }
    if (isValidDate(input)) {
      date = parseDate(input);
      break;
    }
    console.log('Please enter a valid date in YYYY-MM-DD format');
  }

  console.log('');
  console.log('Confirmed:');
  console.log(`  Episode: ${episodeNumber}`);
  console.log(`  Title: ${title}`);
  console.log(`  Date: ${formatDateForDir(date)}`);
  console.log('');

  return { episodeNumber, title, date };
}

/**
 * Create episode post file
 */
function createEpisodeFile(
  blogDir,
  episodeNumber,
  title,
  date,
  mp3Basename,
  fileSize,
  duration,
  summary,
  keywords,
) {
  const slug = slugify(title);
  const filename = `${episodeNumber}-${slug}.md`;
  const filePath = resolve(blogDir, filename);

  const tags = Array.isArray(keywords) && keywords.length > 0 ? keywords.slice(0, 5) : [];
  const frontmatter = {
    title: title,
    slug: slug,
    episode: episodeNumber,
    date: date.toISOString(),
    categories: ['Technology'], // Default category, can be edited
    tags,
    enclosure: {
      url: `${MEDIA_BASE_URL}/${mp3Basename}.mp3`,
      length: fileSize,
      type: 'audio/mpeg',
      duration: duration,
    },
  };

  if (summary) {
    frontmatter.summary = summary;
  }

  const contentSummary = summary || DEFAULT_SUMMARY_PLACEHOLDER;
  const content = `Dear Listener,

${contentSummary}

Thanks for listening and we'll talk to you soon,

Stan Lemon & Jon Kohlmeier
`;

  writeMarkdownFile(filePath, frontmatter, content);

  return { filePath, slug };
}

/**
 * Create transcript file
 */
function createTranscriptFile(
  blogDir,
  episodeNumber,
  title,
  date,
  slug,
  transcriptText,
  summary,
  keywords,
) {
  const dateStr = formatDateForDir(date).replace(/-/g, '');
  const filename = `${episodeNumber}-lwatol-${dateStr}.md`;
  const filePath = resolve(blogDir, filename);

  const frontmatter = {
    title: `${title} - Transcript`,
    episode: episodeNumber,
    date: date.toISOString(),
    slug: `${slug}/transcript`,
    type: 'transcript',
  };

  if (summary) {
    frontmatter.summary = summary;
  }

  if (Array.isArray(keywords) && keywords.length > 0) {
    frontmatter.keywords = keywords;
  }

  writeMarkdownFile(filePath, frontmatter, transcriptText);

  return filePath;
}

function uploadToR2(localPath, destinationKey) {
  const normalizedBucket = R2_BUCKET.endsWith('/') ? R2_BUCKET.slice(0, -1) : R2_BUCKET;
  const destination = `${normalizedBucket}/${destinationKey}`;
  const args = ['s3', 'cp', localPath, destination];

  if (R2_ENDPOINT_URL) {
    args.push('--endpoint-url', R2_ENDPOINT_URL);
  }

  console.log(`  Uploading ${localPath} → ${destination}`);
  const result = spawnSync('aws', args, { stdio: 'inherit' });

  if (result.status !== 0) {
    throw new Error('MP3 upload to Cloudflare R2 failed');
  }

  console.log('  ✓ Upload complete');
}

/**
 * Main function
 */
async function main() {
  const rawArgs = process.argv.slice(2);
  const positionalArgs = rawArgs.filter(arg => !arg.startsWith('--'));
  const options = {
    skipTranscription: rawArgs.includes('--skip-transcription'),
    upload: rawArgs.includes('--upload'),
  };

  if (positionalArgs.length !== 1) {
    console.error('Usage: node scripts/create-new-episode.js <mp3-file> [--skip-transcription] [--upload]');
    console.error('');
    console.error('Example: node scripts/create-new-episode.js ~/Sites/twistoflemonpod-mp3s/episodes/173-new-episode.mp3 --upload');
    process.exit(1);
  }

  if (!options.skipTranscription && !DEEPGRAM_API_KEY) {
    console.error('Error: DEEPGRAM_API_KEY environment variable is not set');
    console.error('Please set it in your .env file or use --skip-transcription');
    process.exit(1);
  }

  const inputPath = resolve(positionalArgs[0]);
  const mp3Basename = basename(inputPath, extname(inputPath));

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Create New Podcast Episode');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`MP3 File: ${inputPath}`);

  try {
    // Get episode details from user
    const { episodeNumber, title, date } = await promptEpisodeDetails();

    // Setup paths
    const dateStr = formatDateForDir(date);
    const blogDir = resolve('content/blog', dateStr);

    // Step 1: Transcribe audio (unless skipped)
    let transcriptText = '';
    let durationFormatted = '00:00:00';
    let summary = '';
    let keywords = [];
    let hasTranscript = false;

    if (options.skipTranscription) {
      console.log('Step 1: Skipping transcription (--skip-transcription flag)');
      transcriptText = DEFAULT_TRANSCRIPT_PLACEHOLDER;
    } else {
      console.log('Step 1: Transcribing audio...');
      console.log('  Reading audio file...');
      console.log('  Sending to Deepgram for transcription...');
      const result = await transcribeFile(inputPath);
      transcriptText = formatTranscript(result);
      hasTranscript = true;

      const utterances = result.results?.utterances || [];
      const speakers = new Set(utterances.map(u => u.speaker));
      const duration = result.metadata?.duration || 0;
      durationFormatted = formatTimestamp(duration);

      console.log('  ✓ Transcription complete!');
      console.log(`    Duration: ${durationFormatted}`);
      console.log(`    Speakers: ${speakers.size}`);
      console.log(`    Utterances: ${utterances.length}`);
      console.log('');
    }

    // Step 2: Generate AI summary when transcript text exists
    const shouldSummarize = hasTranscript && transcriptText.trim().length > 0;
    if (shouldSummarize) {
      console.log('Step 2: Generating AI summary and keywords...');
      const ollamaRunning = await checkOllama();
      if (!ollamaRunning) {
        throw new Error('Ollama is not running. Start it with: brew services start ollama');
      }
      const summaryResult = await generateSummary(title, transcriptText);
      summary = summaryResult.summary;
      keywords = summaryResult.keywords;
      console.log('  ✓ Generated successfully');
      console.log(`    Summary: ${summary.substring(0, 80)}${summary.length > 80 ? '...' : ''}`);
      console.log(
        `    Keywords: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '...' : ''}`,
      );
      console.log('');
    } else {
      console.log('Step 2: Skipping AI summary (no transcript available)');
      console.log('');
    }

    // Step 3: Create files
    console.log('Step 3: Creating episode files...');

    // Ensure directory exists
    ensureDir(blogDir);

    // Get file size
    const fileSize = getFileSize(inputPath);

    // Create episode post
    const { filePath: episodeFilePath, slug } = createEpisodeFile(
      blogDir,
      episodeNumber,
      title,
      date,
      mp3Basename,
      fileSize,
      durationFormatted,
      summary,
      keywords
    );
    console.log(`  ✓ Episode post: ${episodeFilePath}`);

    // Create transcript
    const transcriptFilePath = createTranscriptFile(
      blogDir,
      episodeNumber,
      title,
      date,
      slug,
      transcriptText,
      summary,
      keywords
    );
    console.log(`  ✓ Transcript: ${transcriptFilePath}`);
    console.log('');

    // Optional upload
    if (options.upload) {
      console.log('Step 4: Uploading MP3 to Cloudflare R2...');
      uploadToR2(inputPath, `${mp3Basename}.mp3`);
      console.log('');
    }

    // Step 5: Print next steps
    console.log('═══════════════════════════════════════════════════════');
    console.log('Success! Next steps:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('1. Review and edit the episode files:');
    console.log(`   ${episodeFilePath}`);
    console.log(`   ${transcriptFilePath}`);
    console.log('');
    console.log('2. Update categories and tags in episode post as needed');
    console.log('');
    if (options.upload) {
      console.log('3. Upload MP3 to R2:');
      console.log('   ✓ Already uploaded via --upload');
    } else {
      console.log('3. Upload MP3 to storage:');
      console.log(`   aws s3 cp ${inputPath} ${R2_BUCKET}/${mp3Basename}.mp3`);
    }
    console.log('');
    console.log('4. Test and build:');
    console.log('   npm test && npm run build');
    console.log('');
    console.log('5. Commit and deploy:');
    console.log('   git add .');
    console.log(`   git commit -m "Add episode ${episodeNumber}: ${title}"`);
    console.log('   git push');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

main();
