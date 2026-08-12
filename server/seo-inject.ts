/**
 * Per-route SEO meta-tag injection for the React SPA.
 *
 * Problem: the React app is pure CSR. Express serves the raw index.html
 * (which has a generic <title> and no canonical) for every URL, then React
 * renders the actual content client-side. Googlebot has to execute JS to
 * see anything, and the render-budget for 5000+ URLs gets exhausted —
 * leaving most pages stuck in "Discovered – currently not indexed".
 *
 * Solution: at the catch-all, look up the requested URL, build a metadata
 * envelope (title, description, canonical, og tags), and inject those into
 * the <head> of index.html before sending. Googlebot now sees full HEAD
 * metadata immediately, without needing to render. The client-side React
 * still mounts and renders the body content as before.
 *
 * For dynamic routes (/condos/:slug, /neighbourhoods/:slug, /blog/:slug,
 * /mls/:id) we hit the storage layer to look up the actual page data.
 */
import { storage } from "./storage";

const ORIGIN = (process.env.PUBLIC_ORIGIN || "https://riversrealestate.ca").replace(
  /\/$/,
  "",
);
const SITE_NAME = "Rivers Real Estate";
const BRAND_TAGLINE = "Spencer Rivers — Luxury Homes Calgary";
// Brand OG/Twitter card (1200×630, built from the Rivers Real Estate logo —
// see client/public/img/og-default.jpg). Never a stock photo: link previews
// are brand surface.
const DEFAULT_IMAGE = `${ORIGIN}/img/og-default.jpg`;

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  noindex?: boolean;
  // Schema.org JSON-LD blocks to inject into the page <head>. Each entry
  // becomes its own <script type="application/ld+json"> tag. Used by
  // Google rich results, Perplexity, and ChatGPT browsing to understand
  // what kind of entity this page describes.
  jsonLd?: Array<Record<string, any>>;
}

// Shared organization/agent identity reused across schemas. Treating Spencer
// as a Person who is the principal of a RealEstateAgent organization is the
// shape Google tends to render most reliably.
const PERSON_SCHEMA = {
  "@type": "Person",
  "@id": "https://riversrealestate.ca/#spencer",
  name: "Spencer Rivers",
  jobTitle: "Luxury Real Estate Agent",
  telephone: "+1-403-966-9237",
  email: "spencer@riversrealestate.ca",
  url: "https://riversrealestate.ca/",
  sameAs: [
    "https://luxuryhomescalgary.ca/",
    "https://www.facebook.com/SpencerRiversRealEstate/",
    "https://www.realtor.ca/agent/2135685/spencer-rivers-700-1816-crowchild-trail-nw-calgary-alberta-t2m3y7",
  ],
};

