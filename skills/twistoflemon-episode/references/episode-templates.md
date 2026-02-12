# Episode Templates

## Naming conventions

- Folder: `content/blog/YYYY-MM-DD/`
- Transcript file: `NNN-lwatol-YYYYMMDD.md`
- Episode post file: `NNN-<episode-slug>.md`
- MP3 URL: `https://media.twistoflemonpod.com/NNN-lwatol-YYYYMMDD.mp3`

## Transcript frontmatter template

```yaml
---
title: "<Episode Title> - Transcript"
episode: <NNN>
date: YYYY-MM-DDT06:00:00.000Z
slug: <episode-slug>/transcript
type: transcript
summary: >-
  <1-3 sentence summary>
keywords:
  - <keyword 1>
  - <keyword 2>
  - <keyword 3>
---
```

## Episode post frontmatter template

```yaml
---
title: "<Episode Title>"
slug: <episode-slug>
episode: <NNN>
date: YYYY-MM-DDT06:00:00.000Z
summary: >-
  <1-3 sentence summary>
categories:
  - Lifestyle
  - Technology
  - AI
  - Food
# Adjust categories per episode content.
tags:
  - <tag 1>
  - <tag 2>
keywords:
  - <keyword 1>
  - <keyword 2>
enclosure:
  url: https://media.twistoflemonpod.com/NNN-lwatol-YYYYMMDD.mp3
  length: <bytes>
  type: audio/mpeg
---
```

## Episode post body template

```markdown
Dear Listener,

<Paragraph 1: opening highlights>

<Paragraph 2: mid-show highlights>

<Paragraph 3: closing highlights>

Thanks for listening,

Stan Lemon & Jon Kohlmeier
```
