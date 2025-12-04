---
description: Create episode post from transcript file
---

Create a new podcast episode from a transcript file.

## Arguments

The path to the transcript file (e.g., `content/blog/2025-12-04/transcript.md`)

Transcript path: $ARGUMENTS

## Instructions

1. **Read a recent episode as template**: Look at the most recent episode in `content/blog/` (not a transcript) to understand the frontmatter structure (title, slug, episode, date, categories, tags, enclosure)

2. **Read the transcript file**: Analyze the content at the provided path

3. **Extract from transcript**:
   - Main topics and themes discussed
   - Appropriate categories (use existing categories like: Technology, Lifestyle, AI, Food, Finance, etc.)
   - Relevant tags (5-10 specific topics mentioned)
   - A concise 2-3 paragraph summary suitable for the episode description

4. **Prompt for episode details**:
   - Episode number (check the latest episode and increment)
   - Episode title (suggest one based on content)
   - Publish date (default to today or the date in the directory name)

5. **Create the main episode post**:
   - File: `content/blog/YYYY-MM-DD/{episode-number}-{slug}.md`
   - Include: title, slug, episode, date, categories, tags, enclosure (url with pattern `https://media.twistoflemonpod.com/{episode}-lwatol-{YYYYMMDD}.mp3`, length: null, type: audio/mpeg)
   - Body: "Dear Listener," followed by summary, ending with "Thanks for listening,\n\nStan Lemon & Jon Kohlmeier"

6. **Add frontmatter to transcript**:
   - title: "{Episode Title} - Transcript"
   - episode: same as main post
   - date: same as main post
   - slug: "{main-slug}/transcript"
   - type: transcript
   - summary: 2-3 sentence AI-generated summary
   - keywords: array of 10-15 relevant keywords

7. **Rename transcript file** to match pattern: `{episode}-lwatol-{YYYYMMDD}.md`

8. **Validate**: Run `npm test` to ensure the build passes

9. **Report**: Show the created files and note that `enclosure.length` needs to be updated once the MP3 is available (can use `node scripts/update-enclosure-metadata.js`)
