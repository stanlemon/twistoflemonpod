# Life with a Twist of Lemon - Development Guide

## Project Overview

This is the source code for the "Life with a Twist of Lemon" podcast website, hosted at https://twistoflemonpod.com/. The site features 172 podcast episodes with full audio player support, category/tag organization, and a podcast-compatible RSS feed.

**Hosts:** Jon Kohlmeier & Stan Lemon

**Topics:** Technology, finance, life, craftsmanship, theology, and everything else with a twist of lemon

## Technology Stack

### Core Framework
- **Eleventy (11ty) 3.x**: Static site generator chosen for simplicity and performance
- **Node.js 22.x**: Runtime environment (see `.nvmrc`)
- **Liquid Templates**: Primary templating engine for layouts and includes

### Key Dependencies
- `@11ty/eleventy-plugin-rss`: RSS feed generation with podcast support
- `@11ty/eleventy-plugin-syntaxhighlight`: Code syntax highlighting
- `@11ty/eleventy-img`: Image optimization
- `plyr`: Audio player for podcast episodes
- `luxon`: Date/time formatting and manipulation
- `markdown-it`: Markdown processing with anchor support
- `gray-matter`: YAML frontmatter parsing (for scripts)

### Development Tools
- `prettier`: Code formatting
- Custom test suite: Build validation and content validation

## Architecture

### Content Structure
```
content/blog/YYYY-MM-DD/slug.md
```

Each episode is a Markdown file with YAML frontmatter containing:
- `title`: Episode title
- `slug`: URL slug (optional, auto-generated from title)
- `episode`: Episode number
- `date`: ISO 8601 date string
- `categories`: Array of categories
- `tags`: Array of tags
- `enclosure`: Podcast audio file metadata
  - `url`: S3 URL to MP3 file
  - `length`: File size in bytes
  - `type`: MIME type (audio/mpeg)

### Site Structure
```
src/
├── _data/           # Global site data
├── _includes/       # Layouts and partials
│   ├── layouts/     # Page templates
│   └── partials/    # Reusable components
├── css/             # Stylesheets
├── images/          # Static images
├── feed.liquid      # RSS/Podcast feed template
├── sitemap.liquid   # XML sitemap
├── categories.liquid # Category archive pages
└── tags.liquid      # Tag archive pages

content/blog/        # All episode markdown files
index.liquid         # Homepage with pagination
scripts/             # Utility scripts for maintenance
tests/               # Test suite
```

### Build Output
- Output directory: `_site/`
- Build time: ~0.4 seconds for 283 pages
- Pages generated:
  - 172 episode pages
  - 17 pagination pages
  - 15 category pages
  - 88 tag pages
  - Feed, sitemap, and index

## Development Workflow

### Best Practices

**CRITICAL: Always work in small, iterative phases**

1. **Break Down Work**: Divide any task into small, logical phases
2. **Test First**: Run `npm test` before making changes to establish baseline
3. **Make Changes**: Implement one phase at a time
4. **Test Again**: Run `npm test` after each phase
5. **Build**: Run `npm run build` to verify site generation
6. **Commit**: Create a git commit for each working phase
7. **Repeat**: Move to the next phase

### Commit Guidelines

Each commit should:
- Represent a complete, working unit of change
- Pass all tests (`npm test`)
- Build successfully (`npm run build`)
- Have a clear, descriptive commit message

Example workflow:
```bash
# Make a small change
npm test                  # Verify tests pass
npm run build            # Verify build works
git add .
git commit -m "Add duration field to RSS feed template"

# Make next change
npm test
npm run build
git add .
git commit -m "Update enclosure metadata script to include duration"
```

### Testing Strategy

Run the test suite frequently:
```bash
npm test
```

Tests verify:
- Build succeeds and generates expected files
- Required pages are created (feed.xml, sitemap.xml)
- Correct number of pages generated
- All frontmatter fields are valid
- No posts are missing required fields

### Common Tasks

**Start Development Server:**
```bash
npm run dev
# Site available at http://localhost:8080
```

