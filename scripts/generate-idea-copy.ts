import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import { ideaTopicSeeds } from "../lib/constants/idea-topic-seeds";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in env");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const OUTPUT_PATH = path.join(
  process.cwd(),
  "data",
  "ideas",
  "brickex-ideas-content.json",
);

interface GeneratedIdeaContent {
  slug: string;
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
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

function extractJsonObject(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return a JSON object");
  }
  return raw.slice(start, end + 1);
}

function sanitizeContent(input: GeneratedIdeaContent): GeneratedIdeaContent {
  return {
    slug: input.slug,
    seo: {
      title: input.seo.title.trim(),
      description: input.seo.description.trim(),
      keywords: input.seo.keywords
        .map((keyword) => keyword.trim())
        .filter(Boolean)
        .slice(0, 12),
    },
    content: {
      headline: input.content.headline.trim(),
      subheadline: input.content.subheadline.trim(),
      paragraphs: input.content.paragraphs
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .slice(0, 3),
      highlights: input.content.highlights
        .map((highlight) => highlight.trim())
        .filter(Boolean)
        .slice(0, 6),
    },
    faq: input.faq
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question && item.answer)
      .slice(0, 3),
  };
}

function fallback(seed: (typeof ideaTopicSeeds)[number]): GeneratedIdeaContent {
  return {
    slug: seed.slug,
    seo: {
      title: `${seed.titleSeed} | BrickEx`,
      description: `Browse ${seed.primaryKeyword} with prompts and reference renders built for architecture students and real estate marketers.`,
      keywords: [seed.primaryKeyword, ...seed.supportingKeywords],
    },
    content: {
      headline: seed.titleSeed,
      subheadline:
        "A focused BrickEx inspiration pack for luxury render references, interior moments, and real estate campaign imagery.",
      paragraphs: [
        `${seed.titleSeed} works best when the imagery is aspirational enough to sell the space and clear enough to teach composition, styling, and atmosphere. That is the balance this page aims to hit.`,
        `The gallery is shaped around the search intent behind ${seed.primaryKeyword}. It keeps the references coherent so an architecture student can study the spatial language and a marketer can quickly spot usable hero shots, living areas, and styled moments.`,
        `Each image also includes a prompt layer, which makes the page practical as well as inspirational. You can lift the structure into BrickEx and adapt it for your own presentation board, listing campaign, or interior mood direction.`,
      ],
      highlights: [
        "Coherent image set for one search theme",
        "Prompt-ready references",
        "Architecture student friendly",
        "Real estate marketer friendly",
        "Luxury interior and exterior direction",
        "BrickEx-ready direction",
      ],
    },
    faq: [
      {
        question: `Why does BrickEx group ${seed.titleSeed.toLowerCase()} into one page?`,
        answer:
          "Because the strongest SEO pages match a single search intent. A tighter gallery helps both students and marketers find references without digging through unrelated scenes.",
      },
      {
        question: "Are these references useful for presentation boards?",
        answer:
          "Yes. The page is designed to support architecture presentations, precedent studies, developer decks, listing visuals, and interior mood references.",
      },
      {
        question: "Can I use the prompts as a starting point?",
        answer:
          "Yes. The prompts are structured so you can adapt the lighting, space styling, material mood, and architecture language for your own BrickEx image generation workflow.",
      },
    ],
  };
}

async function generateForSeed(
  seed: (typeof ideaTopicSeeds)[number],
): Promise<GeneratedIdeaContent> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert SEO strategist and luxury architecture/interior copywriter. You write for architecture students, interior designers, real estate marketers, and developers. Return strict JSON only. Do not wrap the answer in markdown.",
        },
        {
          role: "user",
          content: `Create high-intent SEO page copy for BrickEx.

Page seed:
- slug: ${seed.slug}
- title seed: ${seed.titleSeed}
- primary keyword: ${seed.primaryKeyword}
- supporting keywords: ${seed.supportingKeywords.join(", ")}
- audience: ${seed.searchAudience.join("; ")}
- angle: ${seed.angle}

Requirements:
- The content must feel coherent for a single search intent.
- It must work for both architecture students and real estate marketers.
- Keep the language practical, not influencer-style.
- Lead with spaces people actually want to save: living rooms, lobbies, kitchens, terraces, lounges, art walls, rugs, lighting, spa bathrooms, and styled decor moments where appropriate.
- Mention architectural visualization, real estate marketing, interior references, render prompts, or presentation boards where appropriate.
- Avoid over-technical construction-detail language unless the topic explicitly requires a material study.
- Prefer "vignette", "styled moment", or "focused scene" over "close-up" or "detail shot".
- Do not mention selfies, dating, luxury flexing, or Richflex.
- Title should be search-friendly and under roughly 65 characters.
- Meta description should be under roughly 155 characters.
- Produce exactly 3 body paragraphs, 6 highlights, and 3 FAQ items.

Return JSON in this exact shape:
{
  "slug": "string",
  "seo": {
    "title": "string",
    "description": "string",
    "keywords": ["string"]
  },
  "content": {
    "headline": "string",
    "subheadline": "string",
    "paragraphs": ["string", "string", "string"],
    "highlights": ["string", "string", "string", "string", "string", "string"]
  },
  "faq": [
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" }
  ]
}`,
        },
      ],
      max_completion_tokens: 2000,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) {
      if (attempt === maxAttempts) {
        throw new Error("Empty response");
      }
      continue;
    }

    return sanitizeContent(
      JSON.parse(extractJsonObject(raw)) as GeneratedIdeaContent,
    );
  }

  throw new Error("Unable to generate page copy");
}

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  const results: GeneratedIdeaContent[] = [];

  for (let i = 0; i < ideaTopicSeeds.length; i++) {
    const seed = ideaTopicSeeds[i];
    console.log(`[${i + 1}/${ideaTopicSeeds.length}] ${seed.slug}`);

    try {
      const generated = await generateForSeed(seed);
      results.push(generated);
      console.log(`  generated`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  fallback: ${message}`);
      results.push(fallback(seed));
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} pages to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
