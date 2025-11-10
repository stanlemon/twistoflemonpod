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
import { resolve } from 'path';
import {
  OLLAMA_MODEL,
  checkOllama,
  generateSummary,
  readMarkdownFile,
  writeMarkdownFile,
} from './lib/utils.js';

const CONTENT_DIR = 'content/blog';

/**
 * Process a single transcript file
 */
async function processTranscriptFile(filePath, model) {
  console.log(`\nProcessing: ${filePath}`);

  // Read and parse file
  const { data: frontmatter, content } = readMarkdownFile(filePath);

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
    const { summary, keywords } = await generateSummary(frontmatter.title, content);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  ✓ Generated in ${duration}s`);
    console.log(`    Summary: ${summary.substring(0, 80)}...`);
    console.log(`    Keywords: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '...' : ''}`);

    // Update frontmatter
    frontmatter.summary = summary;
    frontmatter.keywords = keywords;

    // Write back to file
    writeMarkdownFile(filePath, frontmatter, content);
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
  const model = modelArg ? modelArg.split('=')[1] : OLLAMA_MODEL;

  console.log('='.repeat(70));
  console.log('Add AI Summaries and Keywords to Transcripts');
  console.log('='.repeat(70));
  console.log(`Model: ${model}`);
  console.log(`Test mode: ${testMode ? 'YES (processing 1 file only)' : 'NO'}`);
  console.log('='.repeat(70));

  // Check if Ollama is running
  const ollamaRunning = await checkOllama();
  if (!ollamaRunning) {
    console.error('✗ Error: Ollama is not running');
    console.error('  Please start it with: brew services start ollama');
    console.error('  Or run: ollama serve');
    process.exit(1);
  }
  console.log('✓ Ollama is running');

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