**Run Tests:**
```bash
npm test
```

**Build Site:**
```bash
npm run build
```

**Format Code:**
```bash
npm run format
```

**Clean Build:**
```bash
npm run clean && npm run build
```

## Scripts

Utility scripts are located in `scripts/` directory:

### Script Storage Policy

**IMPORTANT:** One-off refactoring scripts should NOT be committed to git.

- **DO commit:** Reusable utility scripts that will be run multiple times (e.g., `update-enclosure-metadata.js`)
- **DO NOT commit:** One-time refactoring scripts created for specific cleanup tasks (e.g., `rename-transcripts-to-match-mp3.js`, `add-frontmatter-to-transcripts.js`, `copy-transcripts-to-posts.js`)
- **Reason:** Keeps the repository clean and focused on actively maintained utilities

When creating a one-off refactoring script:
1. Create it in the `scripts/` directory
2. Run it to complete the refactoring
3. DO NOT add it to git (add to `.gitignore` if needed)
4. Delete it after the refactoring is complete and committed

### Content Management Scripts (JavaScript/Node.js)
- `update-enclosure-metadata.js`: Updates podcast enclosure metadata (length, type) from actual MP3 files
- `add-episode-numbers.js`: Adds episode numbers to posts missing them
- `add-slug-to-frontmatter.js`: Generates URL slugs from titles
- Various other maintenance scripts

### Transcription Scripts (JavaScript/Node.js)
- `transcribe-with-deepgram.js`: Transcribe a single episode using Deepgram API with speaker diarization
- `batch-transcribe-deepgram.js`: Batch transcribe all episodes with progress tracking and resume capability

**Requirements:**
- Deepgram API key set in `.env` file as `DEEPGRAM_API_KEY`
- `dotenv` package for environment variable management

**Status:** All 170 episodes have been transcribed (episodes 1-172 plus b01, b02 bonus episodes)

### Running Scripts

Scripts can be run directly:
```bash
node scripts/update-enclosure-metadata.js
```

Always test and build after running scripts:
```bash
node scripts/some-script.js
npm test
npm run build
```

## Recent Work & Learnings

### Deepgram Transcription System (2025-10-26)

**Goal:** Transcribe all 172 podcast episodes with accurate speaker identification using a fast, cloud-based solution.

**Solution Implemented:**

**Technology Stack:**
- **Deepgram API**: Cloud-based transcription with built-in speaker diarization
- **Node.js**: JavaScript runtime (same as project)
- **@deepgram/sdk**: Official Deepgram SDK for Node.js
- **dotenv**: Environment variable management for API keys

**Scripts Created:**

1. **`transcribe-with-deepgram.js`**
   - Single episode transcription
   - Speaker diarization (automatically detects 2-3 speakers)
   - Outputs markdown with timestamps and speaker labels
   - Fast processing (~30-60 seconds per episode)
   - Usage: `node scripts/transcribe-with-deepgram.js <path-to-mp3>`

2. **`batch-transcribe-deepgram.js`**
   - Batch processing with progress tracking
   - Resume capability (skips already-transcribed episodes)
   - Statistics and error reporting
   - Automatic credit limit detection
   - Usage: `node scripts/batch-transcribe-deepgram.js [start-episode]`

**Output Format:**
- Markdown files saved alongside MP3 files
- Format: `**SPEAKER_0** [HH:MM:SS]\n\n[text]\n\n`
- Speaker labels: `SPEAKER_0`, `SPEAKER_1`, etc.
- Clean, readable format with paragraph breaks

**Setup Requirements:**
1. Deepgram account (free trial available)
2. API key stored in `.env` file as `DEEPGRAM_API_KEY`
3. `.env` file excluded from git via `.gitignore`

**Performance:**
- Cloud-based processing (no local GPU needed)
- ~30-60 seconds per episode
- Completed all 170 episodes in ~40 minutes
- Cost-effective (pay-as-you-go pricing)

**Results:**
- ✅ All 170 episodes transcribed successfully
  - Episodes 1-172 (numbering gaps exist)
  - Bonus episodes b01, b02
