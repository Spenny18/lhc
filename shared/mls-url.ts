export type MlsSlugSource = {
  id: string;
  mlsNumber: string;
  fullAddress: string;
  subdivision?: string | null;
  neighbourhood?: string | null;
  city: string;
};

export function slugifyMlsPart(value: string | null | undefined): string {
  return (value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}

export function mlsBaseSlug(listing: MlsSlugSource): string {
  const address = listing.fullAddress.split(",")[0]?.trim() || listing.fullAddress;
  return [address, listing.subdivision || listing.neighbourhood || "property", listing.city]
    .map(slugifyMlsPart).filter(Boolean).join("-");
}

export function assignMlsSeoSlugs<T extends MlsSlugSource>(listings: T[]): Map<string, string> {
  const groups = new Map<string, T[]>();
  for (const listing of listings) {
    const base = mlsBaseSlug(listing) || slugifyMlsPart(listing.mlsNumber) || listing.id;
    groups.set(base, [...(groups.get(base) ?? []), listing]);
  }
  const result = new Map<string, string>();
  groups.forEach((group, base) => {
    for (const listing of group) {
      result.set(listing.id, group.length === 1 ? base : `${base}-${slugifyMlsPart(listing.mlsNumber || listing.id)}`);
    }
  });
  return result;
}

export function mlsPropertyPath(listing: MlsSlugSource & { seoSlug?: string }): string {
  return `/mls/${listing.seoSlug || mlsBaseSlug(listing)}`;
}
