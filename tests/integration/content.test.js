import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, "..", "..", "content", "blog");

function getAllMarkdownFiles(dir) {
  const files = [];

  function scan(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

describe("Content Validation", () => {
  const allMarkdownFiles = getAllMarkdownFiles(blogDir);

  // Filter out transcripts (type: transcript)
  const markdownFiles = allMarkdownFiles.filter((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const { data } = matter(content);
    return data.type !== "transcript";
  });

  it("should find blog post files", () => {
    assert.ok(
      markdownFiles.length > 0,
      "Should find at least one markdown file",
    );
  });

  describe("Required frontmatter fields", () => {
    markdownFiles.forEach((filePath) => {
      const relativePath = path.relative(blogDir, filePath);

      describe(relativePath, () => {
        let data, markdown;

        it("should parse frontmatter", () => {
          const content = fs.readFileSync(filePath, "utf8");
          const parsed = matter(content);
          data = parsed.data;
          markdown = parsed.content;
          assert.ok(data, "Should have frontmatter");
        });

        it("should have title", () => {
          const content = fs.readFileSync(filePath, "utf8");
          const { data } = matter(content);
          assert.ok(data.title, `${relativePath} should have a title`);
        });

        it("should have date", () => {
          const content = fs.readFileSync(filePath, "utf8");
          const { data } = matter(content);
          assert.ok(data.date, `${relativePath} should have a date`);
        });

        it("should have non-empty content", () => {
          const content = fs.readFileSync(filePath, "utf8");
          const { content: markdown } = matter(content);
          assert.ok(
            markdown && markdown.trim().length > 0,
            `${relativePath} should have content`,
          );
        });
      });
    });
  });

  describe("Podcast metadata (optional)", () => {
    const postsWithEpisodes = markdownFiles.filter((filePath) => {
      const content = fs.readFileSync(filePath, "utf8");
      const { data } = matter(content);
      return data.episode;
    });

    it("should find posts with episode numbers", () => {
      assert.ok(postsWithEpisodes.length > 0, "Should have some episodes");
    });

    postsWithEpisodes.forEach((filePath) => {
      const relativePath = path.relative(blogDir, filePath);

      it(`${relativePath} should have enclosure URL`, () => {
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);

        if (data.episode) {
          assert.ok(
            data.enclosure && data.enclosure.url,
            `Episode ${data.episode} should have enclosure URL`,
          );
        }
      });
    });
  });

  describe("Content statistics", () => {
    it("should have at least 170 posts", () => {
      assert.ok(
        markdownFiles.length >= 170,
        `Expected at least 170 posts, found ${markdownFiles.length}`,
      );
    });

    it("most posts should have categories", () => {
      const postsWithCategories = markdownFiles.filter((filePath) => {
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);
        return data.categories && data.categories.length > 0;
      });

      const percentage =
        (postsWithCategories.length / markdownFiles.length) * 100;
      assert.ok(
        percentage > 90,
        `At least 90% of posts should have categories (found ${percentage.toFixed(1)}%)`,
      );
    });

    it("most posts should have tags", () => {
      const postsWithTags = markdownFiles.filter((filePath) => {
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);
        return data.tags && data.tags.length > 0;
      });

      const percentage = (postsWithTags.length / markdownFiles.length) * 100;
      assert.ok(
        percentage > 90,
        `At least 90% of posts should have tags (found ${percentage.toFixed(1)}%)`,
      );
    });

    it("most posts should have summary for SEO", () => {
      const postsWithSummary = markdownFiles.filter((filePath) => {
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);
        return data.summary && data.summary.trim().length > 0;
      });

      const percentage = (postsWithSummary.length / markdownFiles.length) * 100;
      assert.ok(
        percentage > 90,
        `At least 90% of posts should have summary (found ${percentage.toFixed(1)}%)`,
      );
    });
  });
});