- 100% success rate
- Consistent 2-speaker detection (with occasional 3-speaker episodes for guests)

**Key Decisions:**
- Switched from local Python/WhisperX to cloud-based Deepgram for speed
- Removed old Python scripts and documentation
- Used environment variables for API key security
- Kept scripts in version control (API key separate in .env)

**Future Enhancements:**
1. Website integration (display transcripts on episode pages)
2. Full-text search across all transcripts
3. Manual speaker identification (map SPEAKER_0/SPEAKER_1 to Jon/Stan)
4. SEO improvements with transcript content

**Key Learning:** Deepgram provides production-quality transcription with speaker diarization via a simple API, processing episodes in seconds rather than minutes. Cloud-based solutions can be more practical than local ML models for one-time bulk processing tasks.

### SEO Improvements (2025-10-26)

**Goal:** Comprehensive SEO analysis and improvements for better search visibility and podcast discovery.

**Implemented Changes:**

1. **Structured Data (JSON-LD)**
   - Created `src/_includes/partials/structured-data.liquid`
   - PodcastEpisode schema for all episodes
   - BlogPosting schema for SEO
   - WebSite schema for homepage
   - Organization schema for brand identity

2. **Enhanced Meta Tags**
   - Added Open Graph images (og:image with dimensions)
   - Added og:audio tags for podcast episodes
   - Upgraded Twitter Card to summary_large_image
   - Added meta keywords and author tags
   - Improved title tag strategy (no site name on posts to avoid truncation)

3. **Semantic HTML**
   - Added ARIA roles (main, navigation, contentinfo)
   - Added microdata to blog posts (itemscope, itemprop)
   - Proper time elements with datetime attributes
   - Enhanced accessibility with aria-labels

4. **Breadcrumb Navigation**
   - Created `src/_includes/partials/breadcrumb.liquid`
   - Schema.org BreadcrumbList markup
   - Applied to category and tag archive pages

5. **Improved robots.txt**
   - Added sitemap reference
   - Explicitly allowed feed.xml for podcast aggregators

6. **RSS Feed Auto-Discovery**
   - Added link tag to all pages for browser/app discovery

7. **Enhanced Archive Pages**
   - Dynamic meta descriptions for categories and tags
   - Better titles for SEO

**Documentation Created:**
- `SEO-GUIDE.md` - Comprehensive SEO implementation guide
- `SECURITY-HEADERS.md` - HTTP security headers recommendations

**Benefits:**
- Podcast episodes will appear in Google Podcasts search
- Rich snippets in Google search results (articles, breadcrumbs)
- Better social media sharing with images
- Improved accessibility scores
- Enhanced podcast app discovery (Apple Podcasts, Spotify)

**Key Learning:** Modern SEO requires multiple layers:
1. Structured data for search engine understanding
2. Meta tags for social media
3. Semantic HTML for accessibility
4. Clear site hierarchy with breadcrumbs
5. Proper robots.txt and sitemap

### Podcast Feed Enclosure Metadata (2025-10-25)

**Problem:** The RSS feed's `<enclosure>` tags were missing or had incorrect metadata:
- 99 posts had `length: null` and `type: null`
- 68 posts had placeholder values like `length: 221`
- Only 4 posts had correct metadata

**Solution:** Created `scripts/update-enclosure-metadata.js` to:
1. Read all blog post markdown files
2. Extract MP3 filename from S3 URL
3. Get actual file size from local MP3 files in `~/Sites/twistoflemonpod-mp3s/episodes/`
4. Update frontmatter with correct values
5. Write back to files

**Result:** All 172 posts now have:
- Accurate `length` in bytes
- Correct `type: audio/mpeg`
- Podcast feed fully compliant with Apple Podcasts, Spotify requirements

**Key Learning:** Podcast aggregators require the `length` attribute in enclosure tags. Missing it causes episodes to not appear or malfunction in podcast apps.

### Migration from Gatsby (2025-10)

