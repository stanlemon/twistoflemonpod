const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '../content/blog');
const MP3_DIR = '~/Sites/twistoflemonpod-mp3s/episodes';
const WHISPER_MODEL = 'large';
const PYTHON_PATH = path.join(process.env.HOME, '.pyenv/shims/python3');

function expandTilde(filepath) {
  if (filepath[0] === '~') {
    return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

function getAllMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function getFilenameFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 1].trim();
}

function findEpisodeForMp3(mp3Filename, markdownFiles) {
  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);

    if (parsed.data.enclosure && parsed.data.enclosure.url) {
      const urlFilename = getFilenameFromUrl(parsed.data.enclosure.url);
      if (urlFilename === mp3Filename) {
        return {
          path: filePath,
          dir: path.dirname(filePath),
          data: parsed.data
        };
      }
    }
  }

  return null;
}

function transcribeWithWhisper(mp3Path) {
  return new Promise((resolve, reject) => {
    const tmpDir = '/tmp/whisper-transcripts';

    // Ensure tmp directory exists
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const whisper = spawn(PYTHON_PATH, [
      '-m', 'whisper',
      mp3Path,
      '--model', WHISPER_MODEL,
      '--output_format', 'txt',
      '--output_dir', tmpDir
    ]);

    whisper.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    whisper.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    whisper.on('close', (code) => {
      if (code === 0) {
        const baseName = path.basename(mp3Path, '.mp3');
        const transcriptPath = path.join(tmpDir, `${baseName}.txt`);

        try {
          const transcript = fs.readFileSync(transcriptPath, 'utf8');
          // Clean up temp file
          fs.unlinkSync(transcriptPath);
          resolve(transcript);
        } catch (error) {
          reject(new Error(`Could not read transcript file: ${error.message}`));
        }
      } else {
        reject(new Error(`Whisper exited with code ${code}`));
      }
    });

    whisper.on('error', (error) => {
      reject(new Error(`Failed to start whisper: ${error.message}`));
    });
  });
}

async function processEpisode(mp3File, mp3Dir, markdownFiles) {
  const mp3Filename = path.basename(mp3File);
  const mp3Path = path.join(mp3Dir, mp3File);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Processing: ${mp3Filename}`);
  console.log(`${'='.repeat(80)}\n`);

  // Find corresponding episode
  const episode = findEpisodeForMp3(mp3Filename, markdownFiles);
  if (!episode) {
    console.error(`❌ Could not find episode for ${mp3Filename}`);
    return { success: false, file: mp3Filename, error: 'Episode not found' };
  }

  console.log(`✓ Found episode: ${episode.data.title}`);
  console.log(`  Directory: ${episode.dir}`);

  // Check if transcript already exists
  const transcriptPath = path.join(episode.dir, mp3Filename.replace('.mp3', '.md'));
  if (fs.existsSync(transcriptPath)) {
    console.log(`⊘ Transcript already exists, skipping: ${transcriptPath}`);
    return { success: true, file: mp3Filename, skipped: true };
  }

  // Transcribe with whisper
  console.log(`🎤 Transcribing with Whisper (model: ${WHISPER_MODEL})...`);
  try {
    const transcript = await transcribeWithWhisper(mp3Path);

    // Create markdown with frontmatter
    const markdown = matter.stringify(transcript.trim(), {
      title: episode.data.title,
      date: episode.data.date
    });

    // Write transcript file
    fs.writeFileSync(transcriptPath, markdown, 'utf8');
    console.log(`✅ Transcript saved: ${transcriptPath}`);

    return { success: true, file: mp3Filename };
  } catch (error) {
    console.error(`❌ Transcription failed: ${error.message}`);
    return { success: false, file: mp3Filename, error: error.message };
  }
}

async function main() {
  console.log('Transcript Generation Script');
  console.log('============================\n');

  const mp3Dir = expandTilde(MP3_DIR);
  console.log(`MP3 Directory: ${mp3Dir}`);
  console.log(`Blog Directory: ${BLOG_DIR}`);
  console.log(`Whisper Model: ${WHISPER_MODEL}\n`);

  // Get all markdown files (to find episodes)
  const markdownFiles = getAllMarkdownFiles(BLOG_DIR);
  console.log(`Found ${markdownFiles.length} markdown files`);

  // Get all MP3 files
  let mp3Files = fs.readdirSync(mp3Dir)
    .filter(f => f.endsWith('.mp3'))
    .sort();

  // Support for testing single file or limiting count via command line argument
  const testArg = process.argv[2];
  if (testArg) {
    // Check if it's a number (limit count)
    const count = parseInt(testArg);
    if (!isNaN(count)) {
      console.log(`\n⚠️  TEST MODE: Processing only first ${count} file(s)\n`);
      mp3Files = mp3Files.slice(0, count);
    } else if (mp3Files.includes(testArg)) {
      console.log(`\n⚠️  TEST MODE: Processing only ${testArg}\n`);
      mp3Files = [testArg];
    } else {
      console.error(`❌ File not found: ${testArg}`);
      console.log(`Available files: ${mp3Files.slice(0, 5).join(', ')}...`);
      process.exit(1);
    }
  }

  console.log(`Found ${mp3Files.length} MP3 file(s) to process\n`);

  const results = [];

  for (let i = 0; i < mp3Files.length; i++) {
    console.log(`Progress: ${i + 1}/${mp3Files.length}`);
    try {
      const result = await processEpisode(mp3Files[i], mp3Dir, markdownFiles);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error processing ${mp3Files[i]}:`, error.message);
      results.push({ success: false, file: mp3Files[i], error: error.message });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(80)}\n`);

  const successful = results.filter(r => r.success && !r.skipped);
  const skipped = results.filter(r => r.skipped);
  const failed = results.filter(r => !r.success);

  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Skipped: ${skipped.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed files:');
    failed.forEach(f => console.log(`  - ${f.file}: ${f.error}`));
  }
}

main().catch(console.error);
