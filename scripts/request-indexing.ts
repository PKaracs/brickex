/**
 * Google Indexing Request Script
 *
 * Submits all SEO scene URLs to Google Search Console for indexing
 * using the Web Search Indexing API.
 *
 * SETUP:
 *   1. Go to Google Cloud Console → APIs & Services → Enable "Web Search Indexing API"
 *   2. Create a Service Account → Download the JSON key file
 *   3. Save the key file as `google-indexing-key.json` in the project root (already in .gitignore)
 *   4. In Google Search Console → Settings → Users and permissions → Add the service account email as Owner
 *
 * Usage:
 *   npx tsx scripts/request-indexing.ts              # Submit all scene pages + hub
 *   npx tsx scripts/request-indexing.ts --dry-run    # Preview URLs without submitting
 *   npx tsx scripts/request-indexing.ts --slug monaco-yacht-harbor   # Submit single page
 */

import { config } from "dotenv";
config({ path: ".env" });

import * as fs from "fs";
import * as path from "path";

const SITE_URL = "https://richflex.co";
const KEY_FILE = path.join(__dirname, "../google-indexing-key.json");
const API_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const BATCH_DELAY_MS = 1000;

// ─── Load scene slugs ────────────────────────────────────────────────────────

function loadSlugs(): string[] {
  const dataDir = path.join(__dirname, "../data/seo-pages");
  const slugs: string[] = [];
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
    if (Array.isArray(data)) {
      for (const p of data) {
        if (p.slug) slugs.push(p.slug);
      }
    }
  }
  return slugs;
}

// ─── Google Auth ─────────────────────────────────────────────────────────────

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: key.token_uri,
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(key.private_key, "base64url");

  const jwt = `${header}.${payload}.${signature}`;

  const response = await fetch(key.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

// ─── Submit URL ──────────────────────────────────────────────────────────────

async function submitUrl(url: string, accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url,
        type: "URL_UPDATED",
      }),
    });

    if (response.ok) {
      return { success: true };
    }

    const text = await response.text();
    return { success: false, error: `${response.status}: ${text}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const slugFlag = args.indexOf("--slug");

  const allSlugs = loadSlugs();

  // Build URL list
  const urls: string[] = [];

  if (slugFlag !== -1) {
    const targetSlug = args[slugFlag + 1];
    if (!allSlugs.includes(targetSlug)) {
      console.error(`Scene not found: ${targetSlug}`);
      process.exit(1);
    }
    urls.push(`${SITE_URL}/ai-photos/${targetSlug}`);
  } else {
    urls.push(`${SITE_URL}/ai-photos`);
    for (const slug of allSlugs) {
      urls.push(`${SITE_URL}/ai-photos/${slug}`);
    }
  }

  console.log(`URLs to submit: ${urls.length}`);
  urls.forEach((u) => console.log(`  ${u}`));

  if (dryRun) {
    console.log("\n[DRY RUN] No URLs submitted.");
    return;
  }

  // Check for service account key
  if (!fs.existsSync(KEY_FILE)) {
    console.log(`\nService account key not found at: ${KEY_FILE}`);
    console.log("\nSETUP INSTRUCTIONS:");
    console.log("1. Go to Google Cloud Console -> APIs & Services -> Enable 'Web Search Indexing API'");
    console.log("2. Create a Service Account -> Download the JSON key file");
    console.log("3. Save it as: google-indexing-key.json (in project root)");
    console.log("4. In Google Search Console -> Settings -> Users & permissions");
    console.log("   Add the service account email as an Owner");
    console.log("\nAlternatively, submit the sitemap manually:");
    console.log(`  1. Go to https://search.google.com/search-console`);
    console.log(`  2. Submit: ${SITE_URL}/sitemap.xml`);
    console.log(`  3. Use 'URL Inspection' to request indexing for key pages`);
    process.exit(0);
  }

  const keyData: ServiceAccountKey = JSON.parse(fs.readFileSync(KEY_FILE, "utf-8"));
  console.log(`\nAuthenticating as: ${keyData.client_email}`);

  const accessToken = await getAccessToken(keyData);
  console.log("Authenticated successfully.\n");

  let submitted = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`  [${i + 1}/${urls.length}] ${url} ... `);

    const result = await submitUrl(url, accessToken);

    if (result.success) {
      console.log("OK");
      submitted++;
    } else {
      console.log(`FAILED: ${result.error}`);
      failed++;
    }

    if (i < urls.length - 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`\nDone! Submitted: ${submitted}, Failed: ${failed}`);
  console.log("Pages typically get indexed within 24-48 hours.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
