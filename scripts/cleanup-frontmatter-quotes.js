#!/usr/bin/env node

/**
 * Remove unnecessary quotes from frontmatter fields
 *
 * This script processes all blog post markdown files and removes quotes
 * from fields that don't need them (dates, URLs, simple titles).
 * It preserves quotes when necessary (colons in titles, special characters).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, "../content/blog");

// Configure gray-matter to minimize quotes
const matterOptions = {
  engines: {
    yaml: {
      parse: (str) => yaml.load(str),
      stringify: (obj) =>
        yaml.dump(obj, {
          indent: 2,
          lineWidth: -1, // Don't wrap lines
          quotingType: '"',
          forceQuotes: false,
          flowLevel: -1,
          // MINIMAL quoting - only when absolutely necessary
          styles: {
            '!!null': 'canonical'
          },
          // Avoid quoting strings that don't need it
          condenseFlow: true,
          noRefs: true
        }),
    },
  },
};

// Recursively find all .md files
function findMarkdownFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Remove unnecessary quotes from YAML frontmatter
 * Only remove quotes from safe values (no special YAML chars)
 */
function removeUnnecessaryQuotes(yamlString) {
  const lines = yamlString.split('\n');
  const result = [];

  for (const line of lines) {
    // Match lines like:  key: 'value' or key: "value"
    const match = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*:)\s+(['"])(.*?)\3\s*$/);

    if (match) {
      const [, indent, key, quote, value] = match;

      // Check if the value needs quotes
      const needsQuotes =
        // Has leading/trailing whitespace
        value !== value.trim() ||
        // Starts with special chars that have YAML meaning
        /^[>|&*!@#\[\]{}`]/.test(value) ||
        // Contains: followed by space (looks like a key-value)
        /:\s/.test(value) ||
        // Is a boolean-looking string
        /^(true|false|yes|no|on|off|null|~)$/i.test(value) ||
        // Is a number-looking string (and we want to keep it as string)
        (/^\d+$/.test(value) && key.includes('episode')) ||
        // Empty string
        value === '';

      if (!needsQuotes) {
        result.push(`${indent}${key} ${value}`);
      } else {
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

// Process a single file
function processFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    // Stringify with our custom options
    let output = matter.stringify(content, data, matterOptions);

    // Remove unnecessary quotes from the frontmatter
    const parts = output.split('---\n');
    if (parts.length >= 3) {
      parts[1] = removeUnnecessaryQuotes(parts[1]);
      output = parts.join('---\n');
    }

    // Write back to file
    fs.writeFileSync(filePath, output, "utf8");

    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, path: filePath, error: error.message };
  }
}

// Main execution
console.log("🧹 Cleaning up frontmatter quotes...\n");

const files = findMarkdownFiles(blogDir);
console.log(`Found ${files.length} markdown files\n`);

let processed = 0;
let errors = 0;

for (const file of files) {
  const result = processFile(file);

  if (result.success) {
    processed++;
    const relativePath = path.relative(blogDir, file);
    console.log(`✓ ${relativePath}`);
  } else {
    errors++;
    console.error(`✗ ${result.path}: ${result.error}`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Processed: ${processed}`);
console.log(`   Errors: ${errors}`);
console.log(`   Total: ${files.length}`);

if (errors > 0) {
  process.exit(1);
}
