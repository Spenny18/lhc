// Generates a hero image for each marquee condo via OpenAI's Image API.
//
// Why a script and not a build step:
//   - Image generation is slow + costs money (~$0.04/image with gpt-image-1).
//   - Output is committed to client/public/condo-heroes/ and shipped as
//     static assets so the public site has zero runtime dependency on OpenAI.
//
// Usage:
//   export OPENAI_API_KEY=sk-...
//   cd src
//   npx tsx script/generate-condo-images.ts
//
// Optional flags:
//   --slug=the-river       Generate just one condo
//   --force                Overwrite existing files (default: skip if present)
//   --model=gpt-image-1    Override the model (defaults to gpt-image-1)
//
// After it finishes, run `fly deploy` and the new images ship with the next
// build. The seed automatically points to /condo-heroes/{slug}.png — see
// CONDO_IMAGE_PROMPTS below for what each prompt asks for.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// __dirname shim — the project is ESM ("type": "module"), so we synthesize it
// from import.meta.url instead of relying on the CommonJS global.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Per-condo image prompts. Each is tuned to produce a realistic, on-brand
// architectural render — neutral exposure, golden-hour lighting, no people,
// no text overlays, pure exterior shot. The prompts deliberately mention
// "Calgary, Alberta" + the actual building's distinguishing feature so the
// model produces something visually correct rather than generic.
// ============================================================================
const PROMPT_BASE =
  "Architectural photography of a real estate condominium building, " +
  "exterior wide shot, golden hour, soft warm sunlight, clear blue sky, " +
  "ultra-realistic, photorealistic, 50mm lens, slight slight upward angle, " +
  "no people, no signage, no text, no logos, no watermark, " +
  "magazine-quality real estate marketing photo, 16:9 cinematic framing.";

