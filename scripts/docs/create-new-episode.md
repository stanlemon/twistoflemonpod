# Creating New Episodes - Complete Guide

This guide explains how to use the `create-new-episode.js` script to fully automate the creation of new podcast episodes.

## Overview

The `create-new-episode.js` script is a complete, automated workflow that:

1. Prompts for episode details interactively
2. Transcribes the audio using Deepgram
3. Generates AI summary and keywords using Ollama
4. Creates both the episode post AND transcript files
5. Sets up the correct directory structure
6. Provides next steps for publishing

## Prerequisites

Before running the script, ensure you have:

1. **Deepgram API Key**

   ```bash
   # Add to .env file:
   DEEPGRAM_API_KEY=your_api_key_here
   ```

2. **Ollama Installed and Running**

   ```bash
   brew install ollama
   brew services start ollama
   ollama pull llama3.2:3b
   ```

3. **MP3 File Ready**
   - Audio file should be in a known location
   - Example: `~/Sites/twistoflemonpod-mp3s/episodes/173-new-episode.mp3`

## Usage

### Basic Command

```bash
node scripts/create-new-episode.js <path-to-mp3-file>
```

### Example

```bash
node scripts/create-new-episode.js ~/Sites/twistoflemonpod-mp3s/episodes/173-new-episode.mp3
```

### Optional Flags

| Flag                   | Description                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--skip-transcription` | Skips the Deepgram transcription and AI summarization steps. Transcript and episode stubs are still generated with placeholder text so you can fill them in later. |
| `--upload`             | Uploads the provided MP3 to Cloudflare R2 (S3-compatible) after the files are generated. Requires the `aws` CLI to be configured for your R2 bucket.               |

When using `--upload`, you can configure the destination via environment variables:

```bash
export R2_BUCKET="s3://twistoflemonpod/episodes"
export R2_ENDPOINT_URL="https://<account-id>.r2.cloudflarestorage.com"
```

If you skip transcription now but want an AI summary later, run the dedicated script once you have the transcript ready:

```bash
node scripts/add-ai-summaries.js --file=content/blog/2025-11-15/173-lwatol-20251115.md
```

### Interactive Prompts

The script will prompt you for:

1. **Episode number** (e.g., `173`)
2. **Episode title** (e.g., `New Adventures in Podcasting`)
3. **Publish date** (format: `YYYY-MM-DD`, or press Enter for today)

Example interaction:

```
Episode number: 173
Episode title: New Adventures in Podcasting
Publish date (YYYY-MM-DD) [today]: 2025-11-15
```

## What Gets Created

The script creates the following files in `content/blog/YYYY-MM-DD/`:

### 1. Episode Post (`NNN-slug.md`)

Main episode file with:

- Title, slug, episode number
- Categories (defaults to "Technology")
- Tags (from AI keywords)
- Enclosure metadata (URL, file size, duration)
- AI-generated summary
- Basic episode content template

Example: `content/blog/2025-11-15/173-new-adventures-in-podcasting.md`

### 2. Transcript File (`NNN-lwatol-YYYYMMDD.md`)

Transcript file with:

- Complete transcription with speaker labels and timestamps
- Episode metadata
- AI-generated summary and keywords
- Type marked as `transcript`

Example: `content/blog/2025-11-15/173-lwatol-20251115.md`

## After Running the Script

The script will print next steps:

1. **Review the generated files**
   - Check episode content and edit as needed
   - Update categories if needed
   - Review tags (generated from keywords)

2. **Upload MP3 to Cloudflare R2 (or S3)**
   - Run this manually if you skipped the `--upload` flag

   ```bash
   aws s3 cp ~/path/to/episode.mp3 s3://twistoflemonpod/episodes/
   ```

   - When `--upload` is used the script runs this step for you

3. **Test and build**

   ```bash
   npm test && npm run build
   ```

4. **Commit and deploy**
   ```bash
   git add .
   git commit -m "Add episode 173: New Adventures in Podcasting"
   git push
   ```

## Script Architecture

### Shared Utilities (`scripts/lib/utils.js`)

All episode processing scripts now share common code:

- **Deepgram Functions:**
  - `transcribeFile()`: Transcribe audio with speaker diarization
  - `formatTranscript()`: Format result as markdown
  - `formatTimestamp()`: Convert seconds to HH:MM:SS

- **Ollama Functions:**
  - `checkOllama()`: Verify Ollama is running
  - `callOllama()`: Call Ollama API
  - `generateSummary()`: Generate summary and keywords
  - `createSummaryPrompt()`: Build prompt for AI
  - `parseAIResponse()`: Parse AI response

- **File Operations:**
  - `ensureDir()`: Create directory if needed
  - `writeMarkdownFile()`: Write file with frontmatter
  - `readMarkdownFile()`: Read file with frontmatter
  - `getFileSize()`: Get file size in bytes

- **Utility Functions:**
  - `formatDateForDir()`: Format date as YYYY-MM-DD
  - `parseDate()`: Parse date string to Date object
  - `slugify()`: Convert title to URL slug
  - `prompt()`: Interactive user input

### Related Scripts

- **`transcribe-with-deepgram.js`**: Standalone transcription (outputs .md file)
- **`add-ai-summaries.js`**: Add summaries to existing transcripts
- **`batch-transcribe-deepgram.js`**: Batch process multiple episodes

All scripts now use the shared utilities from `scripts/lib/utils.js`.

## Troubleshooting

### Deepgram API Error

```
Error: DEEPGRAM_API_KEY environment variable is not set
```

**Solution:** Add your API key to `.env` file

### Ollama Not Running

```
Error: Ollama is not running
```

**Solution:**

```bash
brew services start ollama
# or
ollama serve
```

### Missing Model

```
Error: Model not found
```

**Solution:**

```bash
ollama pull llama3.2:3b
```

### Invalid Date Format

```
Please enter a valid date in YYYY-MM-DD format
```

**Solution:** Use format like `2025-11-15` or press Enter for today

## Tips

1. **Episode Numbering:** Use the next sequential episode number
2. **Title Best Practices:** Keep titles descriptive but concise
3. **Future Dating:** You can set a future date for scheduled publishing
4. **Categories:** Default is "Technology" but can be edited after generation
5. **Tags:** Generated from AI keywords, review and adjust as needed
6. **S3 Upload:** Remember to upload the MP3 before deploying the site

## Example Workflow

Complete workflow for adding episode 173:

```bash
# 1. Run the script
node scripts/create-new-episode.js ~/Sites/twistoflemonpod-mp3s/episodes/173-new-episode.mp3

# Answer prompts:
# Episode number: 173
# Episode title: New Adventures in Podcasting
# Publish date (YYYY-MM-DD) [today]: <Enter>

# 2. Review generated files
cat content/blog/2025-11-10/173-new-adventures-in-podcasting.md

# 3. Upload to S3
aws s3 cp ~/Sites/twistoflemonpod-mp3s/episodes/173-new-episode.mp3 \
  s3://twistoflemonpod/episodes/

# 4. Test and build
npm test && npm run build

# 5. Commit
git add .
git commit -m "Add episode 173: New Adventures in Podcasting"

# 6. Deploy
git push
```

## Advanced: Code Reuse

If you're creating custom scripts, you can import the shared utilities:

```javascript
import {
  transcribeFile,
  generateSummary,
  writeMarkdownFile,
  slugify,
  formatTimestamp,
} from "./lib/utils.js";

// Use the functions in your script
const result = await transcribeFile("path/to/audio.mp3");
const { summary, keywords } = await generateSummary(title, transcript);
```

This ensures consistency across all episode processing scripts.
