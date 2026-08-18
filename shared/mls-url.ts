export type MlsSlugSource = {
  id: string;
  mlsNumber: string;
  fullAddress: string;
  subdivision?: string | null;
  neighbourhood?: string | null;
  city: string;
  status?: string | null;
  syncedAt?: string | null;
};

export function slugifyMlsPart(value: string | null | undefined): string {
  return (value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}

export function mlsBaseSlug(listing: MlsSlugSource): string {
  const parts = listing.fullAddress.split(",").map((part) => part.trim()).filter(Boolean);
  const first = parts[0] || listing.fullAddress;
  const second = parts[1] || "";
  // Pillar 9 formats apartments as "1405, 1010 6 Street SW, Calgary...".
  // Put the civic street address first and the unit second so condo URLs read
  // naturally and consistently: 1010-6-street-sw-1405-beltline-calgary.
  const commaUnit = first.match(/^(?:#|unit\s*)?(\d+[a-z]?)$/i);
  const inlineUnit = first.match(/^#(\d+[a-z]?)\s+(\d+\s+.+)$/i);
  const address = commaUnit && /^\d+\s+/.test(second)
    ? `${second} ${commaUnit[1]}`
    : inlineUnit
      ? `${inlineUnit[2]} ${inlineUnit[1]}`
      : first;
  return [address, listing.subdivision || listing.neighbourhood || "property", listing.city]
    .map(slugifyMlsPart).filter(Boolean).join("-");
}

// Slug format shipped before unit numbers were moved behind the street. Kept
// solely so old indexed/shared URLs can 301 to the new canonical format.
export function mlsLegacyBaseSlug(listing: MlsSlugSource): string {
  const address = listing.fullAddress.split(",")[0]?.trim() || listing.fullAddress;
  return [address, listing.subdivision || listing.neighbourhood || "property", listing.city]
    .map(slugifyMlsPart).filter(Boolean).join("-");
}

function assignSlugs<T extends MlsSlugSource>(
  listings: T[],
  baseFor: (listing: T) => string,
  collisionMode: "preferred-clean" | "all-suffixed",
): Map<string, string> {
  const groups = new Map<string, T[]>();
  for (const listing of listings) {
    const base = baseFor(listing) || slugifyMlsPart(listing.mlsNumber) || listing.id;
    groups.set(base, [...(groups.get(base) ?? []), listing]);
  }
  const result = new Map<string, string>();
  groups.forEach((group, base) => {
    if (group.length === 1) {
      result.set(group[0].id, base);
      return;
    }
    const ordered = [...group].sort((a, b) => {
      const active = Number((b.status ?? "").toLowerCase() === "active")
        - Number((a.status ?? "").toLowerCase() === "active");
      if (active !== 0) return active;
      const freshness = String(b.syncedAt ?? "").localeCompare(String(a.syncedAt ?? ""));
      return freshness || String(b.mlsNumber).localeCompare(String(a.mlsNumber));
    });
    for (const [index, listing] of ordered.entries()) {
      const getsCleanSlug = collisionMode === "preferred-clean" && index === 0;
      result.set(
        listing.id,
        getsCleanSlug ? base : `${base}-${slugifyMlsPart(listing.mlsNumber || listing.id)}`,
      );
    }
  });
  return result;
}

export function assignMlsSeoSlugs<T extends MlsSlugSource>(listings: T[]): Map<string, string> {
  return assignSlugs(listings, mlsBaseSlug, "preferred-clean");
}

export function assignMlsLegacySeoSlugs<T extends MlsSlugSource>(listings: T[]): Map<string, string> {
  return assignSlugs(listings, mlsLegacyBaseSlug, "all-suffixed");
}

// Transitional format deployed briefly with street-first apartment addresses
// but an MLS suffix on every colliding record.
export function assignMlsPreviousSeoSlugs<T extends MlsSlugSource>(listings: T[]): Map<string, string> {
  return assignSlugs(listings, mlsBaseSlug, "all-suffixed");
}

export function mlsPropertyPath(listing: MlsSlugSource & { seoSlug?: string }): string {
  // A server-issued slug is authoritative. If a compact API response ever
  // omits it, use the stable MLS id so the server can 301 to the canonical URL
  // instead of inventing a partial address slug from missing fields.
  return `/mls/${listing.seoSlug || listing.id}`;
}
