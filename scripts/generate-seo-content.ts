/**
 * SEO Page Content Generator
 *
 * Uses GPT-4o to generate full page content (SEO metadata, paragraphs, FAQs,
 * highlights) from a simple catalog of {slug, title, category}.
 *
 * Usage:
 *   npx tsx scripts/generate-seo-content.ts --catalog data/seo-catalog.csv
 *   npx tsx scripts/generate-seo-content.ts --catalog data/seo-catalog.csv --category dating
 *   npx tsx scripts/generate-seo-content.ts --catalog data/seo-catalog.csv --slug ai-tinder-photos
 */

import { config } from "dotenv";
config({ path: ".env" });

import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, "../data/seo-pages");
const BATCH_DELAY_MS = 500;

let _openai: OpenAI;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_OPENAI_API_KEY,
    });
  }
  return _openai;
}

// ─── Catalog Parsing ─────────────────────────────────────────────────────────

interface CatalogEntry {
  slug: string;
  title: string;
  category: string;
}

function parseCatalog(csvPath: string): CatalogEntry[] {
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n");
  // Skip header
  return lines.slice(1).map((line) => {
    const [slug, title, category] = line.split(",").map((s) => s.trim());
    return { slug, title, category };
  });
}

// ─── GPT Content Generation ─────────────────────────────────────────────────

interface GeneratedPage {
  slug: string;
  category: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  content: {
    headline: string;
    subheadline: string;
    paragraphs: string[];
    highlights: string[];
  };
  faq: Array<{ question: string; answer: string }>;
  relatedSlugs: string[];
}

const SYSTEM_PROMPT = `You are an expert SEO copywriter for Richflex, an AI-powered luxury photo generator. Users upload selfies and get photorealistic luxury lifestyle photos (with yachts, supercars, penthouses, private jets, etc.).

Your job: write compelling, SEO-optimized page content that ranks on Google and converts visitors into users.

BRAND VOICE:
- Confident, slightly irreverent, aspirational but self-aware
- Direct and punchy — no corporate fluff
- Knows the audience: creators, dating app users, social media power users
- Example tone: "Look Like a Million Bucks — Without Spending It"

For each page, generate a JSON object with these EXACT fields:
{
  "slug": "<the slug provided>",
  "category": "<the category provided>",
  "seo": {
    "title": "<60 chars max, format: Primary Keyword | Secondary | Richflex>",
    "description": "<155 chars max, action-oriented, include 'upload a selfie' or 'AI photo'>",
    "keywords": ["<5 keywords targeting real Google searches>"]
  },
  "content": {
    "headline": "<3-6 word punchy headline>",
    "subheadline": "<15-25 word evocative one-liner>",
    "paragraphs": [
      "<Para 1: 2-3 sentences about the concept/use case and why it matters>",
      "<Para 2: 2-3 sentences about how Richflex solves this specifically>",
      "<Para 3: 2-3 sentences about performance on dating apps/social media/professional contexts>"
    ],
    "highlights": [
      "<5 bullet points describing what the photos feature — visual elements>"
    ]
  },
  "faq": [
    {"question": "<real question someone would search>", "answer": "<helpful 2-3 sentence answer>"},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "relatedSlugs": ["<4 slugs from the provided list of all slugs>"]
}

CRITICAL RULES:
- SEO titles MUST be under 60 characters
- SEO descriptions MUST be under 155 characters
- Keywords must be terms people ACTUALLY search on Google
- Paragraphs must be unique, specific, and non-generic
- FAQs must answer real questions (not filler)
- relatedSlugs must be picked from the provided slug list
- Do NOT mention competitors by name`;

async function generatePageContent(
  entry: CatalogEntry,
  allSlugs: string[],
): Promise<GeneratedPage> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate page content for:

SLUG: ${entry.slug}
TITLE: ${entry.title}
CATEGORY: ${entry.category}

ALL AVAILABLE SLUGS (pick 4 for relatedSlugs):
${allSlugs.join(", ")}

Return a single JSON object.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty GPT response");

  return JSON.parse(content) as GeneratedPage;
}

// ─── File Operations ─────────────────────────────────────────────────────────

function readCategoryFile(category: string): GeneratedPage[] {
  const filePath = path.join(DATA_DIR, `${category}.json`);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCategoryFile(category: string, pages: GeneratedPage[]) {
  const filePath = path.join(DATA_DIR, `${category}.json`);
  fs.writeFileSync(filePath, JSON.stringify(pages, null, 2), "utf-8");
}

function getExistingSlugs(): Set<string> {
  const slugs = new Set<string>();
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const pages = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, file), "utf-8"),
    );
    if (Array.isArray(pages)) {
      for (const p of pages) {
        if (p.slug) slugs.add(p.slug);
      }
    }
  }
  return slugs;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const catalogIdx = args.indexOf("--catalog");
  const categoryFilter =
    args.indexOf("--category") !== -1
      ? args[args.indexOf("--category") + 1]
      : null;
  const slugFilter =
    args.indexOf("--slug") !== -1 ? args[args.indexOf("--slug") + 1] : null;

  if (catalogIdx === -1) {
    console.log(`Usage:
  npx tsx scripts/generate-seo-content.ts --catalog data/seo-catalog.csv
  npx tsx scripts/generate-seo-content.ts --catalog data/seo-catalog.csv --category dating
  npx tsx scripts/generate-seo-content.ts --catalog data/seo-catalog.csv --slug ai-tinder-photos`);
    process.exit(0);
  }

  if (!process.env.OPENAI_API_KEY && !process.env.NEXT_OPENAI_API_KEY) {
    console.error("ERROR: OPENAI_API_KEY not set in .env");
    process.exit(1);
  }

  const catalogPath = args[catalogIdx + 1];
  if (!fs.existsSync(catalogPath)) {
    console.error(`Catalog not found: ${catalogPath}`);
    process.exit(1);
  }

  let entries = parseCatalog(catalogPath);
  console.log(`Loaded ${entries.length} entries from catalog`);

  // Filter
  if (categoryFilter) {
    entries = entries.filter((e) => e.category === categoryFilter);
    console.log(
      `Filtered to ${entries.length} entries in category: ${categoryFilter}`,
    );
  }
  if (slugFilter) {
    entries = entries.filter((e) => e.slug === slugFilter);
    console.log(`Filtered to slug: ${slugFilter}`);
  }

  // Skip existing
  const existing = getExistingSlugs();
  const newEntries = entries.filter((e) => !existing.has(e.slug));
  console.log(
    `${existing.size} pages already exist, ${newEntries.length} new to generate\n`,
  );

  if (newEntries.length === 0) {
    console.log("Nothing to generate!");
    return;
  }

  // Build full slug list for relatedSlugs suggestions
  const allSlugs = [...Array.from(existing), ...entries.map((e) => e.slug)];

  let generated = 0;
  let failed = 0;

  for (let i = 0; i < newEntries.length; i++) {
    const entry = newEntries[i];
    process.stdout.write(
      `[${i + 1}/${newEntries.length}] ${entry.slug} (${entry.category})... `,
    );

    try {
      const page = await generatePageContent(entry, allSlugs);

      // Ensure slug/category match
      page.slug = entry.slug;
      page.category = entry.category;

      // Append to category file
      const pages = readCategoryFile(entry.category);
      pages.push(page);
      writeCategoryFile(entry.category, pages);

      console.log("OK");
      generated++;
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }

    if (i < newEntries.length - 1) await sleep(BATCH_DELAY_MS);
  }

  console.log(`\nDone! Generated: ${generated}, Failed: ${failed}`);
  console.log(`Total pages across all categories: ${getExistingSlugs().size}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
