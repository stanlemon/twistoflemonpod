#!/usr/bin/env node

/**
 * Add AI-generated summaries and keywords to transcript posts using Ollama (llama3.2:3b)
 *
 * Usage:
 *   node scripts/add-ai-summaries.js [--test] [--model=llama3.2:3b]
 *
 * Options:
 *   --test    Process only one file for testing
 *   --model   Specify Ollama model (default: llama3.2:3b)
 *
 * Requirements:
 *   - Ollama must be installed and running (brew install ollama && ollama serve)
 *   - Model must be pulled (ollama pull llama3.2:3b)
 */

import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import matter from 'gray-matter';
import { resolve } from 'path';

// Configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2:3b';
const MAX_TRANSCRIPT_LENGTH = 8000; // words
const CONTENT_DIR = 'content/blog';

/**
 * Call Ollama API to generate text
 */
async function callOllama(prompt, model = DEFAULT_MODEL) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    throw new Error(`Failed to call Ollama: ${error.message}`);
  }
}

/**
 * Truncate transcript to fit within token limits
 */
function truncateTranscript(content) {
  const words = content.split(/\s+/);
  if (words.length <= MAX_TRANSCRIPT_LENGTH) {
    return content;
  }
  return words.slice(0, MAX_TRANSCRIPT_LENGTH).join(' ') + '\n\n[Transcript truncated for analysis...]';
}

/**
 * Generate summary and keywords prompt
 */
function createPrompt(title, transcriptText) {
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
function parseResponse(response) {
  const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=\nKEYWORDS:|$)/s);
  const keywordsMatch = response.match(/KEYWORDS:\s*(.+?)$/s);

  if (!summaryMatch || !keywordsMatch) {
    throw new Error('Failed to parse AI response. Expected format: SUMMARY: ... KEYWORDS: ...');
  }

  const summary = summaryMatch[1].trim();
  const keywordsStr = keywordsMatch[1].trim();
  const keywords = keywordsStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  return { summary, keywords };
}

/**
 * Process a single transcript file
 */
async function processTranscriptFile(filePath, model) {
  console.log(`\nProcessing: ${filePath}`);

  // Read and parse file
  const fileContent = readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContent);

  // Skip if not a transcript
  if (frontmatter.type !== 'transcript') {
    console.log('  ⊘ Skipping (not a transcript)');
    return { status: 'skipped', reason: 'not_transcript' };
  }

  // Skip if already has summary and keywords
  if (frontmatter.summary && frontmatter.keywords) {
    console.log('  ✓ Already has summary and keywords');
    return { status: 'skipped', reason: 'already_processed' };
  }

  // Generate summary and keywords
  console.log('  → Calling Ollama...');
  const startTime = Date.now();

  try {
    const prompt = createPrompt(frontmatter.title, content);
    const response = await callOllama(prompt, model);
    const { summary, keywords } = parseResponse(response);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  ✓ Generated in ${duration}s`);
    console.log(`    Summary: ${summary.substring(0, 80)}...`);
    console.log(`    Keywords: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '...' : ''}`);

    // Update frontmatter
    frontmatter.summary = summary;
    frontmatter.keywords = keywords;

    // Write back to file
    const updatedContent = matter.stringify(content, frontmatter);
    writeFileSync(filePath, updatedContent, 'utf8');
    console.log('  ✓ File updated');

    return { status: 'success', duration, summary, keywords };
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const modelArg = args.find(arg => arg.startsWith('--model='));
  const model = modelArg ? modelArg.split('=')[1] : DEFAULT_MODEL;

  console.log('='.repeat(70));
  console.log('Add AI Summaries and Keywords to Transcripts');
  console.log('='.repeat(70));
  console.log(`Model: ${model}`);
  console.log(`Test mode: ${testMode ? 'YES (processing 1 file only)' : 'NO'}`);
  console.log('='.repeat(70));

  // Check if Ollama is running
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error('Ollama not responding');
    }
    console.log('✓ Ollama is running');
  } catch (error) {
    console.error('✗ Error: Ollama is not running');
    console.error('  Please start it with: brew services start ollama');
    console.error('  Or run: ollama serve');
    process.exit(1);
  }

  // Find all transcript files
  const pattern = resolve(CONTENT_DIR, '**/*.md');
  const files = glob.sync(pattern);
  console.log(`Found ${files.length} markdown files\n`);

  // Filter for transcripts and limit in test mode
  const filesToProcess = testMode ? files.slice(0, 1) : files;

  // Process files
  const stats = {
    total: filesToProcess.length,
    processed: 0,
    skipped: 0,
    errors: 0,
  };

  for (const file of filesToProcess) {
    const result = await processTranscriptFile(file, model);

    if (result.status === 'success') {
      stats.processed++;
    } else if (result.status === 'skipped') {
      stats.skipped++;
    } else if (result.status === 'error') {
      stats.errors++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('Summary');
  console.log('='.repeat(70));
  console.log(`Total files:     ${stats.total}`);
  console.log(`Processed:       ${stats.processed}`);
  console.log(`Skipped:         ${stats.skipped}`);
  console.log(`Errors:          ${stats.errors}`);
  console.log('='.repeat(70));

  if (testMode && stats.processed > 0) {
    console.log('\n✓ Test completed successfully!');
    console.log('  Remove --test flag to process all files');
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
