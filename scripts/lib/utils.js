/**
 * Shared utilities for podcast episode processing
 *
 * This module contains common functions used across multiple scripts:
 * - Deepgram transcription
 * - Ollama AI processing
 * - Date/time formatting
 * - File operations
 */

import { createClient } from "@deepgram/sdk";
import { readFileSync, writeFileSync, statSync, mkdirSync } from "fs";
import { createInterface } from "readline";
import matter from "gray-matter";
import dotenv from "dotenv";

dotenv.config();

// Configuration
export const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
export const OLLAMA_BASE_URL = "http://localhost:11434";
export const OLLAMA_MODEL = "llama3.2:3b";
export const MAX_TRANSCRIPT_LENGTH = 8000; // words
export const MEDIA_BASE_URL = "https://media.twistoflemonpod.com";

/**
 * Format seconds to HH:MM:SS
 */
export function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Format date for directory name (YYYY-MM-DD)
 */
export function formatDateForDir(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Parse date string (YYYY-MM-DD) to Date object at 6am UTC
 */
export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 6, 0, 0));
}

/**
 * Generate slug from title
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Prompt user for input
 */
export function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Format Deepgram result as markdown with speaker labels
 */
export function formatTranscript(result) {
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
export async function transcribeFile(filePath) {
  if (!DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY environment variable is not set");
  }

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
 * Check if Ollama is running
 */
export async function checkOllama() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error("Ollama not responding");
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Call Ollama API to generate text
 */
export async function callOllama(prompt, model = OLLAMA_MODEL) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data.response;
}

/**
 * Truncate transcript to fit within token limits
 */
export function truncateTranscript(content) {
  const words = content.split(/\s+/);
  if (words.length <= MAX_TRANSCRIPT_LENGTH) {
    return content;
  }
  return (
    words.slice(0, MAX_TRANSCRIPT_LENGTH).join(" ") +
    "\n\n[Transcript truncated for analysis...]"
  );
}

/**
 * Create prompt for AI summary generation
 */
export function createSummaryPrompt(title, transcriptText) {
  const truncated = truncateTranscript(transcriptText);

  return `Analyze this podcast transcript and provide a concise summary and relevant keywords.

Podcast: "Life with a Twist of Lemon"
Hosts: Jon Kohlmeier & Stan Lemon
Episode: "${title}"
Topics: Technology, finance, life, craftsmanship, theology

Transcript:
${truncated}

Please provide your response in EXACTLY this format:
SUMMARY: [Write a 2-3 sentence summary that captures the main topics and discussion points]
KEYWORDS: keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7

Keep the summary engaging and informative. Keywords should be specific topics discussed (not generic terms).`;
}

/**
 * Parse AI response to extract summary and keywords
 */
export function parseAIResponse(response) {
  const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=\nKEYWORDS:|$)/s);
  const keywordsMatch = response.match(/KEYWORDS:\s*(.+?)$/s);

  if (!summaryMatch || !keywordsMatch) {
    throw new Error("Failed to parse AI response");
  }

  const summary = summaryMatch[1].trim();
  const keywords = keywordsMatch[1]
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  return { summary, keywords };
}

/**
 * Generate AI summary and keywords
 */
export async function generateSummary(title, transcriptText) {
  const prompt = createSummaryPrompt(title, transcriptText);
  const response = await callOllama(prompt);
  return parseAIResponse(response);
}

/**
 * Get file size for a given path
 */
export function getFileSize(filePath) {
  const stats = statSync(filePath);
  return stats.size;
}

/**
 * Ensure directory exists
 */
export function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

/**
 * Write markdown file with frontmatter
 */
export function writeMarkdownFile(filePath, frontmatter, content) {
  const file = matter.stringify(content, frontmatter);
  writeFileSync(filePath, file, "utf-8");
}

/**
 * Read markdown file with frontmatter
 */
export function readMarkdownFile(filePath) {
  const fileContent = readFileSync(filePath, "utf8");
  return matter(fileContent);
}
