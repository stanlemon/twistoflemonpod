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

import { createClient } from '@deepgram/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  console.error('Error: DEEPGRAM_API_KEY environment variable is not set');
  console.error('Please set it in your .env file or export it in your shell');
  process.exit(1);
}

/**
 * Format seconds to HH:MM:SS
 */
function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format Deepgram result as markdown with speaker labels
 */
function formatTranscript(result) {
  const utterances = result.results?.utterances || [];

  if (utterances.length === 0) {
    return 'No transcript available.';
  }

  let markdown = '';

  for (const utterance of utterances) {
    const speaker = `SPEAKER_${utterance.speaker}`;
    const startTime = formatTimestamp(utterance.start);
    const text = utterance.transcript;

    markdown += `**${speaker}** [${startTime}]\n\n${text}\n\n`;
  }

  return markdown;
}

/**
 * Transcribe audio file using Deepgram
 */
async function transcribeFile(filePath) {
  console.log(`Reading file: ${filePath}`);

  const audioBuffer = readFileSync(filePath);
  const deepgram = createClient(DEEPGRAM_API_KEY);

  console.log('Sending to Deepgram for transcription...');

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      model: 'nova-3',
      language: 'en',
      smart_format: true,
      paragraphs: true,
      utterances: true,
      diarize: true,
    },
  );

  if (error) {
    throw new Error(`Deepgram error: ${error.message}`);
  }

  return result;
}

/**
 * Main function
 */
async function main() {
  // Check command line arguments
  if (process.argv.length < 3) {
    console.error('Usage: node scripts/transcribe-with-deepgram.js <path-to-mp3-file>');
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
