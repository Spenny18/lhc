// Per-page SEO. Sets <title>, meta description, canonical, OpenGraph, and any
// JSON-LD schemas in the document head. Designed for migrating ranking pages
// from luxuryhomescalgary.ca (WordPress) to this React app without losing
// search position. Each page that wants to rank renders <SeoHead/> with its
// own copy + structured data. Cleans up its own injected nodes on unmount so
// SPA navigation doesn't pile up stale tags.
import { useEffect } from "react";

export interface SeoFAQ {
  question: string;
  answer: string;
}

export interface SeoBreadcrumb {
  label: string;
  url: string;
}

export interface SeoHeadProps {
  // Required
  title: string; // "<page title> | Luxury Homes Calgary" — pass complete
  description: string;
  // Strongly recommended
  canonical?: string; // absolute URL (https://luxuryhomescalgary.ca/...)
  ogImage?: string;
  ogType?: "website" | "article" | "place";
  // Structured data — anything you pass becomes a separate <script type="application/ld+json"> tag.
  // Pre-built helpers below cover the common cases (RealEstateListing, Place, FAQPage, BreadcrumbList).
  schemas?: any[];
  // Easy shortcuts that auto-build schemas
  faq?: SeoFAQ[];
  breadcrumbs?: SeoBreadcrumb[];
  // Per-page noindex/nofollow if you ever need it (admin pages, drafts).
  noindex?: boolean;
}

const DATA_ATTR = "data-rivers-seo";

function setOrCreateMeta(selector: string, attrName: string, attrValue: string, content: string) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    el.setAttribute(DATA_ATTR, "1");
    document.head.appendChild(el);
  }
  el.content = content;
}

function setOrCreateLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    el.setAttribute(DATA_ATTR, "1");
    document.head.appendChild(el);
  }
  el.href = href;
}

export function SeoHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  schemas,
  faq,
  breadcrumbs,
  noindex,
}: SeoHeadProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    setOrCreateMeta('meta[name="description"]', "name", "description", description);
    setOrCreateMeta('meta[property="og:title"]', "property", "og:title", title);
    setOrCreateMeta('meta[property="og:description"]', "property", "og:description", description);
    setOrCreateMeta('meta[property="og:type"]', "property", "og:type", ogType);
    setOrCreateMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setOrCreateMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setOrCreateMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    if (canonical) {
      setOrCreateLink("canonical", canonical);
      setOrCreateMeta('meta[property="og:url"]', "property", "og:url", canonical);
    }
    if (ogImage) {
      setOrCreateMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      setOrCreateMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    }
    if (noindex) {
      setOrCreateMeta('meta[name="robots"]', "name", "robots", "noindex,nofollow");
    } else {
      // Make sure no leftover noindex hangs around from a previous page.
      const r = document.head.querySelector('meta[name="robots"]');
      if (r) r.parentElement?.removeChild(r);
    }

    // Inject JSON-LD schemas — combine the explicit `schemas` array with
    // shortcut-derived ones (faq, breadcrumbs).
    const allSchemas: any[] = [];
    if (Array.isArray(schemas)) allSchemas.push(...schemas);
    if (faq && faq.length) allSchemas.push(buildFaqSchema(faq));
    if (breadcrumbs && breadcrumbs.length) allSchemas.push(buildBreadcrumbSchema(breadcrumbs));

    const injected: HTMLScriptElement[] = [];
    for (const s of allSchemas) {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.setAttribute(DATA_ATTR, "page");
      el.textContent = JSON.stringify(s);
      document.head.appendChild(el);
      injected.push(el);
    }

    return () => {
      // Restore previous title; remove only the schema scripts we injected.
      document.title = prevTitle;
      for (const el of injected) el.parentElement?.removeChild(el);
      // Don't strip meta tags — leaving them is fine; they get overwritten
      // on the next page's mount via setOrCreateMeta.
    };
  }, [
    title,
    description,
    canonical,
    ogImage,
    ogType,
    JSON.stringify(schemas ?? null),
    JSON.stringify(faq ?? null),
    JSON.stringify(breadcrumbs ?? null),
    noindex,
  ]);

  return null;
}

// =============================================================================
// Schema builders — typed and consistent so pages don't reinvent JSON-LD shape.
// =============================================================================

const SITE_ORIGIN = "https://luxuryhomescalgary.ca";

// Organization + Person rolled into one entity, mirroring the structure your
// WordPress site already uses. Renders as the global "agent" entity.
export function buildOrgPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "Person", "RealEstateAgent"],
        "@id": `${SITE_ORIGIN}/#person`,
        name: "Spencer Rivers — Top Calgary Realtor",
        url: SITE_ORIGIN,
        sameAs: [
          "https://www.facebook.com/SpencerRiversRealEstate/",
          "https://www.instagram.com/riversrealtor/",
          "https://twitter.com/riversrealtor",
        ],
        email: "spencer@riversrealestate.ca",
        telephone: "+1-403-966-9237",
        address: {
          "@type": "PostalAddress",
          streetAddress: "38 Elmont Cove SW",
          addressLocality: "Calgary",
          addressRegion: "Alberta",
          postalCode: "T3H 6A5",
          addressCountry: "Canada",
        },
        areaServed: {
          "@type": "City",
          name: "Calgary",
          address: { "@type": "PostalAddress", addressRegion: "Alberta", addressCountry: "Canada" },
        },
      },
    ],
  };
}

export function buildFaqSchema(faq: SeoFAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function buildBreadcrumbSchema(crumbs: SeoBreadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.url,
    })),
  };
}

// Place schema for a building or neighbourhood. Useful for local SEO surfaces.
export function buildPlaceSchema(opts: {
  name: string;
  description?: string;
  url: string;
  address: string; // freeform "135 26 Avenue SW, Calgary, AB"
  lat: number;
  lng: number;
  image?: string;
}) {
  const { name, description, url, address, lat, lng, image } = opts;
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name,
    description,
    url,
    image,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Calgary",
      addressRegion: "Alberta",
      addressCountry: "Canada",
    },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
  };
}

// RealEstateListing for individual MLS detail pages.
export function buildRealEstateListingSchema(opts: {
  url: string;
  name: string;
  description?: string;
  address: string;
  lat?: number;
  lng?: number;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  image?: string;
}) {
  const { url, name, description, address, lat, lng, price, beds, baths, sqft, image } = opts;
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    url,
    name,
    description,
    image,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Calgary",
      addressRegion: "Alberta",
      addressCountry: "Canada",
    },
    geo: lat != null && lng != null ? { "@type": "GeoCoordinates", latitude: lat, longitude: lng } : undefined,
    numberOfRooms: beds,
    numberOfBathroomsTotal: baths,
    floorSize: sqft != null ? { "@type": "QuantitativeValue", unitText: "FTK", value: sqft } : undefined,
    offers: price
      ? { "@type": "Offer", price: String(price), priceCurrency: "CAD", availability: "https://schema.org/InStock" }
      : undefined,
  };
}
