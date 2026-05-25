/**
 * One-off migration script: fetch top-traffic pages from luxuryhomescalgary.ca's
 * WordPress REST API, convert each to the React app's blog format, and write
 * them out as a TS module that `seed.ts` imports.
 *
 * Run:  cd src && npx tsx script/import-wp-blog-posts.ts
 *
 * Re-run any time you want to pull fresh content from WP — it overwrites the
 * generated file. The slugs below are the ranked authoritative pages from
 * Google Search Console (luxuryhomescalgary.ca, last 16 months by clicks).
 */
import * as fs from "node:fs";
import * as path from "node:path";

const WP_HOST = "https://luxuryhomescalgary.ca";

// Top GSC performers + obvious must-keep evergreen content. Order = output
// order (which becomes display order on /blog if seed is fresh). Skip the
// taxonomy archives (/tag/*, /property-types/*, /locations/*, /features/*,
// /author/*) and listing-detail/properties URLs — those are handled by the
// 301 redirect block in server/routes.ts.
const SLUGS = [
  // ---- GSC-confirmed top performers --------------------------------------
  "top-20-best-calgary-neighbourhoods-2026",
  "the-9-best-luxury-condos-in-calgary",
  "3-reasons-not-to-move-to-springbank-hill",
  "top-11-luxury-neighbourhoods-in-calgary",
  "ultimate-guide-to-buying-a-home-in-calgary",
  "tips-for-first-time-homebuyers",
  "best-time-to-sell-in-calgary-real-estate",
  "how-to-make-an-offer-on-a-house",
  "britannia-calgary-neighbourhood-guide-2024",
  "bel-aire-calgary-neighbourhood-guide-2024",
  "top-5-family-friendly-neighborhoods-springbank-hill-2024",
  "springbank-hill-home-selling-tips",
  "calgary-real-estate-market-outlook-2025",
  "calgary-luxury-real-estate-update",
  "elveden-terrace-elmont-hts-new-developments",
  // ---- Long-tail neighbourhood + buyer / seller guides -------------------
  "home-buyers-and-sellers-market-in-calgary",
  "calgary-empty-nesters-downsizing-guide-2024",
  "rideau-park-ultimate-neighborhood-guide",
  "rideau-park-calgary-homes-for-sale",
  "elbow-park-calgary-real-estate",
  "luxury-realtor-in-upper-mount-royal",
  "exploring-luxury-homes-in-aspen-woods",
  "why-families-love-living-in-aspen-woods-calgary",
  "unveiling-the-charms-of-west-springs-calgary",
  "luxury-home-in-west-springs",
  "west-springs-listings",
  "discovery-ridge-calgary",
  "ultimate-guide-to-living-in-chestermere-lake",
  "canmore-neighborhood-guide-2022",
  "house-for-sale-in-calgary",
  // ---- Calgary market + topical content ----------------------------------
  "calgary-real-estate-market-update-march",
  "calgary-new-construction-guide",
  "best-realtors-in-calgary",
  "alberta-vs-bc-for-real-estate-buyers",
  "legal-suites-in-calgary-what-you-know",
  "leveraging-home-value-estimators",
  "westside-recreation-centre-calgary",
  "attic-rain-calgary",
  "choosing-best-type-of-loans-for-you",
  "does-a-sparkling-clean-home-fetch-more-money",
  // (Note: the original WP slugs "real-state-success-stories" and
  // "bedrrom-colours-for-staging" contain spelling errors. We leave them
  // out here — if you want to migrate them, paste the corrected slugs into
  // this list. The 301 redirect block already handles bare /tag/* archives.)
];

// ----- HTML → React-app markdown converter --------------------------------
// The blog renderer (client/src/pages/blog-detail.tsx) understands:
//   ## H2  ###  H3  > blockquote  paragraphs  **bold**  *italic*
// Everything else gets flattened into paragraphs. Lists become bullet lines
// prefixed with "•" (rendered as paragraphs).

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#039;": "'",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&rdquo;": "”",
  "&ldquo;": "“",
  "&hellip;": "…",
  "&mdash;": "—",
  "&ndash;": "–",
};
function decodeEntities(s: string): string {
  return s
    .replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

// Turn inline HTML (<strong>, <em>, <a>, <br>) into the React app's inline
// markdown subset. Drop everything else.
function inlineToMd(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<\/?(?:strong|b)>/gi, "**")
      .replace(/<\/?(?:em|i)>/gi, "*")
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " "),
  ).trim();
}

