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
 * Usage: node scripts/create-new-episode.js <mp3-file>
 *
 * Example: node scripts/create-new-episode.js ~/Sites/twistoflemonpod-mp3s/episodes/173-new-episode.mp3
 *
 * Requirements:
 *   - DEEPGRAM_API_KEY environment variable set in .env
 *   - Ollama installed and running (brew install ollama && brew services start ollama)
 *   - Model pulled (ollama pull llama3.2:3b)
 */

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
function createEpisodeFile(blogDir, episodeNumber, title, date, mp3Basename, fileSize, duration, summary, keywords) {
  const slug = slugify(title);
  const filename = `${episodeNumber}-${slug}.md`;
  const filePath = resolve(blogDir, filename);

  const frontmatter = {
    title: title,
    slug: slug,
    episode: episodeNumber,
    date: date.toISOString(),
    categories: ['Technology'], // Default category, can be edited
    tags: keywords.slice(0, 5), // Use first 5 keywords as tags
    enclosure: {
      url: `${MEDIA_BASE_URL}/${mp3Basename}.mp3`,
      length: fileSize,
      type: 'audio/mpeg',
      duration: duration,
    },
    summary: summary,
  };

  const content = `Dear Listener,

${summary}

Thanks for listening and we'll talk to you soon,

Stan Lemon & Jon Kohlmeier
`;

  writeMarkdownFile(filePath, frontmatter, content);

  return { filePath, slug };
}

/**
 * Create transcript file
 */
function createTranscriptFile(blogDir, episodeNumber, title, date, slug, transcriptText, summary, keywords) {
  const dateStr = formatDateForDir(date).replace(/-/g, '');
  const filename = `${episodeNumber}-lwatol-${dateStr}.md`;
  const filePath = resolve(blogDir, filename);

  const frontmatter = {
    title: `${title} - Transcript`,
    episode: episodeNumber,
    date: date.toISOString(),
    slug: `${slug}/transcript`,
    type: 'transcript',
    summary: summary,
    keywords: keywords,
  };

  writeMarkdownFile(filePath, frontmatter, transcriptText);

  return filePath;
}

/**
 * Main function
 */
async function main() {
  // Check command line arguments
  if (process.argv.length < 3) {
    console.error('Usage: node scripts/create-new-episode.js <mp3-file>');
    console.error('');
    console.error('Example: node scripts/create-new-episode.js ~/Sites/twistoflemonpod-mp3s/episodes/173-new-episode.mp3');
    process.exit(1);
  }

  if (!DEEPGRAM_API_KEY) {
    console.error('Error: DEEPGRAM_API_KEY environment variable is not set');
    console.error('Please set it in your .env file');
    process.exit(1);
  }

  const inputPath = resolve(process.argv[2]);
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

    // Check if Ollama is running
    console.log('Step 1: Checking Ollama...');
    const ollamaRunning = await checkOllama();
    if (!ollamaRunning) {
      throw new Error('Ollama is not running. Start it with: brew services start ollama');
    }
    console.log('  ✓ Ollama is running');
    console.log('');

    // Step 2: Transcribe audio
    console.log('Step 2: Transcribing audio...');
    console.log('  Reading audio file...');
    console.log('  Sending to Deepgram for transcription...');
    const result = await transcribeFile(inputPath);
    const transcriptText = formatTranscript(result);

    const utterances = result.results?.utterances || [];
    const speakers = new Set(utterances.map(u => u.speaker));
    const duration = result.metadata?.duration || 0;
    const durationFormatted = formatTimestamp(duration);

    console.log('  ✓ Transcription complete!');
    console.log(`    Duration: ${durationFormatted}`);
    console.log(`    Speakers: ${speakers.size}`);
    console.log(`    Utterances: ${utterances.length}`);
    console.log('');

    // Step 3: Generate AI summary
    console.log('Step 3: Generating AI summary and keywords...');
    const { summary, keywords } = await generateSummary(title, transcriptText);
    console.log('  ✓ Generated successfully');
    console.log(`    Summary: ${summary.substring(0, 80)}...`);
    console.log(`    Keywords: ${keywords.slice(0, 5).join(', ')}...`);
    console.log('');

    // Step 4: Create files
    console.log('Step 4: Creating episode files...');

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
    console.log('3. Upload MP3 to S3:');
    console.log(`   aws s3 cp ${inputPath} s3://twistoflemonpod/episodes/${mp3Basename}.mp3`);
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
