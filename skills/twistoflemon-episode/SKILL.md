---
name: twistoflemon-episode
description: Create and update Life With a Twist of Lemon podcast episode posts and transcript frontmatter in /Users/stan/Sites/twistoflemonpod. Use when adding frontmatter to transcript files in content/blog/YYYY-MM-DD and generating the matching episode post with summary, categories/tags/keywords, and enclosure metadata.
---

# Twistoflemon Episode

## Overview

Create episode artifacts for the Twist of Lemon podcast by adding transcript frontmatter and generating the matching episode post in `content/blog/YYYY-MM-DD/`.

## Workflow

### 1) Locate the latest transcript

- Find the newest date folder under `content/blog/`.
- Identify the transcript file (pattern: `NNN-lwatol-YYYYMMDD.md`) that lacks frontmatter.

### 2) Review the previous episode structure

- Open the prior episode in the previous date folder.
- Reuse its frontmatter structure and formatting conventions.

### 3) Add transcript frontmatter

- Use the transcript template from `references/episode-templates.md`.
- Set:
  - `title`: "<Episode Title> - Transcript"
  - `episode`: integer
  - `date`: `YYYY-MM-DDT06:00:00.000Z`
  - `slug`: `<episode-slug>/transcript`
  - `type`: `transcript`
  - `summary`, `keywords`: derived from transcript content
- Keep the transcript body untouched below the frontmatter.

### 4) Create the episode post

- Name the file: `NNN-<episode-slug>.md` in the same date folder.
- Use the episode post template from `references/episode-templates.md`.
- Set:
  - `title`, `slug`, `episode`, `date`, `summary`
  - `categories`, `tags`, `keywords`
  - `enclosure.url` using the standard MP3 URL format
  - `enclosure.length` from the local MP3 file size (bytes)
  - `enclosure.type`: `audio/mpeg`
- Draft the episode letter body in the same style as recent posts.

### 5) Sanity checks

- Ensure `summary`, `categories`, `tags`, and `keywords` match the transcript topics.
- Confirm slug consistency across transcript and post.
- Verify enclosure length matches the MP3 on disk.

## References

- Frontmatter templates and naming conventions: `references/episode-templates.md`