// Extract block-level HTML elements in document order. We don't try to be a
// full parser — these WP pages all use Elementor, and the meaningful content
// lives in <h2|h3|h4|p|blockquote|ul|ol> blocks regardless of how deeply they
// are nested in <div>s. A tag-balancing regex sweep is enough.
function htmlToMarkdown(html: string): string {
  // Strip scripts/styles outright.
  let h = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");

  // Walk block-level elements in order. We do this with a global regex that
  // matches the OUTER element along with its inner content; nested same-tag
  // elements are rare in WP content for these block tags.
  const blockRe = /<(h2|h3|h4|p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let md = "";
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(h)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[2];
    if (tag === "h2") {
      const t = inlineToMd(inner);
      if (t) md += `## ${t}\n\n`;
    } else if (tag === "h3" || tag === "h4") {
      const t = inlineToMd(inner);
      if (t) md += `### ${t}\n\n`;
    } else if (tag === "blockquote") {
      const t = inlineToMd(inner);
      if (t) md += `> ${t}\n\n`;
    } else if (tag === "p") {
      const t = inlineToMd(inner);
      if (t) md += `${t}\n\n`;
    } else if (tag === "ul" || tag === "ol") {
      // Pull out direct <li> children (allow nested HTML inside each li).
      const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch: RegExpExecArray | null;
      let any = false;
      while ((liMatch = liRe.exec(inner)) !== null) {
        const t = inlineToMd(liMatch[1]);
        if (t) {
          md += `• ${t}\n`;
          any = true;
        }
      }
      if (any) md += "\n";
    }
  }
  return md.replace(/\n{3,}/g, "\n\n").trim();
}

function firstImage(html: string): string {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : "";
}

function plainExcerpt(rendered: string, max = 180): string {
  const text = decodeEntities(rendered.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function readMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 220));
}

// ----- Fetcher -------------------------------------------------------------

type WpPage = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
};

async function fetchBySlug(slug: string): Promise<WpPage | null> {
  // WP exposes both "post" and "page" types — try pages first since most of
  // the ranking content on luxuryhomescalgary.ca is /:slug-style pages, then
  // fall back to posts.
  for (const type of ["pages", "posts"] as const) {
    const url = `${WP_HOST}/wp-json/wp/v2/${type}?slug=${encodeURIComponent(slug)}`;
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const arr = (await r.json()) as WpPage[];
      if (arr && arr.length > 0) return arr[0];
    } catch {
      /* try next type */
    }
  }
  return null;
}

// ----- Categorize ----------------------------------------------------------
// Maps slug → category label shown on /blog cards. Simple keyword routing.

function categorize(slug: string): string {
  if (/condo/.test(slug)) return "Condos";
  if (/neighbourhood|neighborhood|springbank|britannia|bel-aire|elbow|aspen|mount-royal/.test(slug))
    return "Neighbourhoods";
  if (/sell|seller|listing/.test(slug)) return "Selling";
  if (/buy|first-time|offer|mortgage/.test(slug)) return "Buying";
  if (/market|outlook|update/.test(slug)) return "Market";
  return "Guide";
}

// ----- Main ----------------------------------------------------------------

async function main() {
  const records: Array<{
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    category: string;
    heroImage: string;
    readMinutes: number;
    publishedAt: string;
  }> = [];

  for (const slug of SLUGS) {
    process.stdout.write(`fetching ${slug}... `);
    const page = await fetchBySlug(slug);
    if (!page) {
      console.log("NOT FOUND, skipping");
      continue;
    }
    const body = htmlToMarkdown(page.content.rendered);
    const hero = firstImage(page.content.rendered);
    const title = decodeEntities(page.title.rendered).replace(/<[^>]+>/g, "").trim();
    const excerpt = plainExcerpt(page.excerpt?.rendered || page.content.rendered);
    records.push({
      slug: page.slug,
      title,
      excerpt,
      body,
      category: categorize(page.slug),
      heroImage: hero,
      readMinutes: readMinutes(body),
      publishedAt: page.date,
    });
    console.log(`OK (${body.length} chars)`);
  }

  const banner =
    "// AUTO-GENERATED — do not edit by hand.\n" +
    "// Source: luxuryhomescalgary.ca WP REST API\n" +
    `// Generated: ${new Date().toISOString()}\n` +
    "// Regenerate: `cd src && npx tsx script/import-wp-blog-posts.ts`\n\n" +
    'import type { InsertBlogPost } from "../shared/schema";\n\n';

  const file =
    banner +
    `export const MIGRATED_BLOG_POSTS: InsertBlogPost[] = ${JSON.stringify(
      records,
      null,
      2,
    )};\n`;

  // Resolve relative to the src/ root regardless of how the script is invoked
  // (works under ESM, where __dirname is undefined).
  const out = path.resolve(process.cwd(), "server", "seed-migrated-blog-posts.ts");
  fs.writeFileSync(out, file);
  console.log(`\nWrote ${records.length} posts to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
