// Shared number / price helpers used across the public site.

export function formatPrice(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return "Price on request";
  return `$${Math.round(Number(n)).toLocaleString("en-CA")}`;
}

export function formatPriceCompact(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return "—";
  const x = Number(n);
  if (x >= 1_000_000) {
    const m = x / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(1) : m.toFixed(2)}M`;
  }
  if (x >= 1_000) return `$${Math.round(x / 1000)}K`;
  return `$${x}`;
}

export function formatSqft(n: number | null | undefined): string {
  if (!n) return "—";
  return `${Number(n).toLocaleString("en-CA")} sqft`;
}

export function formatBedsBaths(beds: number, baths: number): string {
  const b1 = `${beds} bed${beds === 1 ? "" : "s"}`;
  const b2 = `${baths} bath${baths === 1 ? "" : "s"}`;
  return `${b1} · ${b2}`;
}

export function timeAgoShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const SPENCER_PHONE = "+1 (403) 966-9237";
export const SPENCER_PHONE_HREF = "tel:+14039669237";
export const SPENCER_EMAIL = "spencer@riversrealestate.ca";
export const SPENCER_EMAIL_HREF = "mailto:spencer@riversrealestate.ca";