export const CONDO_IMAGE_PROMPTS: Record<string, string> = {
  // Beltline twin towers — Calgary's tallest residential
  "the-guardian-south":
    "Twin 44-story residential glass towers rising above Calgary's Beltline. The South Tower is the foreground — slim profile, full floor-to-ceiling glass, contemporary metallic facade. Downtown skyline behind. Inner-city setting, paved street with mature trees in foreground. " +
    PROMPT_BASE,
  "the-guardian-north":
    "44-story residential glass tower in Calgary's Beltline, identical twin to the South Tower visible behind. Slim modern profile, floor-to-ceiling glazing, dark metallic frame. Bow River and downtown skyline beyond. " +
    PROMPT_BASE,

  // Heritage / boutique inner-city
  "the-royal":
    "Mid-rise luxury residential condo on 17th Avenue in Calgary's Beltline. Twelve-story brick and limestone exterior, contemporary punched windows, warm bronze metalwork. Street-level retail at base. Urban setting, mature trees. " +
    PROMPT_BASE,
  "le-germain":
    "Boutique upscale hotel-residence in downtown Calgary, eight stories of dark stone with bronze window frames, sophisticated European-influenced architecture. Located in Stephen Avenue area. " +
    PROMPT_BASE,
  "princeton-grand":
    "Luxury residential condominium tower in downtown Calgary's West End. Twenty-eight stories, full glass curtain wall, modern slender profile. Adjacent to Bow River and Princeton's Landing park. " +
    PROMPT_BASE,
  "point-on-the-bow":
    "Riverside luxury condo tower on 2nd Avenue SW in Eau Claire, Calgary. Twenty stories of glass and concrete, curved facade facing the Bow River, balconies with glass railings. " +
    PROMPT_BASE,
  "the-concord":
    "Ultra-luxury low-rise condominium in Eau Claire on 1st Avenue SW, Calgary. Six stories, sandstone exterior, large terraces with greenery, premium finishes. Bow River Pathway in foreground. " +
    PROMPT_BASE,
  "park-point":
    "Modern residential tower overlooking Central Memorial Park in Calgary's Beltline. Thirty-four stories, geometric facade with alternating dark glass and lighter panels, mature park trees in foreground. " +
    PROMPT_BASE,
  "drake":
    "Contemporary mid-rise condo in Calgary's Beltline on 15th Avenue SW. Fourteen stories, dark metal cladding with vibrant accent panels, edgy modern aesthetic. Urban tree-lined setting. " +
    PROMPT_BASE,
  "smith":
    "Boutique residential building in Calgary's Beltline on 14th Avenue SW. Fourteen stories, charcoal brick exterior with white window frames, contemporary urban design. " +
    PROMPT_BASE,
  "vogue":
    "Luxury residential tower in Calgary's downtown West End on 6th Avenue SW. Thirty-six stories, sleek dark glass facade, slender profile, full-height windows. " +
    PROMPT_BASE,
  "five-west-phase-i":
    "Modern condominium tower in downtown Calgary on 5th Avenue SW. Twenty-six stories, light beige stone with extensive glass, contemporary detailing. Office tower neighbours visible in skyline. " +
    PROMPT_BASE,
  "evolution-pulse":
    "Contemporary loft-style condo in Calgary's East Village on 6th Avenue SE. Twenty-six stories, exposed concrete and glass, industrial-luxe aesthetic, riverfront pathway in foreground. " +
    PROMPT_BASE,
  "verve":
    "Mid-rise luxury residential building in East Village Calgary, on 6th Avenue SE. Twenty-five stories, copper-toned metallic accents on glass facade, modern design. Bow River nearby. " +
    PROMPT_BASE,
  "avenue":
    "Luxury condominium in downtown Calgary on 5th Avenue SW. Thirty-four stories, contemporary glass tower with crisp geometric form, premium finishes visible at base. " +
    PROMPT_BASE,
  "the-mark":
    "Modern residential tower in downtown Calgary on 6th Street SW. Thirty-four stories, dark metallic glass facade with sleek vertical lines, contemporary curtain wall. " +
    PROMPT_BASE,
  "vetro":
    "Glass-and-steel high-rise condominium on 1st Street SE in Calgary's Beltline. Forty stories, full glass facade in cool blue-grey tones, slender profile. Inner-city neighbourhood setting. " +
    PROMPT_BASE,
  "park-place":
    "Luxury residential tower facing Central Memorial Park in Calgary's Beltline on 13th Avenue SW. Twenty-six stories, contemporary stone-and-glass facade, large balconies. Mature park elms in foreground. " +
    PROMPT_BASE,
  "keynote":
    "Modern mixed-use residential tower in East Village Calgary on 13th Avenue SE. Thirty-four stories, contemporary glass curtain wall with bronze accents, retail base. Urban regeneration setting. " +
    PROMPT_BASE,
  "parkside-at-waterfront":
    "Riverfront luxury condo in Calgary's Eau Claire / Waterfront area. Fourteen stories, light limestone exterior with extensive glass balconies, located on Waterfront Court SW directly facing the Bow River pathway. " +
    PROMPT_BASE,

  // Mission — The River
  "the-river":
    "Two-tower luxury residential building in Calgary's Mission neighbourhood, addresses 135 and 137 26 Avenue SW. Fifteen stories, sleek contemporary facade in white and glass, large private balconies, Elbow River pathway and mature trees in foreground. Sophisticated low-key luxury aesthetic. " +
    PROMPT_BASE,

  // Six new condos verified against luxuryhomescalgary.ca (Apr 2026 batch)
  "residences-of-king-edward":
    "Heritage adaptive-reuse boutique condominium in Calgary's South Calgary neighbourhood near Marda Loop, located at 3030 17 Street SW. Three-storey low-rise residence built into the former 1895 King Edward School site. Coursed ashlar sandstone facade with split-faced and smooth-faced finishes, prominent custom-carved stone front entrance cornice, arched windows, contemporary glazing accents bringing modern luxury to the heritage massing. Mature elm-lined inner-city street setting. " +
    PROMPT_BASE,
  "princeton-hall":
    "14-storey luxury residential mid-rise in Calgary's Eau Claire neighbourhood, located at 690 Princeton Way SW. Originally built in 2002 by Princeton Developments, comprehensively renovated 2012-2015 with a refreshed contemporary facade — light stone-and-glass exterior, slim modern profile, generous balconies. Set on a tree-lined Eau Claire street near the Bow River pathway. " +
    PROMPT_BASE,
  "reflection-westman-village":
    "Boutique 4-storey lakefront luxury residential building in Calgary's master-planned Mahogany community, part of Westman Village by Jayman BUILT, at 30 Mahogany Mews SE. Contemporary West Coast-inspired architecture: clean lines, earth-tone cladding, natural wood accents, low-pitch rooflines, large glazing facing Mahogany Lake. Connected by +15 skywalks to neighbouring 6-storey buildings (visible in background). Lake and beach in foreground. " +
    PROMPT_BASE,
  "the-montana":
    "27-storey luxury residential concrete high-rise in Calgary's Beltline neighbourhood at 817 15 Avenue SW. Completed in 2009 by ProCura Real Estate Services. Sleek contemporary facade combining concrete frame with extensive glazing and glass-railing balconies, slender profile rising above the 17 Avenue retail strip. Mature trees and walkable Beltline streetscape in foreground. " +
    PROMPT_BASE,
  "the-views":
    "15-storey concrete luxury residential high-rise (also known as Liberté) in Calgary's Eau Claire neighbourhood at 804 3 Avenue SW. Developed by Bosa Developments. Distinctive contemporary design: south-facing expansive windows, signature well-rounded balconies, crossover floors on 5th, 9th and 13th levels connected by glass walkways visible across the facade. Bow River and downtown skyline beyond. " +
    PROMPT_BASE,
  "lincoln":
    "36-storey landmark luxury residential high-rise in Calgary's Beltline at 301 11 Avenue SW. Recently completed by Truman, designed by NORR Architects. Modern concrete tower with sleek contemporary facade, clean vertical lines, expansive floor-to-ceiling glazing, premium materials. Slim slender profile rising above the Beltline streetscape. Walk Score 98/100 — set within an active, walkable inner-city block with mature trees in foreground. " +
    PROMPT_BASE,
};

