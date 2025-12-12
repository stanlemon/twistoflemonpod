#!/usr/bin/env node

/**
 * Upload MP3 files to Cloudflare R2 storage
 *
 * Usage: node scripts/upload-to-r2.js <path-to-mp3-file>
 *
 * Uploads the file to the "twistoflemonpod" bucket with the path: episodes/<filename>
 *
 * Requires environment variables:
 *   R2_ACCOUNT_ID     - Your Cloudflare account ID
 *   R2_ACCESS_KEY_ID  - R2 API token access key ID
 *   R2_SECRET_ACCESS_KEY - R2 API token secret access key
 */

import { resolve, basename, extname } from "node:path";
import { readFileSync, statSync, existsSync } from "node:fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

const BUCKET_NAME = "twistoflemonpod";
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Create R2 client
 */
function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload file to R2
 */
async function uploadFile(client, filePath, key) {
  const fileContent = readFileSync(filePath);
  const stats = statSync(filePath);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: "audio/mpeg",
    ContentLength: stats.size,
  });

  return client.send(command);
}

/**
 * Main function
 */
async function main() {
  // Check command line arguments
  if (process.argv.length < 3) {
    console.error("Usage: node scripts/upload-to-r2.js <path-to-mp3-file>");
    console.error("");
    console.error("Example:");
    console.error(
      "  node scripts/upload-to-r2.js ~/Sites/twistoflemonpod-mp3s/episodes/175-lwatol-20251211.mp3",
    );
    process.exit(1);
  }

  // Check required environment variables
  const missingVars = [];
  if (!R2_ACCOUNT_ID) missingVars.push("R2_ACCOUNT_ID");
  if (!R2_ACCESS_KEY_ID) missingVars.push("R2_ACCESS_KEY_ID");
  if (!R2_SECRET_ACCESS_KEY) missingVars.push("R2_SECRET_ACCESS_KEY");

  if (missingVars.length > 0) {
    console.error("Error: Missing required environment variables:");
    missingVars.forEach((v) => console.error(`  - ${v}`));
    console.error("");
    console.error("Please set them in your .env file:");
    console.error("  R2_ACCOUNT_ID=your-cloudflare-account-id");
    console.error("  R2_ACCESS_KEY_ID=your-r2-access-key-id");
    console.error("  R2_SECRET_ACCESS_KEY=your-r2-secret-access-key");
    process.exit(1);
  }

  const inputPath = resolve(process.argv[2]);
  const filename = basename(inputPath);
  const extension = extname(inputPath).toLowerCase();

  // Validate file exists
  if (!existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  // Validate file is an MP3
  if (extension !== ".mp3") {
    console.error(`Error: File must be an MP3 file (got ${extension})`);
    process.exit(1);
  }

  const stats = statSync(inputPath);
  const key = `episodes/${filename}`;

  console.log("R2 Upload");
  console.log("=========");
  console.log(`File: ${inputPath}`);
  console.log(`Size: ${formatFileSize(stats.size)}`);
  console.log(`Destination: s3://${BUCKET_NAME}/${key}`);
  console.log("");

  try {
    console.log("Uploading...");
    const client = createR2Client();
    await uploadFile(client, inputPath, key);

    console.log("");
    console.log("Upload complete!");
    console.log(
      `Public URL: https://twistoflemonpod.com/episodes/${filename}`,
    );
  } catch (error) {
    console.error("");
    console.error("Upload failed:", error.message);

    if (error.name === "AccessDenied") {
      console.error("");
      console.error("Check that your R2 API token has write permissions.");
    }

    process.exit(1);
  }
}

main();
