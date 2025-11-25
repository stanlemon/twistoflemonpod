#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, "../content/blog");

// Recursively find all .md files in nested directories
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

const files = findMarkdownFiles(blogDir);

const categoryCount = new Map();
const tagCount = new Map();

console.log(`Analyzing ${files.length} markdown files...\n`);

// Process each file
files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const { data } = matter(content);

  // Count categories
  if (data.categories && Array.isArray(data.categories)) {
    data.categories.forEach((category) => {
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });
  }

  // Count tags
  if (data.tags && Array.isArray(data.tags)) {
    data.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  }
});

// Sort alphabetically
const sortedCategories = Array.from(categoryCount.entries()).sort((a, b) =>
  a[0].toLowerCase().localeCompare(b[0].toLowerCase()),
);

const sortedTags = Array.from(tagCount.entries()).sort((a, b) =>
  a[0].toLowerCase().localeCompare(b[0].toLowerCase()),
);

// Output to console
console.log("📁 CATEGORIES");
console.log("═".repeat(50));
sortedCategories.forEach(([category, count]) => {
  console.log(`${category.padEnd(30)} (${count} posts)`);
});

console.log("\n🏷️  TAGS");
console.log("═".repeat(50));
sortedTags.forEach(([tag, count]) => {
  console.log(`${tag.padEnd(30)} (${count} posts)`);
});
