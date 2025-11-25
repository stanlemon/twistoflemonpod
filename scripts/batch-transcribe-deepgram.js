#!/usr/bin/env node

/**
 * Batch transcribe audio files using Deepgram API with speaker diarization
 *
 * Usage: node scripts/batch-transcribe-deepgram.js [start-episode]
 *
 * Requires: DEEPGRAM_API_KEY environment variable
 */

import { createClient } from "@deepgram/sdk";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, basename, extname } from "path";
import dotenv from "dotenv";

dotenv.config();

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const EPISODES_DIR = resolve(
  process.env.HOME,
  "Sites/twistoflemonpod-mp3s/episodes",
);

if (!DEEPGRAM_API_KEY) {
  console.error("Error: DEEPGRAM_API_KEY environment variable is not set");
  console.error("Please set it in your .env file or export it in your shell");
  process.exit(1);
}

/**
 * Format seconds to HH:MM:SS
 */
function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Format Deepgram result as markdown with speaker labels
 */
function formatTranscript(result) {
  const utterances = result.results?.utterances || [];

  if (utterances.length === 0) {
    return "No transcript available.";
  }

  let markdown = "";

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
  const audioBuffer = readFileSync(filePath);
  const deepgram = createClient(DEEPGRAM_API_KEY);

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      model: "nova-3",
      language: "en",
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
 * Extract episode number from filename
 */
function getEpisodeNumber(filename) {
  const match = filename.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Main function
 */
async function main() {
  const startEpisode = process.argv[2] ? parseInt(process.argv[2], 10) : 4;

  console.log("Deepgram Batch Transcription");
  console.log("============================");
  console.log(`Episodes directory: ${EPISODES_DIR}`);
  console.log(`Starting from episode: ${startEpisode}`);
  console.log("");

  // Get all MP3 files
  const files = readdirSync(EPISODES_DIR)
    .filter((f) => f.endsWith(".mp3"))
    .sort();

  // Filter by episode number
  const filesToProcess = files.filter((file) => {
    const episodeNum = getEpisodeNumber(file);
    return episodeNum && episodeNum >= startEpisode;
  });

  console.log(`Found ${filesToProcess.length} episodes to process\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];
    const inputPath = resolve(EPISODES_DIR, file);
    const outputPath = resolve(
      EPISODES_DIR,
      `${basename(file, extname(file))}.md`,
    );
    const episodeNum = getEpisodeNumber(file);

    console.log(
      `\n[${i + 1}/${filesToProcess.length}] Episode ${episodeNum}: ${file}`,
    );
    console.log("─".repeat(60));

    // Check if already transcribed
    if (existsSync(outputPath)) {
      console.log("⏭️  Already transcribed, skipping...");
      skipped++;
      continue;
    }

    try {
      console.log("📡 Sending to Deepgram...");
      const result = await transcribeFile(inputPath);

      console.log("📝 Formatting transcript...");
      const markdown = formatTranscript(result);

      console.log("💾 Saving transcript...");
      writeFileSync(outputPath, markdown, "utf-8");

      // Print stats
      const utterances = result.results?.utterances || [];
      const speakers = new Set(utterances.map((u) => u.speaker));
      const duration = result.metadata?.duration || 0;

      console.log("✅ Success!");
      console.log(`   Duration: ${formatTimestamp(duration)}`);
      console.log(`   Speakers: ${speakers.size}`);
      console.log(`   Utterances: ${utterances.length}`);

      processed++;
    } catch (error) {
      console.error("❌ Error:", error.message);

      // Check if it's a credit limit error
      if (
        error.message.includes("402") ||
        error.message.includes("credits") ||
        error.message.includes("quota")
      ) {
        console.log("\n💳 Deepgram credits exhausted!");
        break;
      }

      errors++;
    }
  }

  // Final summary
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n");
  console.log("═".repeat(60));
  console.log("BATCH TRANSCRIPTION SUMMARY");
  console.log("═".repeat(60));
  console.log(`✅ Processed: ${processed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`⏱️  Time: ${elapsed} minutes`);
  console.log("═".repeat(60));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