const REAL_ESTATE_AGENT_SCHEMA = {
  "@type": "RealEstateAgent",
  "@id": "https://riversrealestate.ca/#agent",
  name: "Rivers Real Estate — Spencer Rivers",
  url: "https://riversrealestate.ca/",
  telephone: "+1-403-966-9237",
  email: "spencer@riversrealestate.ca",
  areaServed: { "@type": "City", name: "Calgary", addressRegion: "AB", addressCountry: "CA" },
  priceRange: "$1M+",
  address: {
    "@type": "PostalAddress",
    streetAddress: "38 Elmont Cove SW",
    addressLocality: "Calgary",
    addressRegion: "Alberta",
    postalCode: "T3H 6A5",
    addressCountry: "CA",
  },
  founder: PERSON_SCHEMA,
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Build the metadata for a given URL path. Returns null if the path looks
 * like a JSON/asset/api request that shouldn't go through this pipeline.
 */
// Audience-segment landing pages (/work-with/:slug). Titles/descriptions must
// stay in sync with client/src/pages/work-with.tsx, which owns the full page
// content (FAQ schema included — injected client-side by SeoHead).
const WORK_WITH_META: Record<
  string,
  { title: string; description: string; image: string }
> = {
  "luxury-properties": {
    title:
      "Luxury Home Buyers | Calgary Estates, Penthouses & Villas | Spencer Rivers",
    description:
      "Buy in Calgary's $1M+ market with Spencer Rivers, CLHMS. Private showings, off-market access, and data-driven negotiation across Springbank Hill, Aspen Woods, Mount Royal, and more.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=1200&fit=crop",
  },
  "first-time-home-sellers": {
    title: "First-Time Home Sellers in Calgary | Spencer Rivers, Rivers Real Estate",
    description:
      "Selling your first home in Calgary? Spencer Rivers handles pricing, prep, marketing, and every form — with a written plan and a net-proceeds estimate before you list.",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&h=1200&fit=crop",
  },
  "empty-nesters": {
    title: "Downsizing & Empty Nesters in Calgary | Spencer Rivers, Rivers Real Estate",
    description:
      "Right-size without compromise. Spencer Rivers, Certified Condo Specialist, coordinates the sale of the family home and the move into a luxury condo, villa, or bungalow — one plan, one move.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=1200&fit=crop",
  },
  "first-time-home-buyers": {
    title: "First-Time Home Buyers in Calgary | Spencer Rivers, Rivers Real Estate",
    description:
      "Buy your first Calgary home with a coach, not a salesperson. Spencer Rivers guides financing, inspections, and neighbourhood choice — data first, pressure never.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&h=1200&fit=crop",
  },
  "innercity-properties": {
    title:
      "Inner-City Calgary Real Estate | Mount Royal, Elbow Park, Mission | Spencer Rivers",
    description:
      "Buy or sell in Calgary's inner city with Spencer Rivers. Block-level expertise across Upper Mount Royal, Elbow Park, Roxboro, Mission, and Beltline — estates, infills, and condos.",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&h=1200&fit=crop",
  },
  "move-ups": {
    title:
      "Move-Up Buyers in Calgary | Sell & Buy Without Two Mortgages | Spencer Rivers",
    description:
      "Trading up to your forever home? Spencer Rivers coordinates the sell-and-buy sequence — pricing, bridge financing, and possession dates — so you move once, without carrying two mortgages.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&h=1200&fit=crop",
  },
  "family-focused-properties": {
    title:
      "Family Homes in Calgary | School Zones, Lots & Communities | Spencer Rivers",
    description:
      "Find the Calgary communities built for growing families. Spencer Rivers verifies school zones, walks the streets, and matches your family to the right home in Springbank Hill, Aspen Woods, Mahogany, and more.",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&h=1200&fit=crop",
  },
  "urban-properties": {
    title: "Urban Condos, Lofts & Townhomes in Calgary | Spencer Rivers",
    description:
      "Buy urban Calgary with a Certified Condo Specialist. Spencer Rivers vets buildings — reserve funds, boards, construction — across Beltline, Mission, Kensington, Inglewood, and East Village.",
    image:
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1600&h=1200&fit=crop",
  },
};

export function metaForPath(path: string): SeoMeta | null {
  if (!path || path.startsWith("/api/") || path.startsWith("/assets/")) return null;
  if (/\.[a-z0-9]{1,8}$/i.test(path) && !path.endsWith(".html")) return null;

  // Strip trailing slash for matching (but keep canonical without it).
  const p = path === "/" ? "/" : path.replace(/\/$/, "");
  const canonical = `${ORIGIN}${p === "/" ? "/" : p}`;

  // ---- Static pages ----
  if (p === "/") {
    return {
      title: "Spencer Rivers — Luxury Homes Calgary | Rivers Real Estate",
      description:
        "Calgary's top luxury real estate agent. Spencer Rivers represents buyers and sellers in Springbank Hill, Aspen Woods, Upper Mount Royal, Elbow Park, Britannia, and Bel-Aire.",
      canonical: `${ORIGIN}/`,
      ogType: "website",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${ORIGIN}/#website`,
          url: `${ORIGIN}/`,
          name: SITE_NAME,
          publisher: REAL_ESTATE_AGENT_SCHEMA,
          potentialAction: {
            "@type": "SearchAction",
            target: `${ORIGIN}/mls?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        { "@context": "https://schema.org", ...REAL_ESTATE_AGENT_SCHEMA },
      ],
    };
  }
  if (p === "/mls") {
    return {
      title: "MLS Search — Live Calgary Luxury Listings | Rivers Real Estate",
      description:
        "Browse live Calgary MLS® listings from the Pillar 9 feed. Filter by neighbourhood, price, type. Spencer Rivers represents buyers across the city.",
      canonical: `${ORIGIN}/mls`,
    };
  }
  if (p === "/neighbourhoods") {
    return {
      title: "Calgary Luxury Neighbourhoods | Rivers Real Estate",
      description:
        "Block-by-block expertise across Calgary's prestige communities: Upper Mount Royal, Elbow Park, Britannia, Aspen Woods, Springbank Hill, Bel-Aire, and more.",
      canonical: `${ORIGIN}/neighbourhoods`,
    };
  }
  if (p === "/condos") {
    return {
      title: "Calgary Luxury Condos | Rivers Real Estate",
      description:
        "Calgary's most-asked-about luxury condo buildings — The Royal, The Concord, The River, Eau Claire, Belle Aire — pricing, inventory, and resale insight.",
      canonical: `${ORIGIN}/condos`,
    };
  }
  if (p === "/about") {
    return {
      title: `About Spencer Rivers — ${SITE_NAME}`,
      description:
        "12 years in Calgary's luxury market. Top 1% in Canada, $100M+ in career sales. Discretion, data, and direct conversation.",
      canonical: `${ORIGIN}/about`,
      ogType: "profile",
      jsonLd: [
        {
          "@context": "https://schema.org",
          ...PERSON_SCHEMA,
          worksFor: REAL_ESTATE_AGENT_SCHEMA,
          knowsAbout: [
            "Calgary luxury real estate",
            "Upper Mount Royal",
            "Elbow Park",
            "Britannia",
            "Aspen Woods",
            "Springbank Hill",
            "Bel-Aire",
          ],
        },
      ],
    };
  }
  if (p === "/contact") {
    return {
      title: `Contact Spencer Rivers — ${SITE_NAME}`,
      description:
        "Get in touch with Spencer Rivers — direct line (403) 966-9237. Every inquiry gets a personal reply within one business day.",
      canonical: `${ORIGIN}/contact`,
    };
  }
  if (p === "/home-evaluation") {
    return {
      title: "What's Your Calgary Home Worth? — Free Home Valuation",
      description:
        "Get an instant AI-powered estimate based on recent comparable sales, plus a follow-up from Spencer to refine the number with what data alone can't see.",
      canonical: `${ORIGIN}/home-evaluation`,
    };
  }
  if (p === "/blog") {
    return {
      title: `Calgary Luxury Real Estate Journal — ${SITE_NAME}`,
      description:
        "Notes, market analyses, and neighbourhood deep-dives from Calgary's top luxury real estate agent.",
      canonical: `${ORIGIN}/blog`,
    };
  }
  if (p === "/sold" || p === "/sold-listings") {
    return {
      title: `Recently Sold — ${SITE_NAME}`,
      description:
        "Selected recently sold Calgary luxury homes represented by Spencer Rivers.",
      canonical: `${ORIGIN}/sold`,
    };
  }
  if (p === "/assignments") {
    // Must stay in sync with client/src/pages/assignments.tsx (SEO_TITLE /
    // SEO_DESCRIPTION), which owns the full page content and FAQ schema.
    return {
      title:
        "Calgary Condo Assignment Sales | Buy or Sell a Pre-Construction Assignment | Spencer Rivers",
      description:
        "Buy or sell a pre-construction condo assignment in Calgary with Spencer Rivers. Current assignments at the Lincoln (Beltline) and Sovereign (Mission), plus developer consent, deposits, and GST handled properly.",
      canonical: `${ORIGIN}/assignments`,
      ogImage: `${ORIGIN}/img/assignments/lincoln-exterior.jpg`,
    };
  }
  if (p === "/work-with") {
    return {
      title: `Who We Work With | Spencer Rivers, ${SITE_NAME} Calgary`,
      description:
        "Luxury buyers, first-time sellers, empty nesters, move-up families, and urban professionals — see how Spencer Rivers works with each, across Calgary's best communities.",
      canonical: `${ORIGIN}/work-with`,
    };
  }
  if (p.startsWith("/work-with/")) {
    const m = WORK_WITH_META[p.slice("/work-with/".length)];
    if (!m) return null;
    return {
      title: m.title,
      description: m.description,
      canonical,
      // Deliberately not m.image — those are Unsplash stock, and OG/Twitter
      // cards must never resolve to a stock-photo domain. Falls back to the
      // brand card until per-segment brand photography exists.
    };
  }

  // ---- Dynamic: blog post ----
  if (p.startsWith("/blog/")) {
    const slug = p.slice("/blog/".length);
    try {
      const post = storage.getBlogBySlug(slug) as any;
      if (!post) return null;
      if (post.status === "draft") {
        return {
          title: `${post.title} — ${SITE_NAME}`,
          description: post.excerpt || "",
          canonical: `${ORIGIN}/blog/${slug}`,
          noindex: true,
        };
      }
      const blogUrl = `${ORIGIN}/blog/${slug}`;
      const heroImage = post.heroImage || DEFAULT_IMAGE;
      return {
        title: `${post.title} — ${SITE_NAME}`,
        description:
          post.excerpt ||
          `Calgary luxury real estate insight from Spencer Rivers.`,
        canonical: blogUrl,
        ogImage: heroImage,
        ogType: "article",
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${blogUrl}#article`,
            headline: post.title,
            description: post.excerpt || "",
            image: heroImage,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            inLanguage: "en-CA",
            url: blogUrl,
            mainEntityOfPage: { "@type": "WebPage", "@id": blogUrl },
            articleSection: post.category || "Calgary Real Estate",
            wordCount: typeof post.body === "string" ? post.body.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length : undefined,
            author: { ...PERSON_SCHEMA, name: post.authorName || "Spencer Rivers" },
            publisher: REAL_ESTATE_AGENT_SCHEMA,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/` },
              { "@type": "ListItem", position: 2, name: "Journal", item: `${ORIGIN}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: blogUrl },
            ],
          },
        ],
      };
    } catch {
      return null;
    }
  }

  // ---- Dynamic: neighbourhood detail ----
  if (p.startsWith("/neighbourhoods/")) {
    const slug = p.slice("/neighbourhoods/".length);
    try {
      const n = storage.getNeighbourhoodBySlug(slug) as any;
      if (!n) return null;
      const nUrl = `${ORIGIN}/neighbourhoods/${slug}`;
      return {
        title: `${n.name} Calgary Real Estate Guide — ${SITE_NAME}`,
        description:
          n.tagline ||
          `Spencer Rivers' insider guide to ${n.name}, Calgary — homes, pricing, market trends.`,
        canonical: nUrl,
        ogImage: n.heroImage || DEFAULT_IMAGE,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "Place",
            "@id": `${nUrl}#place`,
            name: `${n.name}, Calgary`,
            description: n.tagline || `${n.name} neighbourhood in Calgary, Alberta.`,
            url: nUrl,
            image: n.heroImage || DEFAULT_IMAGE,
            ...(n.centerLat && n.centerLng
              ? { geo: { "@type": "GeoCoordinates", latitude: n.centerLat, longitude: n.centerLng } }
              : {}),
            containedInPlace: {
              "@type": "City",
              name: "Calgary",
              addressRegion: "AB",
              addressCountry: "CA",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/` },
              { "@type": "ListItem", position: 2, name: "Neighbourhoods", item: `${ORIGIN}/neighbourhoods` },
              { "@type": "ListItem", position: 3, name: n.name, item: nUrl },
            ],
          },
        ],
      };
    } catch {
      return null;
    }
  }

  // ---- Dynamic: condo detail ----
  if (p.startsWith("/condos/")) {
    const slug = p.slice("/condos/".length);
    try {
      const c = storage.getCondoBuildingBySlug(slug);
      if (!c) return null;
      return {
        title: `${(c as any).name} — Calgary Luxury Condos | ${SITE_NAME}`,
        description:
          (c as any).tagline ||
          `Pricing, inventory, and resale data for ${(c as any).name} in Calgary.`,
        canonical: `${ORIGIN}/condos/${slug}`,
        ogImage: (c as any).heroImage || DEFAULT_IMAGE,
      };
    } catch {
      return null;
    }
  }

  // ---- Dynamic: MLS listing detail ----
  if (p.startsWith("/mls/")) {
    const id = p.slice("/mls/".length);
    try {
      const l: any = storage.getMlsListingById(id);
      if (!l) return null;
      const addr =
        l.unparsedAddress ||
        [l.streetNumber, l.streetName, l.streetSuffix, l.city].filter(Boolean).join(" ") ||
        l.address ||
        "Calgary";
      const price = l.listPrice
        ? `$${Number(l.listPrice).toLocaleString()}`
        : null;
      const beds = l.bedrooms ? `${l.bedrooms} bed` : null;
      const baths = l.bathrooms ? `${l.bathrooms} bath` : null;
      const summary = [price, beds, baths].filter(Boolean).join(" · ");
      return {
        title: `${addr} — ${price ?? "Calgary Luxury Listing"} | ${SITE_NAME}`,
        description: summary
          ? `${addr}. ${summary}. Calgary MLS®. Represented or shown by Spencer Rivers.`
          : `${addr}. Calgary MLS® listing represented or shown by Spencer Rivers.`,
        canonical: `${ORIGIN}/mls/${id}`,
        ogImage: l.heroImage || (l.photos && l.photos[0]) || DEFAULT_IMAGE,
      };
    } catch {
      return null;
    }
  }

  // Public listing page (/p/:slug — the agent's own listings, shared by
  // link). Returning null here used to fall through to the 404 handler, so
  // every shared listing URL served HTTP 404 + noindex to crawlers and link
  // unfurlers. Look the listing up properly instead.
  if (p.startsWith("/p/")) {
    const slug = p.slice("/p/".length);
    try {
      const l = storage.getListingBySlug(slug) as any;
      if (!l) return null;
      const price =
        typeof l.price === "number" ? `$${Number(l.price).toLocaleString()}` : null;
      return {
        title: `${l.title || l.address} — ${SITE_NAME}`,
        description: [l.address, price, l.beds ? `${l.beds} bed` : null, l.baths ? `${l.baths} bath` : null]
          .filter(Boolean)
          .join(" · ") || `Calgary listing represented by Spencer Rivers.`,
        canonical: `${ORIGIN}/p/${slug}`,
        ogImage: l.heroImage || (Array.isArray(l.photos) && l.photos[0]) || undefined,
      };
    } catch {
      return null;
    }
  }

  // Account & admin pages — noindex (they are user-private flows)
  if (p.startsWith("/account") || p.startsWith("/admin")) {
    return {
      title: SITE_NAME,
      description: "",
      canonical: `${ORIGIN}${p}`,
      noindex: true,
    };
  }

  // Unknown path — signal to caller to return a soft-404 (real 404).
  return null;
}

/**
 * Inject the SEO metadata into a raw HTML string by replacing the existing
 * <title> and <meta name="description"> tags, and inserting canonical +
 * og + twitter tags. Idempotent — runs on the template output every
 * request, so the page-specific tags are always fresh.
 */
export function injectMetaIntoHtml(html: string, meta: SeoMeta): string {
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const canonical = escapeHtml(meta.canonical);
  const ogImage = escapeHtml(meta.ogImage || DEFAULT_IMAGE);
  const ogType = meta.ogType || "website";

  const tags = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
  ];
  if (meta.noindex) {
    tags.push(`<meta name="robots" content="noindex,nofollow" />`);
  }

  // JSON-LD structured data. Inject each schema block as its own script tag.
  // Escaping `</` inside JSON is required to prevent the closing-script
  // sequence appearing inside the JSON payload from prematurely terminating
  // the script tag.
  if (meta.jsonLd && meta.jsonLd.length > 0) {
    for (const block of meta.jsonLd) {
      try {
        const json = JSON.stringify(block).replace(/<\/(script)/gi, "<\\/$1");
        tags.push(`<script type="application/ld+json">${json}</script>`);
      } catch {
        // Skip a malformed schema block rather than failing the whole page.
      }
    }
  }

  let out = html;
  // Replace the static <title> with the page-specific one.
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  // Replace the static description.
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${desc}" />`,
  );
  // Inject the rest just before </head>.
  out = out.replace(/<\/head>/i, `${tags.join("\n    ")}\n  </head>`);
  return out;
}

export { ORIGIN as SEO_ORIGIN, BRAND_TAGLINE };