Successfully migrated from Gatsby to Eleventy for:
- Faster build times (from minutes to <0.5 seconds)
- Simpler architecture and easier maintenance
- Better developer experience
- Maintained all functionality including audio players, feeds, and SEO

## RSS Feed & Podcast Compatibility

The RSS feed (`/feed.xml`) is generated from `src/feed.liquid` and includes:

- Standard RSS 2.0 structure
- iTunes podcast namespace
- Proper `<enclosure>` tags with URL, length, and MIME type
- iTunes-specific fields (duration, categories, etc.)
- Full episode descriptions

The feed is podcast-compatible and can be submitted to:
- Apple Podcasts
- Spotify
- Google Podcasts
- Other podcast directories

## Maintenance

### Keeping This File Updated

**IMPORTANT:** As you work on this project, update this CLAUDE.md file with:

1. **New learnings**: Document solutions to problems encountered
2. **Architecture changes**: Update if project structure changes
3. **New scripts**: Document any new utility scripts added
4. **Dependencies**: Note new packages or version upgrades
5. **Best practices**: Add any new patterns or approaches discovered

Also keep `README.md` updated with user-facing changes like:
- New features
- Updated installation steps
- Performance improvements
- Breaking changes

### Documentation Philosophy

- **CLAUDE.md**: Developer-focused, comprehensive technical guide
- **README.md**: User-focused, quick start guide for running the site
- Keep them in sync but avoid duplication
- CLAUDE.md is the source of truth for development workflows

## Deployment

The site is static and can be deployed to any static hosting:

**GitHub Pages:**
- Build command: `npm run build`
- Publish directory: `_site`
- Branch: Configure in GitHub Pages settings

**Other Hosts:**
- Netlify, Vercel, Cloudflare Pages all supported
- Same build command and output directory

## Audio Files

Audio files are hosted on AWS S3:
- Bucket: `twistoflemonpod`
- Region: `us-east-2`
- Path: `episodes/NNN-lwatol-YYYYMMDD.mp3`

Local copies are maintained in: `~/Sites/twistoflemonpod-mp3s/episodes/`

## Troubleshooting

### Build Fails
1. Check `npm test` for validation errors
2. Verify all post frontmatter is valid YAML
3. Ensure all required fields are present
4. Check for syntax errors in templates

### Feed Not Valid
1. Verify all enclosure URLs are accessible
2. Ensure `length` values are accurate file sizes in bytes
3. Confirm `type` is set to `audio/mpeg` for MP3 files
4. Test with [Podbase Validator](https://podbase.org/validate)

### Missing Pages
1. Check `.eleventy.js` configuration
2. Verify passthrough copy settings
3. Ensure pagination is configured correctly
4. Run `npm run clean && npm run build`

## Git Workflow

Always work on feature branches:

```bash
# Create feature branch
git checkout -b feature/description

# Make small changes with tests/build between commits
npm test && npm run build
git add .
git commit -m "Descriptive message"

# Continue iterating
npm test && npm run build
git add .
git commit -m "Next change"

# Push when ready
git push origin feature/description
```

Create pull requests for review before merging to main branches.

## Performance Metrics

Current performance (as of 2025-10-25):
- Build time: ~0.4 seconds
- Total pages: 283
- Total posts: 172
- Categories: 15
- Tags: 88
- Average build per page: ~1.4ms

## Resources

- [11ty Documentation](https://www.11ty.dev/docs/)
- [Liquid Templating](https://liquidjs.com/)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [iTunes Podcast RSS](https://podcasters.apple.com/support/823-podcast-requirements)
- [Plyr Audio Player](https://plyr.io/)

## License

Content © Jon Kohlmeier & Stan Lemon

## Contributing

When contributing to this project:

1. Follow the iterative workflow described above
2. Keep commits small and focused
3. Always test and build between commits
4. Update this CLAUDE.md with new learnings
5. Update README.md if user-facing changes
6. Write clear commit messages
7. Document any new scripts or utilities

---

**Last Updated:** 2025-10-25
**Version:** 2.0.0 (Eleventy)
