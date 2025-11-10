#!/usr/bin/env node

/**
 * Transcribe audio files using Deepgram API with speaker diarization
 *
 * Usage: node scripts/transcribe-with-deepgram.js <path-to-mp3-file>
 *
 * Output: Creates a markdown file with the same name as the input file
 *
 * Requires: DEEPGRAM_API_KEY environment variable
 */

import { resolve, dirname, basename, extname } from 'path';
import { writeFileSync } from 'fs';
import {
  DEEPGRAM_API_KEY,
  transcribeFile,
  formatTranscript,
  formatTimestamp,
} from './lib/utils.js';

/**
 * Main function
 */
async function main() {
  // Check command line arguments
  if (process.argv.length < 3) {
    console.error('Usage: node scripts/transcribe-with-deepgram.js <path-to-mp3-file>');
    process.exit(1);
  }

  if (!DEEPGRAM_API_KEY) {
    console.error('Error: DEEPGRAM_API_KEY environment variable is not set');
    console.error('Please set it in your .env file or export it in your shell');
    process.exit(1);
  }

  const inputPath = resolve(process.argv[2]);
  const inputDir = dirname(inputPath);
  const inputBasename = basename(inputPath, extname(inputPath));
  const outputPath = resolve(inputDir, `${inputBasename}.md`);

  console.log('Deepgram Transcription');
  console.log('=====================');
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  console.log('');

  try {
    // Transcribe
    console.log('Reading file and sending to Deepgram...');
    const result = await transcribeFile(inputPath);

    // Format as markdown
    const markdown = formatTranscript(result);

    // Save transcript
    writeFileSync(outputPath, markdown, 'utf-8');

    console.log('✓ Transcription complete!');
    console.log(`✓ Saved to: ${outputPath}`);

    // Print some stats
    const utterances = result.results?.utterances || [];
    const speakers = new Set(utterances.map(u => u.speaker));
    const duration = result.metadata?.duration || 0;

    console.log('');
    console.log('Statistics:');
    console.log(`  Duration: ${formatTimestamp(duration)}`);
    console.log(`  Speakers: ${speakers.size}`);
    console.log(`  Utterances: ${utterances.length}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
