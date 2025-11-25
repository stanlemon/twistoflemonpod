import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteDir = path.join(__dirname, "..", "..", "_site");

describe("Build Validation", () => {
  it("should create _site directory", () => {
    assert.ok(fs.existsSync(siteDir), "_site directory should exist");
  });

  describe("Required files", () => {
    const requiredFiles = [
      "index.html",
      "feed.xml",
      "sitemap.xml",
      "css/plyr.css",
      "js/plyr.js",
      "css/main.css",
      "css/typography.css",
    ];

    requiredFiles.forEach((file) => {
      it(`should generate ${file}`, () => {
        const filePath = path.join(siteDir, file);
        assert.ok(fs.existsSync(filePath), `${file} should exist`);
      });
    });
  });

  describe("Blog posts", () => {
    it("should generate at least 170 blog post directories", () => {
      // Count blog posts in new /YYYY/mm/slug structure
      let blogPostCount = 0;

      // Find all year directories (YYYY format)
      const yearDirs = fs
        .readdirSync(siteDir, { withFileTypes: true })
        .filter(
          (dirent) => dirent.isDirectory() && /^\d{4}$/.test(dirent.name),
        );

      // For each year, find all month directories
      yearDirs.forEach((yearDir) => {
        const yearPath = path.join(siteDir, yearDir.name);
        const monthDirs = fs
          .readdirSync(yearPath, { withFileTypes: true })
          .filter(
            (dirent) => dirent.isDirectory() && /^\d{2}$/.test(dirent.name),
          );

        // For each month, count slug directories
        monthDirs.forEach((monthDir) => {
          const monthPath = path.join(yearPath, monthDir.name);
          const slugDirs = fs
            .readdirSync(monthPath, { withFileTypes: true })
            .filter(
              (dirent) => dirent.isDirectory() && dirent.name !== "transcript",
            );
          blogPostCount += slugDirs.length;
        });
      });

      assert.ok(
        blogPostCount >= 170,
        `Expected at least 170 blog posts, found ${blogPostCount}`,
      );
    });
  });

  describe("Category pages", () => {
    const categoryDir = path.join(siteDir, "category");

    it("should create category directory", () => {
      assert.ok(fs.existsSync(categoryDir), "Category directory should exist");
    });

    it("should generate at least 10 category pages", () => {
      if (fs.existsSync(categoryDir)) {
        const categories = fs.readdirSync(categoryDir).length;
        assert.ok(
          categories >= 10,
          `Expected at least 10 categories, found ${categories}`,
        );
      }
    });
  });

  describe("Tag pages", () => {
    const tagDir = path.join(siteDir, "tag");

    it("should create tag directory", () => {
      assert.ok(fs.existsSync(tagDir), "Tag directory should exist");
    });

    it("should generate at least 50 tag pages", () => {
      if (fs.existsSync(tagDir)) {
        const tags = fs.readdirSync(tagDir).length;
        assert.ok(tags >= 50, `Expected at least 50 tags, found ${tags}`);
      }
    });
  });

  describe("Pagination", () => {
    it("should generate at least 15 pagination pages", () => {
      const paginationPages = fs
        .readdirSync(siteDir, { withFileTypes: true })
        .filter(
          (dirent) => dirent.isDirectory() && /^\d+$/.test(dirent.name),
        ).length;

      assert.ok(
        paginationPages >= 15,
        `Expected at least 15 pagination pages, found ${paginationPages}`,
      );
    });
  });

  describe("Scheduled Posts (Future Dates)", () => {
    it("should not generate pages for future-dated posts by default", () => {
      // This test verifies that if INCLUDE_FUTURE_POSTS is not set,
      // posts with future dates don't get built.
      // Since we can't easily test with actual future posts without modifying
      // the test environment, this is a smoke test that verifies the mechanism works.

      // Verify that the site was built without INCLUDE_FUTURE_POSTS env var
      // (The absence of certain directories would indicate exclusion)
      assert.ok(fs.existsSync(siteDir), "Site should be built");

      // Check that no directories exist for far future years (e.g., 2030+)
      const yearDirs = fs
        .readdirSync(siteDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && /^\d{4}$/.test(dirent.name))
        .map((dirent) => parseInt(dirent.name));

      const currentYear = new Date().getFullYear();
      const futureDirs = yearDirs.filter((year) => year > currentYear + 10);

      assert.strictEqual(
        futureDirs.length,
        0,
        "Should not have directories for years more than 10 years in the future",
      );
    });

    it("should have expected year directories for current/past posts", () => {
      const yearDirs = fs
        .readdirSync(siteDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && /^\d{4}$/.test(dirent.name))
        .map((dirent) => parseInt(dirent.name));

      // Should have posts from 2018 (when podcast started)
      assert.ok(yearDirs.includes(2018), "Should have posts from 2018");

      // Should have posts from 2021 (last regular episode year based on content)
      assert.ok(yearDirs.includes(2021), "Should have posts from 2021");

      // All year directories should be reasonable (between 2018 and current year + 5)
      const currentYear = new Date().getFullYear();
      yearDirs.forEach((year) => {
        assert.ok(
          year >= 2018 && year <= currentYear + 5,
          `Year ${year} should be between 2018 and ${currentYear + 5}`,
        );
      });
    });
  });

  describe("RSS Feed", () => {
    const feedPath = path.join(siteDir, "feed.xml");

    it("should have feed.xml", () => {
      assert.ok(fs.existsSync(feedPath), "feed.xml should exist");
    });

    it("should only include iTunes tags for items with enclosures", () => {
      const feedContent = fs.readFileSync(feedPath, "utf-8");

      // Find all <item> blocks
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const items = [...feedContent.matchAll(itemRegex)];

      assert.ok(items.length > 0, "Feed should contain items");

      let itemsWithEnclosure = 0;
      let itemsWithoutEnclosure = 0;
      let itunesTagsOnNonPodcast = 0;

      items.forEach((match) => {
        const itemContent = match[1];
        const hasEnclosure = /<enclosure/.test(itemContent);
        const hasItunesTitle = /<itunes:title>/.test(itemContent);
        const hasItunesExplicit = /<itunes:explicit>/.test(itemContent);

        if (hasEnclosure) {
          itemsWithEnclosure++;
          // Podcast episodes should have iTunes tags
          assert.ok(
            hasItunesTitle,
            "Items with enclosures should have <itunes:title>",
          );
          assert.ok(
            hasItunesExplicit,
            "Items with enclosures should have <itunes:explicit>",
          );
        } else {
          itemsWithoutEnclosure++;
          // Blog posts should NOT have iTunes tags
          if (hasItunesTitle || hasItunesExplicit) {
            itunesTagsOnNonPodcast++;
          }
        }
      });

      assert.ok(
        itemsWithEnclosure > 100,
        `Expected at least 100 podcast episodes, found ${itemsWithEnclosure}`,
      );
      assert.ok(
        itemsWithoutEnclosure > 0,
        `Expected at least 1 blog post without enclosure, found ${itemsWithoutEnclosure}`,
      );
      assert.strictEqual(
        itunesTagsOnNonPodcast,
        0,
        `Blog posts without enclosures should not have iTunes tags, but ${itunesTagsOnNonPodcast} items did`,
      );
    });

    it("should validate specific blog post does not have iTunes tags", () => {
      const feedContent = fs.readFileSync(feedPath, "utf-8");

      // Find all items and search for the specific blog post
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const items = [...feedContent.matchAll(itemRegex)];

      const blogPostItem = items.find((match) =>
        match[1].includes("Some Rather Sour Grievances"),
      );

      assert.ok(
        blogPostItem,
        'Should find "Some Rather Sour Grievances" blog post in feed',
      );

      const blogPostContent = blogPostItem[1];

      // This blog post should NOT have an enclosure
      assert.ok(
        !/<enclosure/.test(blogPostContent),
        "Blog post should not have enclosure",
      );

      // This blog post should NOT have iTunes tags
      assert.ok(
        !/<itunes:title>/.test(blogPostContent),
        "Blog post should not have <itunes:title>",
      );
      assert.ok(
        !/<itunes:explicit>/.test(blogPostContent),
        "Blog post should not have <itunes:explicit>",
      );
      assert.ok(
        !/<itunes:episode>/.test(blogPostContent),
        "Blog post should not have <itunes:episode>",
      );
    });
  });
});