// ============================================================================
// Generation runner
// ============================================================================

interface Args {
  slug?: string;
  force: boolean;
  model: string;
}

function parseArgs(argv: string[]): Args {
  const out: Args = { force: false, model: "gpt-image-1" };
  for (const a of argv.slice(2)) {
    if (a.startsWith("--slug=")) out.slug = a.slice("--slug=".length);
    else if (a === "--force") out.force = true;
    else if (a.startsWith("--model=")) out.model = a.slice("--model=".length);
  }
  return out;
}

async function generateOne(slug: string, prompt: string, model: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1536x1024", // 3:2, close to the 16:9 hero crop we use
      n: 1,
      // gpt-image-1 returns base64 by default (no `response_format` field)
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 400)}`);
  }
  const data: any = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  const url = data?.data?.[0]?.url;
  if (b64) return Buffer.from(b64, "base64");
  if (url) {
    const imgRes = await fetch(url);
    return Buffer.from(await imgRes.arrayBuffer());
  }
  throw new Error(`OpenAI returned no image data for ${slug}`);
}

async function main() {
  const args = parseArgs(process.argv);
  const outDir = path.resolve(__dirname, "..", "client", "public", "condo-heroes");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const slugs = args.slug ? [args.slug] : Object.keys(CONDO_IMAGE_PROMPTS);

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  for (const slug of slugs) {
    const prompt = CONDO_IMAGE_PROMPTS[slug];
    if (!prompt) {
      console.warn(`[skip] no prompt defined for slug "${slug}"`);
      skipped++;
      continue;
    }
    const filePath = path.join(outDir, `${slug}.png`);
    if (fs.existsSync(filePath) && !args.force) {
      console.log(`[skip] ${slug}.png exists (pass --force to regenerate)`);
      skipped++;
      continue;
    }
    try {
      console.log(`[gen ] ${slug} ...`);
      const buf = await generateOne(slug, prompt, args.model);
      fs.writeFileSync(filePath, buf);
      console.log(`[ok  ] ${slug}.png (${(buf.length / 1024).toFixed(0)} KB)`);
      generated++;
    } catch (err: any) {
      console.error(`[fail] ${slug}: ${err?.message ?? err}`);
      failed++;
    }
  }
  console.log(`\nDone: ${generated} generated, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
