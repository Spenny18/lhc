// Fetches neighbourhood boundary polygons from OpenStreetMap Nominatim and
// caches them in the neighbourhoods table.
//
// Strategy: lazy fetch on first detail-page request, then never again unless
// we explicitly clear the cache. Nominatim caps usage at ~1 req/sec and asks
// for a real User-Agent — both honored here.
//
// The cached value is the raw GeoJSON `geometry` object (Polygon or
// MultiPolygon). NULL in the column means "never fetched"; the string `""`
// means "fetched but no match" so we don't keep re-hitting Nominatim for
// neighbourhoods OSM doesn't know.
import { sql } from "drizzle-orm";
import { db } from "./storage";

type Geometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

interface NominatimFeature {
  geometry?: Geometry;
  properties?: { display_name?: string };
}

interface NominatimResponse {
  features?: NominatimFeature[];
}

const USER_AGENT =
  "RiversRealEstate/1.0 (https://riversrealestate.ca; spencer@riversrealestate.ca)";

// Single-flight in-process queue so multiple concurrent requests don't all
// race to hit Nominatim at the same moment. Also enforces the 1-req/sec
// politeness cap.
let lastFetchAt = 0;
const inflight = new Map<string, Promise<Geometry | null>>();

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastFetchAt;
  if (elapsed < 1100) {
    await new Promise((r) => setTimeout(r, 1100 - elapsed));
  }
  lastFetchAt = Date.now();
}

// Reject any polygon whose centroid is more than this far from the stored
// community centre. Guards against ambiguous names (e.g. "Harmony") resolving
// to the wrong place. Correct OSM boundaries centre within ~3 km of their pin
// (upper-mount-royal 0.5, aspen-woods 1.3, mahogany 2.7); a wrong match sits
// well beyond. Rejected → the map falls back to the accurate centre pin.
const MAX_POLYGON_DISTANCE_KM = 5;

function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const r = Math.PI / 180;
  const dLat = (bLat - aLat) * r;
  const dLng = (bLng - aLng) * r;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Rough centroid: mean of every [lng, lat] vertex. Good enough to sanity-check
// that a polygon sits near its community centre.
function geomCentroid(geom: Geometry): [number, number] | null {
  const pts: number[][] = [];
  const walk = (a: any): void => {
    if (typeof a[0] === "number") pts.push(a as number[]);
    else for (const c of a) walk(c);
  };
  walk(geom.coordinates);
  if (!pts.length) return null;
  let sx = 0;
  let sy = 0;
  for (const [lng, lat] of pts) {
    sx += lng;
    sy += lat;
  }
  return [sy / pts.length, sx / pts.length]; // [lat, lng]
}

// True if the polygon sits near the community's stored centre.
function polygonNearCentre(
  geom: Geometry,
  centerLat: number,
  centerLng: number,
): boolean {
  const c = geomCentroid(geom);
  if (!c) return false;
  return (
    haversineKm(c[0], c[1], centerLat, centerLng) <= MAX_POLYGON_DISTANCE_KM
  );
}

async function fetchFromNominatim(
  name: string,
  centerLat: number,
  centerLng: number,
): Promise<Geometry | null> {
  // Don't pin to "Calgary" — many communities are in Rocky View County,
  // Foothills, Airdrie, Canmore, etc. The viewbox below is what actually
  // disambiguates.
  const query = `${name}, Alberta, Canada`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "geojson");
  url.searchParams.set("polygon_geojson", "1");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ca");
  // Bias results to a box around the community's known centre so ambiguous
  // names resolve locally (e.g. the Harmony in Springbank, not a Harmony
  // street downtown). ~0.2° ≈ 15-22 km each way.
  const d = 0.2;
  url.searchParams.set(
    "viewbox",
    `${centerLng - d},${centerLat - d},${centerLng + d},${centerLat + d}`,
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    await rateLimit();
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-CA,en",
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(
        `[polygons] nominatim ${res.status} for "${query}": ${res.statusText}`,
      );
      return null;
    }
    const body = (await res.json()) as NominatimResponse;
    const geom = body?.features?.[0]?.geometry;
    if (!geom) return null;
    if (geom.type !== "Polygon" && geom.type !== "MultiPolygon") return null;
    return geom;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.warn(`[polygons] nominatim timeout for "${query}"`);
    } else {
      console.warn(`[polygons] nominatim error for "${query}":`, err?.message);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

interface CachedRow {
  polygon: string | null;
  polygon_fetched_at: string | null;
}

function readCache(slug: string): CachedRow | null {
  try {
    const row = db
      .all(
        sql`SELECT polygon, polygon_fetched_at FROM neighbourhoods WHERE slug = ${slug} LIMIT 1`,
      )
      .at(0) as CachedRow | undefined;
    return row ?? null;
  } catch {
    return null;
  }
}

function writeCache(slug: string, geom: Geometry | null): void {
  const value = geom ? JSON.stringify(geom) : "";
  const now = new Date().toISOString();
  try {
    db.run(
      sql`UPDATE neighbourhoods SET polygon = ${value}, polygon_fetched_at = ${now} WHERE slug = ${slug}`,
    );
  } catch (err) {
    console.warn(`[polygons] failed to cache for ${slug}:`, err);
  }
}

/**
 * Returns the GeoJSON polygon for a neighbourhood, fetching from Nominatim
 * on first call and caching the result. Returns null if OSM has no match
 * (cached as empty string so we don't refetch).
 */
export async function getNeighbourhoodPolygon(
  slug: string,
  name: string,
  centerLat: number,
  centerLng: number,
): Promise<Geometry | null> {
  const cached = readCache(slug);
  if (cached?.polygon !== null && cached?.polygon !== undefined) {
    // Already fetched. Empty string means "no match" — return null without
    // re-hitting Nominatim.
    if (cached.polygon === "") return null;
    try {
      const geom = JSON.parse(cached.polygon) as Geometry;
      // Validate on read so a previously-cached wrong polygon (e.g. Harmony
      // matched to a downtown feature) self-heals: fall through to refetch.
      if (polygonNearCentre(geom, centerLat, centerLng)) return geom;
      console.warn(
        `[polygons] cached polygon for ${slug} is off-centre — refetching`,
      );
    } catch {
      // Corrupt cache row — fall through to refetch.
    }
  }

  // Coalesce concurrent first-fetches for the same slug.
  const existing = inflight.get(slug);
  if (existing) return existing;

  const promise = (async () => {
    const geom = await fetchFromNominatim(name, centerLat, centerLng);
    // Only trust a polygon that sits near the community centre; otherwise cache
    // "no match" so the map falls back to the centre pin + zoom.
    const valid = geom && polygonNearCentre(geom, centerLat, centerLng);
    writeCache(slug, valid ? geom : null);
    return valid ? geom : null;
  })().finally(() => {
    inflight.delete(slug);
  });

  inflight.set(slug, promise);
  return promise;
}
