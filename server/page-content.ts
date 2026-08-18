/**
 * Server-side accessor for CMS page content (the /admin/home page builder).
 *
 * The `pages` table may be empty — on a fresh database, or before Spencer
 * has ever opened the CMS — so every read falls back to the factory page in
 * shared/home-content.ts. That keeps the homepage rendering exactly what it
 * rendered before the CMS existed, with no seeding step required.
 *
 * Everything read out of the DB goes through normalizeBlocks/normalizeSeo,
 * which fills missing fields from the block-type defaults and drops unknown
 * ones. A hand-edited or half-migrated row therefore can't reach the public
 * renderer in a shape it doesn't expect.
 */
import { storage } from "./storage";
import {
  defaultHomePage,
  normalizeBlocks,
  normalizeSeo,
  type PageBlock,
  type PageContent,
  type PageSeo,
} from "@shared/home-content";

export const CMS_PAGES: Record<string, { name: string; path: string }> = {
  home: { name: "Home page", path: "/" },
};

export function isCmsPage(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(CMS_PAGES, slug);
}

function factory(slug: string): PageContent {
  const page = defaultHomePage();
  return { ...page, slug, name: CMS_PAGES[slug]?.name ?? slug };
}

/** Full page content including disabled blocks — the CMS view. */
export function getPageContent(slug: string): PageContent {
  const row = storage.getPage(slug);
  if (!row) return factory(slug);

  let parsed: unknown = [];
  try {
    parsed = JSON.parse(row.blocks || "[]");
  } catch {
    parsed = [];
  }
  const blocks = Array.isArray(parsed) && parsed.length > 0
    ? normalizeBlocks(parsed)
    : factory(slug).blocks;

  const defaults = factory(slug).seo;
  const seo = normalizeSeo({
    title: row.seoTitle || defaults.title,
    description: row.seoDescription || defaults.description,
    keywords: row.seoKeywords,
    ogImage: row.ogImage,
    canonical: row.canonical,
    noindex: row.noindex,
  });

  return {
    slug: row.slug,
    name: row.name || CMS_PAGES[slug]?.name || slug,
    seo,
    blocks,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
  };
}

/** What the public site renders — enabled blocks only. */
export function getPublicPageContent(slug: string): PageContent {
  const page = getPageContent(slug);
  return { ...page, blocks: page.blocks.filter((b) => b.enabled) };
}

export interface SavePageInput {
  seo?: Partial<PageSeo>;
  blocks?: PageBlock[];
  name?: string;
  updatedBy?: string | null;
  /** Snapshot the current state into page_revisions first. Default true. */
  snapshot?: boolean;
  revisionLabel?: string;
}

export function savePageContent(slug: string, input: SavePageInput): PageContent {
  const current = getPageContent(slug);

  if (input.snapshot !== false) {
    try {
      storage.createPageRevision({
        pageSlug: slug,
        snapshot: JSON.stringify({ seo: current.seo, blocks: current.blocks }),
        label: input.revisionLabel ?? null,
        createdBy: input.updatedBy ?? null,
      });
    } catch (err) {
      // A failed snapshot must never block the save itself.
      console.error("[cms] revision snapshot failed:", err);
    }
  }

  const seo = normalizeSeo({ ...current.seo, ...(input.seo ?? {}) });
  const blocks = input.blocks ? normalizeBlocks(input.blocks) : current.blocks;

  storage.upsertPage({
    slug,
    name: input.name ?? current.name,
    seoTitle: seo.title,
    seoDescription: seo.description,
    seoKeywords: seo.keywords,
    ogImage: seo.ogImage,
    canonical: seo.canonical,
    noindex: seo.noindex,
    blocks: JSON.stringify(blocks),
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy ?? null,
  });

  return getPageContent(slug);
}

/** Restore the factory page, keeping a snapshot of what was replaced. */
export function resetPageContent(slug: string, updatedBy?: string | null): PageContent {
  const fresh = factory(slug);
  return savePageContent(slug, {
    seo: fresh.seo,
    blocks: fresh.blocks,
    name: fresh.name,
    updatedBy,
    revisionLabel: "Before reset to defaults",
  });
}
