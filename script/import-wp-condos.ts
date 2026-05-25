/**
 * Fetch the ranking WP condo pages from luxuryhomescalgary.ca, extract their
 * editorial paragraphs, and bucket each paragraph into the React app's typed
 * fields (intro / residencesCopy / architecturalCopy / locationCopy /
 * diningCopy / shoppingCopy / communityCopy / schoolsCopy). Also pull gallery
 * image URLs.
 *
 * Output: server/seed-migrated-condos.ts — a Record<slug, Partial<patch>>
 * that seed.ts merges over the MARQUEE_CONDOS rows after their initial seed.
 *
 * Run:  cd src && npx tsx script/import-wp-condos.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";

const WP_HOST = "https://luxuryhomescalgary.ca";

// (react slug, WP url) — derived from the GSC ranking pages on WP. Order
// matters for output but doesn't change behavior.
const CONDOS: Array<{ slug: string; wpUrl: string }> = [
  { slug: "the-river",               wpUrl: "/calgary-condos/the-river-condos-calgary/" },
  { slug: "le-germain",              wpUrl: "/calgary-condos/le-germain/" },
  { slug: "lincoln",                 wpUrl: "/calgary-condos/lincoln-condos/" },
  { slug: "the-montana",             wpUrl: "/calgary-condos/the-montana-condos/" },
  { slug: "the-concord",             wpUrl: "/calgary-condos/the-concord/" },
  { slug: "princes-island-estates",  wpUrl: "/calgary-condos/princes-island-estates/" },
  { slug: "vogue",                   wpUrl: "/calgary-condos/vogue-condos/" },
];

// ----- HTML helpers --------------------------------------------------------

const ENT: Record<string, string> = {
  "&amp;": "&", "&nbsp;": " ", "&quot;": '"', "&#039;": "'", "&#39;": "'",
  "&lt;": "<", "&gt;": ">", "&rsquo;": "’", "&lsquo;": "‘",
  "&rdquo;": "”", "&ldquo;": "“", "&hellip;": "…", "&mdash;": "—", "&ndash;": "–",
};
function decode(s: string): string {
  return s
    .replace(/&[a-z#0-9]+;/gi, (m) => ENT[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function stripHtml(html: string): string {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?(?:strong|b|em|i|span|a|u|sup|sub)[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " "),
  ).trim();
}

// Headings whose presence means "everything below is cross-promo, forms,
// FAQ schema, testimonials" — none of which should make it into the React
// app's per-condo editorial fields.
const STOP_HEADINGS = /^(more luxury condos|latest updates|recent posts|insights|inquire|frequently asked|faq|testimonials|reviews|interested in|contact|book a (?:tour|showing)|share this)/i;

// Other named condos in Spencer's portfolio. Any paragraph mentioning these
// is almost certainly cross-promo from a "More Luxury Condos" widget — drop
// it so we don't pollute one condo's record with another condo's prose.
const OTHER_CONDOS_RE =
  /\b(the\s+guardian|the\s+royal|le\s+germain|princeton\s+grand|princeton\s+hall|point\s+on\s+the\s+bow|the\s+concord|park\s+point|drake|smith|vogue|five\s+west|evolution\s+pulse|verve|avenue\s+condo|the\s+mark|vetro|park\s+place|keynote|parkside\s+at\s+waterfront|king\s+edward|westman\s+village|reflection|the\s+montana|princes\s+island\s+estates|the\s+views|covenant\s+house|lincoln\s+condo|arriva|arris\s+residences|the\s+river\b)/i;

// Boilerplate / UI strings that show up inside WP <p> tags.
const UI_NOISE_RE =
  /^(name|email|phone|message|first name|last name|subject)\s*$/i;
const CTA_NOISE_RE =
  /^(get in touch|inquire now|read more|view all|see all|©|all rights reserved|click here|learn more|contact us|schedule a tour|book a showing|fill out the form|interested in)/i;
// Paragraphs that exist only to surface negative dynamic state ("no active
// listings") aren't editorial copy worth porting.
const DYNAMIC_STATE_RE =
  /^(unfortunately, there are no|currently there are no|no active mls listings|no listings (?:available|found)|loading)/i;
// Pure address lines (e.g., "690 Princeton Way SW, Calgary, AB T2P 5J9") —
// these usually leak in from a sidebar pointing at a *different* building.
const ADDRESS_ONLY_RE =
  /^\s*\d{1,5}\s+[A-Za-z][\w\s]*(?:Avenue|Ave|Street|St|Drive|Dr|Road|Rd|Way|Cres|Crescent|Place|Pl|Trail|Tr|Park|Boulevard|Blvd|Lane|Ln|Circle|Cir|Heights|Hts|Gate)(?:\s+(?:NW|NE|SW|SE|N|S|E|W))?\s*,\s*Calgary,\s*AB\s*[A-Z]\d[A-Z]\s*\d[A-Z]\d\.?\s*$/i;

function isUsableParagraph(text: string, condoNameLower: string): boolean {
  if (text.length < 100) return false; // catches fragments like "... offers a range of amenities including"
  if (UI_NOISE_RE.test(text)) return false;
  if (CTA_NOISE_RE.test(text)) return false;
  if (DYNAMIC_STATE_RE.test(text)) return false;
  if (ADDRESS_ONLY_RE.test(text)) return false;
  // Drop paragraphs that mention any OTHER condo by name. (We do allow
  // mentions of the condo being extracted — checked separately below.)
  const m = text.match(OTHER_CONDOS_RE);
  if (m) {
    const mentioned = m[0].toLowerCase();
    if (!condoNameLower.includes(mentioned.toLowerCase())) return false;
  }
  // Skip paragraphs ending with a colon followed by truncation (e.g.
  // "The River offers a range of amenities including" — lead-in to a list
  // that WP rendered separately).
  if (/\b(including|such as|including but not limited to)[\s:]*$/i.test(text)) return false;
  return true;
}

// Walk the HTML, capture (heading, paragraph) pairs in order. Returns
// paragraphs grouped by the H2/H3 that precedes them.
function paragraphsByHeading(
  html: string,
  condoName: string,
): Array<{ heading: string; level: number; paras: string[] }> {
  // Strip noise: scripts, styles, forms, footers, header, navs.
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "");

  const condoNameLower = condoName.toLowerCase();

  // Capture every <h2>/<h3>/<p> in document order using a combined regex.
  const tagRe = /<(h2|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const groups: Array<{ heading: string; level: number; paras: string[] }> = [
    { heading: "_intro", level: 0, paras: [] }, // anything before first H2 lands here
  ];
  let stopped = false;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(clean)) !== null) {
    const tag = m[1].toLowerCase();
    const text = stripHtml(m[2]);
    if (!text || text.length < 20) continue;
    if (tag === "h2" || tag === "h3") {
      // Once we hit a stop heading, ignore everything that follows. This
      // chops off the "More Luxury Condos", FAQ, testimonials, and inquiry
      // form sections cleanly.
      if (STOP_HEADINGS.test(text)) { stopped = true; continue; }
      groups.push({ heading: text, level: tag === "h2" ? 2 : 3, paras: [] });
    } else if (tag === "p") {
      if (stopped) continue;
      if (!isUsableParagraph(text, condoNameLower)) continue;
      const g = groups[groups.length - 1];
      g.paras.push(text);
    }
  }
  // Drop empty groups
  return groups.filter((g) => g.paras.length > 0);
}

// Pull gallery images (wp-content/uploads/...) but skip nav/icons/spencer-rivers-avatar,
// AND filter to only images whose URL contains words from this condo's name or slug.
// The pre-cleanup version pulled the "More Luxury Condos" sidebar thumbnails, so The
// River ended up with hero shots of King Edward, Princeton Hall, etc.
function galleryFromHtml(html: string, slug: string, condoName: string, max = 12): string[] {
  // Build a list of search tokens from the slug and name. We keep tokens
  // 3+ chars (drops "the", "of", "and") and lowercase everything.
  const tokens = new Set<string>();
  for (const src of [slug, condoName]) {
    for (const tok of src.toLowerCase().split(/[\s-]+/)) {
      if (tok.length >= 3 && !["the", "and", "for", "with"].includes(tok)) {
        tokens.add(tok);
      }
    }
  }

  const urls = new Set<string>();
  const re = /<img\b[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    let u = m[1];
    if (!u.includes("/wp-content/uploads/")) continue;
    // Skip thumbnails of the agent's headshot/logo.
    if (/spencer-rivers|cropped-|avatar|logo|favicon/i.test(u)) continue;
    // Strip WordPress responsive variants like "image-300x200.jpg".
    u = u.replace(/-\d+x\d+(\.(?:jpg|jpeg|png|webp))$/i, "$1");
    // Match against the condo's own tokens — the filename or path must
    // contain at least one. Drops cross-promo images cleanly.
    const lower = u.toLowerCase();
    let match = false;
    for (const tok of tokens) {
      if (lower.includes(tok)) { match = true; break; }
    }
    if (!match) continue;
    urls.add(u);
    if (urls.size >= max) break;
  }
  return [...urls];
}

// ----- Paragraph → React field mapping ------------------------------------

const FIELD_KEYWORDS: Record<string, RegExp> = {
  schoolsCopy:  /\b(school|education|academy|college|catchment|elementary|high school|university|kindergarten|cbe|catholic)\b/i,
  diningCopy:   /\b(restaurant|dining|cafe|coffee|bistro|brewery|pub|brew|eat|cuisine|chef|menu)\b/i,
  shoppingCopy: /\b(shopping|retail|mall|grocery|safeway|sunterra|chinook|market|boutique|store)\b/i,
  communityCopy:/\b(community|culture|cultural|festival|event|historic|park|river pathway|walking|recreation|stampede|talisman|stanley)\b/i,
  locationCopy: /\b(location|commute|commuter|transit|lrt|c-train|highway|macleod|downtown|core|street|avenue|walkable|bike|pathway|access)\b/i,
  architecturalCopy: /\b(architect|architectural|design|facade|tower|story|stories|floor|façade|hpa|developer|built|construction|materials?)\b/i,
  residencesCopy: /\b(residence|unit|suite|interior|kitchen|bedroom|bathroom|appliance|finish|floor-to-ceiling|hardwood|granite|fireplace|laundry|balcony|view|penthouse|sqft|square foot)\b/i,
};

const INTRO_KEYWORDS = /^(welcome|about|the\s+\w+\s*$)/i;

// Score a paragraph against each field, pick the highest. Falls back to intro
// when nothing clearly matches.
function mapParaToField(para: string, headingHint: string): keyof typeof FIELD_KEYWORDS | "intro" {
  // Heading hints get priority — many WP pages do have clear H3 labels.
  if (/dining|restaurants?|food|cafe|cuisine/i.test(headingHint)) return "diningCopy";
  if (/school|education/i.test(headingHint)) return "schoolsCopy";
  if (/shop|retail|grocer/i.test(headingHint)) return "shoppingCopy";
  if (/community|culture|lifestyle|recreation/i.test(headingHint)) return "communityCopy";
  if (/location|transit|commute|walk|map/i.test(headingHint)) return "locationCopy";
  if (/architecture|design|building|developer/i.test(headingHint)) return "architecturalCopy";
  if (/residence|interior|suite|unit|home/i.test(headingHint)) return "residencesCopy";
  if (INTRO_KEYWORDS.test(headingHint)) return "intro";

  // Score paragraph text against each field's keyword set.
  let best: keyof typeof FIELD_KEYWORDS | "intro" = "intro";
  let bestScore = 0;
  for (const [field, re] of Object.entries(FIELD_KEYWORDS) as [keyof typeof FIELD_KEYWORDS, RegExp][]) {
    const matches = (para.match(new RegExp(re.source, re.flags + "g")) || []).length;
    if (matches > bestScore) {
      bestScore = matches;
      best = field;
    }
  }
  return bestScore > 0 ? best : "intro";
}

// Build the merged patch object for a condo.
function buildPatch(html: string, condoName: string): Record<string, string[] | string[] | number> {
  const groups = paragraphsByHeading(html, condoName);
  const fields: Record<string, string[]> = {
    intro: [], residencesCopy: [], architecturalCopy: [], locationCopy: [],
    diningCopy: [], shoppingCopy: [], communityCopy: [], schoolsCopy: [],
  };
  for (const g of groups) {
    for (const p of g.paras) {
      const field = mapParaToField(p, g.heading);
      // Avoid duplicates if a paragraph appears multiple times in the page.
      if (!fields[field].includes(p)) fields[field].push(p);
    }
  }
  // Cap each section at ~3 paragraphs to keep page weight reasonable.
  for (const k of Object.keys(fields)) fields[k] = fields[k].slice(0, 3);
  return fields;
}

// ----- Main ----------------------------------------------------------------

async function main() {
  const out: Record<string, any> = {};
  for (const c of CONDOS) {
    process.stdout.write(`fetching ${c.slug} (${c.wpUrl})... `);
    try {
      const r = await fetch(WP_HOST + c.wpUrl);
      if (!r.ok) {
        console.log(`status ${r.status}, skipping`);
        continue;
      }
      const html = await r.text();
      // Derive a display name from the WP <title> for the cross-promo filter
      // (e.g. "The River Condos Calgary - Luxury Homes Calgary" → "The River").
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const wpTitle = titleMatch ? stripHtml(titleMatch[1]) : c.slug;
      const condoName = wpTitle.replace(/\s*(?:Condos?|Calgary|Luxury Homes Calgary|\-).*$/i, "").trim() || c.slug;
      const patch = buildPatch(html, condoName);
      const gallery = galleryFromHtml(html, c.slug, condoName);
      (patch as any).gallery = gallery;
      out[c.slug] = patch;
      const totalWords = Object.values(patch)
        .filter(Array.isArray)
        .flat()
        .filter((x): x is string => typeof x === "string")
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
      console.log(`OK (${totalWords} words, ${gallery.length} gallery)`);
    } catch (e: any) {
      console.log(`ERR: ${e.message}`);
    }
  }

  const banner =
    "// AUTO-GENERATED — do not edit by hand.\n" +
    "// Source: luxuryhomescalgary.ca condo pages (HTML extraction)\n" +
    `// Generated: ${new Date().toISOString()}\n` +
    "// Regenerate: `cd src && npx tsx script/import-wp-condos.ts`\n\n";

  // The patch type matches the editorial/array fields on condoBuildings.
  const typeBlock =
    "export type CondoContentPatch = {\n" +
    "  intro?: string[];\n" +
    "  residencesCopy?: string[];\n" +
    "  architecturalCopy?: string[];\n" +
    "  locationCopy?: string[];\n" +
    "  diningCopy?: string[];\n" +
    "  shoppingCopy?: string[];\n" +
    "  communityCopy?: string[];\n" +
    "  schoolsCopy?: string[];\n" +
    "  gallery?: string[];\n" +
    "};\n\n";

  const file =
    banner +
    typeBlock +
    `export const CONDO_CONTENT_PATCHES: Record<string, CondoContentPatch> = ${JSON.stringify(
      out,
      null,
      2,
    )};\n`;

  const dest = path.resolve(process.cwd(), "server", "seed-migrated-condos.ts");
  fs.writeFileSync(dest, file);
  console.log(`\nWrote ${Object.keys(out).length} condo patches to ${dest}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
