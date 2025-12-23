---
description: Create episode post from transcript file
---

Create a new podcast episode from a transcript file.

## Arguments

The path to the transcript file (can be anywhere, e.g., `~/Downloads/transcript.md`)

Transcript path: $ARGUMENTS

## Instructions

1. **Prompt for episode details first**:
   - Episode number (check the latest episode in `content/blog/` and increment)
   - Episode title (can refine after reading transcript)
   - Publish date (default to today, format: YYYY-MM-DD)

2. **Set up episode directory**:
   - Create directory: `content/blog/{publish-date}/`
   - Move the transcript file into that directory

3. **Read a recent episode as template**: Look at the most recent episode in `content/blog/` (not a transcript) to understand the frontmatter structure (title, slug, episode, date, categories, tags, enclosure)

4. **Read the transcript file**: Analyze the content

5. **Extract from transcript**:
   - Main topics and themes discussed
   - Appropriate categories (use existing categories like: Technology, Lifestyle, AI, Food, Finance, etc.)
   - Relevant tags (5-10 specific topics mentioned)
   - A concise 2-3 paragraph summary suitable for the episode description
   - Suggest a refined title if the initial one could be improved

6. **Check for MP3 file**:
   - Look for the MP3 at `~/Sites/twistoflemonpod-mp3s/{episode}-lwatol-{YYYYMMDD}.mp3`
   - If found, get the file size in bytes for `enclosure.length`
   - If not found, set `length: null` (can be updated manually later)

7. **Create the main episode post**:
   - File: `content/blog/YYYY-MM-DD/{episode-number}-{slug}.md`
   - Include: title, slug, episode, date, categories, tags, enclosure (url with pattern `https://media.twistoflemonpod.com/{episode}-lwatol-{YYYYMMDD}.mp3`, length from MP3 file or null, type: audio/mpeg)
   - Body: "Dear Listener," followed by summary, ending with "Thanks for listening,\n\nStan Lemon & Jon Kohlmeier"

8. **Add frontmatter to transcript**:
   - title: "{Episode Title} - Transcript"
   - episode: same as main post
   - date: same as main post
   - slug: "{main-slug}/transcript"
   - type: transcript
   - summary: 2-3 sentence AI-generated summary
   - keywords: array of 10-15 relevant keywords

9. **Rename transcript file** to match pattern: `{episode}-lwatol-{YYYYMMDD}.md`

10. **Validate**: Run `npm test` to ensure the build passes

11. **Report**: Show the created files and whether MP3 metadata was found
