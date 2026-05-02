import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "node:http";
import session from "express-session";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { storage, stripUser } from "./storage";
import { seedDatabase } from "./seed";
import { signUpSchema, signInSchema, inquirySchema } from "@shared/schema";
import { runSync } from "./rets-sync";
import { fetchListingPhoto } from "./rets-photos";

const execFileAsync = promisify(execFile);

function parseJsonArr(s: string | null | undefined): any[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Parse a Calgary street address like "1188 3 Street SE, Calgary, AB T2G 1H8"
// into {number: "1188", name: "3 Street SE"}. Returns null if it can't find a
// leading numeric street number. Used by the condo endpoint to match listings
// by Pillar 9's separate StreetNumber + StreetName columns.
function parseStreetAddress(full: string): { number: string; name: string } | null {
  if (!full) return null;
  const firstChunk = full.split(",")[0].trim();
  const m = firstChunk.match(/^(\d+)\s+(.+)$/);
  if (!m) return null;
  return { number: m[1], name: m[2].trim() };
}

// ---------- POI helper (shared by /api/mls/:id/pois + /api/condo/:slug/pois) ----------
// Fetches schools / restaurants / parks / transit / shops within `radius`
// metres of a point via Overpass. Caches the JSON in pois_cache for 24h. The
// helper returns the same shape the routes already used so the consumers can
// pass the result straight through after wrapping with center/radius/cached.
type PoiBucket = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  kind: string;
  cuisine?: string | null;
  shop?: string;
  tags?: any;
};
type PoiResultPayload = {
  schools: PoiBucket[];
  restaurants: PoiBucket[];
  parks: PoiBucket[];
  transit: PoiBucket[];
};
type FetchPoisResult =
  | { ok: true; payload: PoiResultPayload; cached: boolean }
  | { ok: false; error: string; lastStatus: number | null };

async function fetchPoisForPoint(
  lat: number,
  lng: number,
  radius = 1000,
): Promise<FetchPoisResult> {
  const cacheId = `${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}`;
  const cached = storage.getPoisCacheById(cacheId);
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  if (cached && new Date(cached.fetchedAt).getTime() > dayAgo) {
    try {
      const payload = JSON.parse(cached.payload) as PoiResultPayload;
      return { ok: true, payload, cached: true };
    } catch {
      // fall through and re-fetch
    }
  }

  const ql = `[out:json][timeout:20];
(
  node[amenity~"^(school|college|university|kindergarten)$"](around:${radius},${lat},${lng});
  way[amenity~"^(school|college|university|kindergarten)$"](around:${radius},${lat},${lng});
  node[amenity~"^(restaurant|cafe|fast_food|pub|bar|bistro)$"](around:${radius},${lat},${lng});
  node["leisure"~"^(park|playground|garden|nature_reserve|pitch|sports_centre|fitness_centre)$"](around:${radius},${lat},${lng});
  way["leisure"~"^(park|playground|garden|nature_reserve|pitch|sports_centre|fitness_centre)$"](around:${radius},${lat},${lng});
  node["public_transport"~"^(station|stop_position|platform)$"](around:${radius},${lat},${lng});
  node["highway"="bus_stop"](around:${radius},${lat},${lng});
  node["railway"~"^(station|halt|tram_stop)$"](around:${radius},${lat},${lng});
  node["shop"~"^(supermarket|mall|convenience|department_store|bakery|deli|greengrocer)$"](around:${radius},${lat},${lng});
);
out center tags;`;
  const OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.fr/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];
  let overpassData: any = null;
  let lastStatus: number | null = null;
  let lastError: string | null = null;
  for (const url of OVERPASS_MIRRORS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json,text/plain,*/*",
          "User-Agent": "RiversRealEstate/1.0 (https://luxuryhomescalgary.ca)",
        },
        body: "data=" + encodeURIComponent(ql),
      });
      if (!response.ok) {
        lastStatus = response.status;
        lastError = `${url} -> ${response.status}`;
        console.warn("[pois] mirror failed:", lastError);
        continue;
      }
      overpassData = await response.json();
      if (overpassData) break;
    } catch (e: any) {
      lastError = `${url} -> ${e?.message ?? "fetch failed"}`;
      console.warn("[pois] mirror error:", lastError);
    }
  }
  if (!overpassData) {
    return {
      ok: false,
      error: `Overpass mirrors unavailable (last status ${lastStatus ?? "n/a"})`,
      lastStatus,
    };
  }

  const elements: any[] = overpassData.elements ?? [];
  const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sa =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(sa));
  };

  const schools: PoiBucket[] = [];
  const restaurants: PoiBucket[] = [];
  const parks: PoiBucket[] = [];
  const transit: PoiBucket[] = [];
  for (const el of elements) {
    const elat = el.lat ?? el.center?.lat;
    const elng = el.lon ?? el.center?.lon;
    if (elat == null || elng == null) continue;
    const tags = el.tags ?? {};
    const name = tags.name ?? tags["name:en"] ?? null;
    if (!name) continue;
    const dist = Math.round(haversine({ lat, lng }, { lat: elat, lng: elng }));
    const base: PoiBucket = {
      id: `${el.type}/${el.id}`,
      name,
      lat: elat,
      lng: elng,
      distance: dist,
      kind: "",
      tags,
    };
    if (tags.amenity && ["school", "college", "university", "kindergarten"].includes(tags.amenity)) {
      schools.push({ ...base, kind: tags.amenity });
    } else if (
      tags.amenity &&
      ["restaurant", "cafe", "fast_food", "pub", "bar", "bistro"].includes(tags.amenity)
    ) {
      restaurants.push({ ...base, kind: tags.amenity, cuisine: tags.cuisine ?? null });
    } else if (tags.leisure) {
      parks.push({ ...base, kind: tags.leisure });
    } else if (tags.public_transport || tags.railway || tags.highway === "bus_stop") {
      let kind = "transit";
      if (tags.railway === "station" || tags.railway === "tram_stop") kind = "train";
      else if (tags.highway === "bus_stop") kind = "bus";
      transit.push({ ...base, kind });
    } else if (tags.shop) {
      transit.push({ ...base, kind: "shop", shop: tags.shop });
    }
  }
  const sortByDist = (arr: PoiBucket[]) =>
    arr.sort((a, b) => a.distance - b.distance).slice(0, 25);
  const payload: PoiResultPayload = {
    schools: sortByDist(schools),
    restaurants: sortByDist(restaurants),
    parks: sortByDist(parks),
    transit: sortByDist(transit),
  };
  storage.upsertPoisCache({
    id: cacheId,
    lat,
    lng,
    radius,
    payload: JSON.stringify(payload),
  });
  return { ok: true, payload, cached: false };
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// Bearer-token store (used because the deploy proxy strips Set-Cookie headers,
// so the iframe-hosted app cannot use real cookie sessions). Tokens live in
// memory and clear on server restart — acceptable for a single-tenant demo app.
const bearerTokens = new Map<string, { userId: number; createdAt: number }>();
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function issueToken(userId: number): string {
  const token = randomBytes(24).toString("base64url");
  bearerTokens.set(token, { userId, createdAt: Date.now() });
  return token;
}

function resolveUserId(req: Request): number | null {
  // Prefer Authorization: Bearer <token>
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const entry = bearerTokens.get(token);
    if (entry && Date.now() - entry.createdAt < TOKEN_TTL_MS) {
      return entry.userId;
    }
  }
  // Fall back to session cookie (works in dev / direct origin)
  if (req.session?.userId) return req.session.userId;
  return null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  (req as any).authUserId = userId;
  next();
}

// Tiny in-memory rate limiter. Tracks request counts per IP per route.
// Sufficient for a single-instance deploy; resets on restart.
function rateLimit(opts: { windowMs: number; max: number; key: string }) {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";
    const key = `${opts.key}:${ip}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }
    if (bucket.count >= opts.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again shortly." });
    }
    bucket.count += 1;
    next();
  };
}

const signInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  key: "signin",
});
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  key: "inquiry",
});

async function sendInquiryEmail(opts: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  listingTitle?: string;
  listingAddress?: string;
}) {
  const subject = opts.listingTitle
    ? `New inquiry — ${opts.listingTitle}`
    : `New inquiry from ${opts.name}`;

  const body = [
    `New inquiry received via luxuryhomescalgary.ca`,
    ``,
    `Property: ${opts.listingTitle ?? "(general inquiry)"}`,
    opts.listingAddress ? `Address: ${opts.listingAddress}` : "",
    ``,
    `From: ${opts.name}`,
    `Email: ${opts.email}`,
    opts.phone ? `Phone: ${opts.phone}` : "",
    ``,
    `Message:`,
    opts.message,
    ``,
    `—`,
    `Sent automatically from luxuryhomescalgary.ca`,
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    source_id: "gcal",
    tool_name: "send_email",
    arguments: {
      action: {
        action: "send",
        to: ["spencer@riversrealestate.ca"],
        cc: [],
        bcc: [],
        subject,
        body,
      },
    },
  };

  try {
    const { stdout } = await execFileAsync("external-tool", [
      "call",
      JSON.stringify(payload),
    ], { timeout: 20_000 });
    return { ok: true, response: stdout };
  } catch (err: any) {
    console.error("[inquiry email] failed:", err?.stderr || err?.message || err);
    return { ok: false, error: String(err?.stderr || err?.message || err) };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Seed on startup (idempotent)
  try {
    seedDatabase();
  } catch (e) {
    console.error("[seed] failed:", e);
  }

  // ---------- SEO MIGRATION: 301 REDIRECTS ----------
  // Old WordPress URL patterns from luxuryhomescalgary.ca → new SPA routes.
  // Critical for preserving search rankings when the domain is pointed at
  // this app. Each redirect uses 301 (permanent) so Google passes link
  // equity. Express 5 uses path-to-regexp v8 — plain regex routes can crash
  // route registration, so we use string params instead.
  const slugify = (s: string) =>
    s.toLowerCase().replace(/-condos-calgary$/i, "").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  app.get("/calgary-condos/:slug", (req, res) => {
    const slug = slugify(req.params.slug);
    res.redirect(301, `/#/condos/${slug}`);
  });
  app.get("/calgary-condos", (_req, res) => res.redirect(301, "/#/condos"));
  app.get("/calgary-neighbourhoods/:slug", (req, res) => {
    const slug = slugify(req.params.slug.replace(/-calgary$/i, ""));
    res.redirect(301, `/#/neighbourhoods/${slug}`);
  });
  app.get("/calgary-neighbourhoods", (_req, res) => res.redirect(301, "/#/neighbourhoods"));
  app.get("/neighborhoods", (_req, res) => res.redirect(301, "/#/neighbourhoods"));
  app.get("/listings", (_req, res) => res.redirect(301, "/#/mls"));
  app.get("/search", (_req, res) => res.redirect(301, "/#/mls"));
  app.get("/home-search", (_req, res) => res.redirect(301, "/#/mls"));

  // ---------- SEO: XML SITEMAP ----------
  // Lists every public URL Google should index — homepage, MLS search, all
  // marquee neighbourhood + condo pages, all active MLS listing details.
  app.get("/sitemap.xml", (_req, res) => {
    const origin = process.env.PUBLIC_ORIGIN || "https://luxuryhomescalgary.ca";
    const now = new Date().toISOString();
    const urls: Array<{ loc: string; priority: string; changefreq: string }> = [
      { loc: `${origin}/`, priority: "1.0", changefreq: "daily" },
      { loc: `${origin}/#/mls`, priority: "0.9", changefreq: "hourly" },
      { loc: `${origin}/#/neighbourhoods`, priority: "0.9", changefreq: "weekly" },
      { loc: `${origin}/#/condos`, priority: "0.9", changefreq: "weekly" },
      { loc: `${origin}/#/about`, priority: "0.5", changefreq: "monthly" },
      { loc: `${origin}/#/contact`, priority: "0.5", changefreq: "monthly" },
      { loc: `${origin}/#/blog`, priority: "0.7", changefreq: "weekly" },
    ];
    try {
      for (const n of storage.listNeighbourhoods()) {
        urls.push({ loc: `${origin}/#/neighbourhoods/${n.slug}`, priority: "0.8", changefreq: "weekly" });
      }
    } catch (e) { console.error("[sitemap] neighbourhoods:", e); }
    try {
      for (const c of storage.listCondoBuildings()) {
        urls.push({ loc: `${origin}/#/condos/${c.slug}`, priority: "0.8", changefreq: "weekly" });
      }
    } catch (e) { console.error("[sitemap] condos:", e); }
    try {
      // Cap MLS listing count at 5000 to keep the sitemap under Google's 50k/50MB limits.
      const listings = storage.searchMlsListings({ limit: 5000 } as any);
      const items = (listings as any).items ?? [];
      for (const l of items) {
        urls.push({ loc: `${origin}/#/mls/${l.id}`, priority: "0.6", changefreq: "daily" });
      }
    } catch (e) { console.error("[sitemap] mls:", e); }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (u) =>
            `  <url><loc>${u.loc}</loc><lastmod>${now}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
        )
        .join("\n") +
      `\n</urlset>\n`;
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  });

  // ---------- SEO: robots.txt ----------
  app.get("/robots.txt", (_req, res) => {
    const origin = process.env.PUBLIC_ORIGIN || "https://luxuryhomescalgary.ca";
    res.set("Content-Type", "text/plain");
    res.send(
      `User-agent: *\n` +
        `Allow: /\n` +
        `Disallow: /admin\n` +
        `Disallow: /api/\n` +
        `\n` +
        `Sitemap: ${origin}/sitemap.xml\n`,
    );
  });

  // Sessions — cookie-based, no localStorage needed.
  // The deployed site is loaded inside an iframe and the API is proxied
  // through a different origin, so cookies must be SameSite=None+Secure to
  // be accepted in that third-party context. In dev we use lax+insecure.
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) app.set("trust proxy", 1);

  // Resolve session secret. In production we REFUSE to start without one
  // so a forgeable hardcoded fallback can't ship to a live URL.
  let sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    if (isProd) {
      // Generate a random per-process secret. Sessions reset on restart,
      // but they cannot be forged.
      sessionSecret = randomBytes(48).toString("base64url");
      console.warn(
        "[auth] SESSION_SECRET not set \u2014 using ephemeral random secret. Sessions reset on restart.",
      );
    } else {
      sessionSecret = "rivers-dev-only-secret";
    }
  }

  app.use(
    session({
      // Published *.pplx.app sites strip any cookie whose name doesn't
      // start with __Host-. Use that prefix in production so the session
      // cookie survives the proxy.
      name: isProd ? "__Host-rivers-sid" : "rivers.sid",
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  // ---------- AUTH ----------
  // This is a single-tenant back-office for Spencer Rivers. Public sign-up
  // is disabled — the seed user is the only legitimate account. Returning
  // 404 hides the endpoint entirely from probing.
  app.post("/api/auth/sign-up", async (_req, res) => {
    return res.status(404).json({ message: "Not found" });
  });

  app.post("/api/auth/sign-in", signInLimiter, async (req, res) => {
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const user = storage.getUserByEmail(parsed.data.email);
    if (!user || !bcrypt.compareSync(parsed.data.password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    req.session.userId = user.id;
    const token = issueToken(user.id);
    res.json({ user: stripUser(user), token });
  });

  app.post("/api/auth/sign-out", (req, res) => {
    // Invalidate Bearer token if present
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      bearerTokens.delete(auth.slice(7));
    }
    req.session?.destroy?.(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const userId = resolveUserId(req);
    if (!userId) return res.json({ user: null });
    const user = storage.getUserById(userId);
    if (!user) return res.json({ user: null });
    res.json({ user: stripUser(user) });
  });

  // ---------- LISTINGS ----------
  // Public: list all active listings (used on agent dashboard + public listing page)
  app.get("/api/listings", (_req, res) => {
    res.json(storage.listListings());
  });

  // Public: get listing by slug (public-facing property page)
  app.get("/api/listings/by-slug/:slug", (req, res) => {
    const listing = storage.getListingBySlug(req.params.slug);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    storage.incrementViews(listing.id);
    res.json(listing);
  });

  // Authenticated: get by id (for editing)
  app.get("/api/listings/:id", requireAuth, (req, res) => {
    const listing = storage.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  });

  app.post("/api/listings", requireAuth, (req, res) => {
    const userId = (req as any).authUserId as number;
    try {
      const created = storage.createListing(req.body, userId);
      res.json(created);
    } catch (e: any) {
      res.status(400).json({ message: e.message ?? "Could not create listing" });
    }
  });

  app.patch("/api/listings/:id", requireAuth, (req, res) => {
    const updated = storage.updateListing(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Listing not found" });
    res.json(updated);
  });

  app.delete("/api/listings/:id", requireAuth, (req, res) => {
    const ok = storage.deleteListing(req.params.id);
    res.json({ ok });
  });

  // ---------- LEADS ----------
  // Manual lead creation from /admin/leads UI.
  // PUBLIC: visitor unlock form on listing detail pages. No auth — anyone
  // viewing a listing can submit name + email to unlock photos & details.
  // Creates a Lead with source=listing_unlock so Spencer sees the inbound
  // signal in /admin/leads.
  app.post("/api/public/leads/unlock", (req, res) => {
    const b = req.body ?? {};
    const firstName = (b.firstName || "").toString().trim();
    const lastName = (b.lastName || "").toString().trim();
    const email = (b.email || "").toString().trim();
    if (!firstName) return res.status(400).json({ message: "First name required" });
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email required" });
    }
    const name = lastName ? `${firstName} ${lastName}` : firstName;
    const listingId = typeof b.listingId === "string" ? b.listingId : null;
    const lead = storage.createLead({
      listingId,
      name,
      email,
      phone: null,
      message: listingId ? `Unlocked listing ${listingId}` : "Unlocked listings",
      source: "listing_unlock",
      status: "new",
    });
    res.json({ ok: true, leadId: lead.id });
  });

  app.post("/api/leads", requireAuth, (req, res) => {
    const b = req.body ?? {};
    if (!b.name || typeof b.name !== "string") {
      return res.status(400).json({ message: "Name required" });
    }
    if (!b.email || typeof b.email !== "string") {
      return res.status(400).json({ message: "Email required" });
    }
    const lead = storage.createLead({
      listingId: b.listingId || null,
      name: b.name,
      email: b.email,
      phone: b.phone || null,
      message: b.message || "",
      source: b.source || "manual",
      status: b.status || "new",
    });
    res.json(lead);
  });

  app.get("/api/leads", requireAuth, (_req, res) => {
    res.json(storage.listLeads());
  });

  app.patch("/api/leads/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!req.body.status) return res.status(400).json({ message: "status required" });
    const updated = storage.updateLeadStatus(id, req.body.status);
    if (!updated) return res.status(404).json({ message: "Lead not found" });
    res.json(updated);
  });

  // ---------- MESSAGES ----------
  app.get("/api/leads/:id/messages", requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    res.json(storage.listMessagesByLead(id));
  });

  app.post("/api/leads/:id/messages", requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!req.body.body) return res.status(400).json({ message: "body required" });
    const msg = storage.createMessage({
      leadId: id,
      fromAgent: true,
      body: req.body.body,
    });
    res.json(msg);
  });

  // ---------- LEAD EMAIL ALERTS (alias to saved_searches) ----------
  // Preserved for backward compat. Lead-attached alerts now live in
  // saved_searches with leadId set; these endpoints are thin proxies that
  // map field names (label -> name) and force leadId.
  app.get("/api/leads/:id/alerts", requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const items = storage.listSavedSearchesByLead(id).map((s: any) => ({
      // Legacy shape: id, leadId, label, filters, frequency, instant, active,
      // lastSentAt, lastMatchCount, createdAt — front-end reads these names.
      id: s.id,
      leadId: s.leadId,
      label: s.name,
      filters: (() => { try { return JSON.parse(s.filters); } catch { return {}; } })(),
      frequency: s.frequency ?? "daily",
      instant: !!s.instant,
      active: s.active !== false,
      alertType: s.alertType ?? "listings",
      lastSentAt: s.lastSentAt,
      lastMatchCount: s.lastMatchCount ?? 0,
      createdAt: s.createdAt,
    }));
    res.json(items);
  });

  app.post("/api/leads/:id/alerts", requireAuth, (req, res) => {
    const userId = (req as any).authUserId as number;
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const { label, filters, frequency, instant, active, alertType } = req.body ?? {};
    if (!label || typeof label !== "string") {
      return res.status(400).json({ message: "Label required" });
    }
    const created = storage.createSavedSearch({
      userId,
      leadId: id,
      name: label,
      filters: filters ?? {},
      emailAlerts: true,
      alertType: alertType ?? "listings",
      frequency: frequency ?? "daily",
      instant: instant === true || frequency === "instant",
      active: active !== false,
    } as any);
    res.json({
      id: created.id,
      leadId: (created as any).leadId,
      label: created.name,
      filters: (() => { try { return JSON.parse(created.filters); } catch { return {}; } })(),
      frequency: (created as any).frequency,
      instant: !!(created as any).instant,
      active: (created as any).active !== false,
      alertType: (created as any).alertType ?? "listings",
      createdAt: created.createdAt,
    });
  });

  app.patch("/api/leads/:leadId/alerts/:alertId", requireAuth, (req, res) => {
    const alertId = parseInt(req.params.alertId, 10);
    if (!Number.isFinite(alertId)) return res.status(400).json({ message: "Invalid id" });
    const patch: any = { ...(req.body ?? {}) };
    // Map legacy field name 'label' -> 'name'
    if (patch.label && !patch.name) {
      patch.name = patch.label;
      delete patch.label;
    }
    if (patch.filters && typeof patch.filters !== "string") {
      patch.filters = JSON.stringify(patch.filters);
    }
    if (patch.frequency === "instant") patch.instant = true;
    if (patch.frequency && patch.frequency !== "instant") patch.instant = false;
    const updated = storage.updateSavedSearch(alertId, patch);
    if (!updated) return res.status(404).json({ message: "Alert not found" });
    res.json(updated);
  });

  app.delete("/api/leads/:leadId/alerts/:alertId", requireAuth, (req, res) => {
    const alertId = parseInt(req.params.alertId, 10);
    if (!Number.isFinite(alertId)) return res.status(400).json({ message: "Invalid id" });
    res.json({ ok: storage.deleteSavedSearch(alertId) });
  });

  // Manual fire — emails the alert immediately regardless of frequency cadence.
  app.post("/api/leads/:leadId/alerts/:alertId/send", requireAuth, async (req, res) => {
    const alertId = parseInt(req.params.alertId, 10);
    if (!Number.isFinite(alertId)) return res.status(400).json({ message: "Invalid id" });
    const alert = storage.getSavedSearchById(alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    const { processAlert } = await import("./lead-alert-cron");
    const r = await processAlert(alert as any, { force: true });
    res.json({
      scanned: 1,
      sent: r.status === "sent" ? 1 : 0,
      skipped: r.status === "skipped" ? 1 : 0,
      errors: r.status === "error" ? 1 : 0,
      matches: r.matches ?? 0,
      error: r.error,
    });
  });

  // Manual "Send now" — fires this specific saved-search alert immediately,
  // bypassing the cron's due-check (which excludes instant alerts) and the
  // empty-digest skip. Returns {sent, errors, matches} so the client can
  // surface a useful toast.
  app.post("/api/saved-searches/:id/send", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const alert = storage.getSavedSearchById(id);
    if (!alert) return res.status(404).json({ message: "Saved search not found" });
    const { processAlert } = await import("./lead-alert-cron");
    const r = await processAlert(alert as any, { force: true });
    res.json({
      scanned: 1,
      sent: r.status === "sent" ? 1 : 0,
      skipped: r.status === "skipped" ? 1 : 0,
      errors: r.status === "error" ? 1 : 0,
      matches: r.matches ?? 0,
      error: r.error,
    });
  });

  // GET /api/saved-searches/:id/preview — render the email HTML for this
  // saved search WITHOUT sending. Returns text/html so the admin can pop it
  // open in a new tab. Optional ?mode=json returns metadata + html as JSON.
  app.get("/api/saved-searches/:id/preview", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const { buildAlertPreview } = await import("./lead-alert-cron");
    const preview = buildAlertPreview(id);
    if (!preview) return res.status(404).json({ message: "Saved search not found" });
    if (req.query.mode === "json") {
      return res.json({
        subject: preview.subject,
        recipient: preview.recipient,
        recipientName: preview.recipientName,
        alertType: preview.alertType,
        matches: preview.matches,
        html: preview.html,
      });
    }
    // Default: serve the HTML directly so a new browser tab renders it.
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(preview.html);
  });

  // ---------- MARKET SNAPSHOT ----------
  // GET /api/admin/market-snapshot?<filters>&daysBack=30
  // Returns counts of new / sold / terminated / price-reduction listings
  // matching the filter set over the last `daysBack` days.
  app.get("/api/admin/market-snapshot", requireAuth, (req, res) => {
    const q = req.query;
    const num = (v: any) => (v != null && v !== "" ? Number(v) : undefined);
    const str = (v: any) => (typeof v === "string" && v.length ? v : undefined);
    const filters: any = {
      minPrice: num(q.minPrice),
      maxPrice: num(q.maxPrice),
      beds: num(q.beds),
      baths: num(q.baths),
      propertyType: str(q.propertyType),
      neighbourhood: str(q.neighbourhood),
      minSqft: num(q.minSqft),
      maxSqft: num(q.maxSqft),
    };
    const daysBack = num(q.daysBack) ?? 30;
    const snap = storage.marketSnapshot({ filters, daysBack });
    res.json(snap);
  });

  // ---------- GOOGLE CALENDAR INTEGRATION ----------
  app.get("/api/admin/google/status", requireAuth, (req, res) => {
    const userId = (req as any).authUserId as number;
    const integ = storage.getUserIntegration(userId, "google");
    res.json({
      connected: !!(integ && integ.active),
      configured: !!process.env.GOOGLE_OAUTH_CLIENT_ID && !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      accountEmail: integ?.accountEmail ?? null,
      expiresAt: integ?.expiresAt ?? null,
    });
  });

  app.get("/api/admin/google/connect", requireAuth, async (req, res) => {
    const { googleConfigured, buildAuthUrl } = await import("./google-calendar");
    if (!googleConfigured()) {
      return res.status(400).json({
        message: "GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET not set on server",
      });
    }
    const userId = (req as any).authUserId as number;
    // Use userId as state so the callback can map back. In a multi-tenant
    // app this should be a signed nonce, but Spencer is the only user.
    const state = String(userId);
    res.json({ url: buildAuthUrl(state) });
  });

  // Public callback endpoint (Google redirects here). Auth via the `state`
  // param identifying which user initiated the flow.
  app.get("/api/admin/google/callback", async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const error = typeof req.query.error === "string" ? req.query.error : "";
    if (error) {
      return res.redirect(`/#/admin/calendar?google_error=${encodeURIComponent(error)}`);
    }
    if (!code || !state) {
      return res.redirect("/#/admin/calendar?google_error=missing_code_or_state");
    }
    const userId = parseInt(state, 10);
    if (!Number.isFinite(userId)) {
      return res.redirect("/#/admin/calendar?google_error=bad_state");
    }
    try {
      const { exchangeCode, persistTokens } = await import("./google-calendar");
      const tokens = await exchangeCode(code);
      await persistTokens(userId, tokens);
      res.redirect("/#/admin/calendar?google_connected=1");
    } catch (e: any) {
      console.error("[google-cal] callback failed:", e?.message);
      res.redirect(`/#/admin/calendar?google_error=${encodeURIComponent(e?.message ?? "exchange_failed")}`);
    }
  });

  app.post("/api/admin/google/disconnect", requireAuth, (req, res) => {
    const userId = (req as any).authUserId as number;
    res.json({ ok: storage.deleteUserIntegration(userId, "google") });
  });

  // ---------- MAKE.COM SOCIAL WEBHOOK ----------
  // POST /api/admin/social/post — fires the configured Make webhook with the
  // full post payload. Make handles the multi-platform routing.
  app.post("/api/admin/social/post", requireAuth, async (req, res) => {
    const url = process.env.MAKE_SOCIAL_WEBHOOK_URL;
    if (!url) {
      return res
        .status(400)
        .json({ message: "MAKE_SOCIAL_WEBHOOK_URL not set on server" });
    }
    const body = req.body ?? {};
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await r.text();
      if (!r.ok) {
        return res.status(502).json({ message: `Make webhook ${r.status}`, body: text });
      }
      res.json({ ok: true, makeResponse: text.slice(0, 500) });
    } catch (e: any) {
      res.status(500).json({ message: e?.message ?? "fetch failed" });
    }
  });

  // ---------- TOURS ----------
  app.get("/api/tours", requireAuth, (_req, res) => {
    res.json(storage.listTours());
  });

  app.post("/api/tours", requireAuth, async (req, res) => {
    try {
      const tour = storage.createTour(req.body) as any;
      const userId = (req as any).authUserId as number;
      // Mirror to Google Calendar if user has connected.
      try {
        const { syncTourToGoogle } = await import("./google-calendar");
        const listing = tour.listingId ? storage.getListingById(tour.listingId) : undefined;
        const lead = tour.leadId ? storage.getLead(tour.leadId) : undefined;
        const r = await syncTourToGoogle(userId, tour, listing as any, lead as any);
        if (r.ok && r.eventId) {
          storage.updateTourGoogleEventId(tour.id, r.eventId);
          tour.googleEventId = r.eventId;
        }
      } catch (e: any) {
        console.warn("[google-cal] tour sync (create) failed:", e?.message);
      }
      res.json(tour);
    } catch (e: any) {
      res.status(400).json({ message: e.message ?? "Invalid tour data" });
    }
  });

  app.patch("/api/tours/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const status = (req.body ?? {}).status;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Status required" });
    }
    const updated = storage.updateTourStatus(id, status) as any;
    if (!updated) return res.status(404).json({ message: "Tour not found" });
    const userId = (req as any).authUserId as number;
    try {
      const { syncTourToGoogle, deleteTourFromGoogle } = await import("./google-calendar");
      if (status === "cancelled") {
        await deleteTourFromGoogle(userId, updated);
        storage.updateTourGoogleEventId(updated.id, null);
      } else {
        const listing = updated.listingId ? storage.getListingById(updated.listingId) : undefined;
        const lead = updated.leadId ? storage.getLead(updated.leadId) : undefined;
        const r = await syncTourToGoogle(userId, updated, listing as any, lead as any);
        if (r.ok && r.eventId && r.eventId !== updated.googleEventId) {
          storage.updateTourGoogleEventId(updated.id, r.eventId);
        }
      }
    } catch (e: any) {
      console.warn("[google-cal] tour sync (patch) failed:", e?.message);
    }
    res.json(updated);
  });

  // ---------- PUBLIC INQUIRY ----------
  // Creates a lead row + sends Spencer an email via Gmail (gcal connector).
  app.post("/api/inquiry", inquiryLimiter, async (req, res) => {
    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const lead = storage.createLead({
      listingId: parsed.data.listingId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      source: parsed.data.source ?? "Landing page",
      status: "new",
    } as any);

    // Look up listing details for the email
    let listingTitle: string | undefined;
    let listingAddress: string | undefined;
    if (parsed.data.listingId) {
      const l = storage.getListingById(parsed.data.listingId);
      if (l) {
        listingTitle = l.title;
        listingAddress = l.address;
      }
    }

    // Fire-and-forget email; don't block the response on it
    sendInquiryEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      listingTitle,
      listingAddress,
    }).then((r) => {
      if (!r.ok) console.warn("[inquiry] email did not send:", r.error);
    });

    res.json({ ok: true, leadId: lead.id });
  });

  // ---------- PUBLIC MLS / MARKETING API ----------
  // GET /api/public/mls/distinct?field=subdivision|district|city|neighbourhood
  // Returns sorted unique non-empty values currently in the database. Used
  // by the public search to render dynamic checkbox lists for high-cardinality
  // free-text columns (Pillar 9 has hundreds of subdivisions across Alberta).
  app.get("/api/public/mls/distinct", (req, res) => {
    const field = String(req.query.field ?? "");
    const allowed = new Set(["subdivision", "district", "city", "neighbourhood", "structureType", "architecturalStyle"]);
    if (!allowed.has(field)) {
      return res.status(400).json({ message: "Field not allowed" });
    }
    const values = storage.distinctMlsValues(field as any);
    res.json({ field, values });
  });

  // GET /api/public/mls/search — paginated, filterable MLS search
  app.get("/api/public/mls/search", (req, res) => {
    const q = req.query;
    const num = (v: any) => (v != null && v !== "" ? Number(v) : undefined);
    const str = (v: any) => (typeof v === "string" && v.length ? v : undefined);
    const bool = (v: any) => v === "true" || v === "1";
    // Multi-value list — accept either repeated `key=a&key=b` or comma-separated.
    const list = (v: any): string[] | undefined => {
      let arr: string[] = [];
      if (Array.isArray(v)) arr = v.filter((x) => typeof x === "string") as string[];
      else if (typeof v === "string") arr = v.split(",");
      arr = arr.map((s) => s.trim()).filter(Boolean);
      return arr.length ? arr : undefined;
    };
    const result = storage.searchMlsListings({
      q: str(q.q),
      minPrice: num(q.minPrice),
      maxPrice: num(q.maxPrice),
      beds: num(q.beds),
      baths: num(q.baths),
      propertyType: str(q.propertyType),
      propertySubTypes: list(q.propertySubTypes ?? q.propertySubType),
      cities: list(q.cities ?? q.city),
      neighbourhood: str(q.neighbourhood),
      postalCode: str(q.postalCode),
      statuses: list(q.statuses ?? q.status) ?? ["Active"],
      minSqft: num(q.minSqft),
      maxSqft: num(q.maxSqft),
      yearMin: num(q.yearMin),
      yearMax: num(q.yearMax),
      garageMin: num(q.garageMin),
      domMax: num(q.domMax),
      hasPhotos: bool(q.hasPhotos),
      // Boolean toggles
      garageYn: q.garageYn != null ? bool(q.garageYn) : undefined,
      poolYn: q.poolYn != null ? bool(q.poolYn) : undefined,
      waterfrontYn: q.waterfrontYn != null ? bool(q.waterfrontYn) : undefined,
      airConditioned: q.airConditioned != null ? bool(q.airConditioned) : undefined,
      suiteYn: q.suiteYn != null ? bool(q.suiteYn) : undefined,
      legalSuiteYn: q.legalSuiteYn != null ? bool(q.legalSuiteYn) : undefined,
      suiteLocations: list(q.suiteLocations),
      // Multi-value structured filters — match if ANY value appears in the
      // listing's RETS string (so basement=Walkout&basement=Finished returns
      // listings that have either Walkout or Finished in their basement field).
      basements: list(q.basements ?? q.basement),
      basementDevelopments: list(q.basementDevelopments),
      parkingFeatures: list(q.parkingFeatures),
      lotFeatures: list(q.lotFeatures),
      laundryFeatures: list(q.laundryFeatures),
      appliances: list(q.appliances),
      levels: list(q.levels),
      structureTypes: list(q.structureTypes),
      architecturalStyles: list(q.architecturalStyles),
      accessibilityFeatures: list(q.accessibilityFeatures),
      associationAmenities: list(q.associationAmenities),
      views: list(q.views),
      subdivisions: list(q.subdivisions ?? q.subdivision),
      districts: list(q.districts ?? q.district),
      keywords: str(q.keywords),
      condoFeeMax: num(q.condoFeeMax),
      sort: q.sort as any,
      limit: num(q.limit) ?? 24,
      offset: num(q.offset) ?? 0,
    });
    res.json(result);
  });

  // GET /api/public/mls/featured
  app.get("/api/public/mls/featured", (_req, res) => {
    res.json(storage.listFeaturedMls(6));
  });

  // GET /api/admin/rets/object-types — debug endpoint that queries Pillar 9
  // GetMetadata for OBJECT and returns the supported photo type names. Use
  // this to find the right value for RETS_PHOTO_TYPE (e.g. LargePhoto, Photo,
  // Thumbnail, HiRes). Returns the parsed XML so we can see all valid types.
  app.get("/api/admin/rets/object-types", requireAuth, async (_req, res) => {
    try {
      const { RetsClient } = await import("./rets-client");
      const c = new RetsClient({
        loginUrl: process.env.RETS_LOGIN_URL!,
        username: process.env.RETS_USERNAME!,
        password: process.env.RETS_PASSWORD!,
        userAgent: process.env.RETS_USER_AGENT ?? "RiversRealEstate/1.0",
        uaPassword: process.env.RETS_UA_PASSWORD || undefined,
      });
      await c.login();
      const meta = await c.getMetadata({ type: "METADATA-OBJECT", id: "Property" });
      res.json(meta);
    } catch (err: any) {
      res.status(500).json({ message: err?.message ?? "Metadata fetch failed" });
    }
  });

  // GET /api/mls/:id/photo/:idx — proxy real RETS photos through our server
  // so the browser never sees Pillar 9 credentials. Photos are cached for 24h
  // in memory (LRU, max 500 entries). Falls back to 404 → client placeholder.
  app.get("/api/mls/:id/photo/:idx", async (req, res) => {
    const id = req.params.id;
    const idx = parseInt(req.params.idx, 10);
    if (!id || !Number.isFinite(idx) || idx < 0 || idx > 49) {
      return res.status(400).json({ message: "Invalid photo request" });
    }
    // First check the listing exists and has at least idx+1 photos
    const listing = storage.getMlsListingById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if ((listing.photoCount ?? 0) <= idx) {
      return res.status(404).json({ message: "Photo index out of range" });
    }
    try {
      const photo = await fetchListingPhoto(id, idx);
      if (!photo) return res.status(404).json({ message: "Photo not available" });
      res.setHeader("Content-Type", photo.contentType);
      res.setHeader("Cache-Control", "public, max-age=86400, immutable");
      return res.end(photo.body);
    } catch (err: any) {
      console.error("[photo proxy] failure:", err?.message ?? err);
      return res.status(502).json({ message: "Photo backend unavailable" });
    }
  });

  // GET /api/public/mls/:id
  app.get("/api/public/mls/:id", (req, res) => {
    const listing = storage.getMlsListingById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    const safeParse = (s: string | null | undefined): any[] => {
      if (!s) return [];
      try { return JSON.parse(s); } catch { return []; }
    };
    const similar = storage.listSimilarMls(listing, 4);
    res.json({
      ...listing,
      gallery: safeParse(listing.gallery as any),
      features: safeParse(listing.features as any),
      similar,
    });
  });

  // GET /api/public/neighbourhoods (list) — computes activeCount + avgPrice
  // LIVE from the MLS table by matching `subdivision === neighbourhood.name`
  // (case-insensitive). Falls back to GPS proximity only if subdivision
  // returns nothing — covers stale data before the next re-sync.
  app.get("/api/public/neighbourhoods", (_req, res) => {
    const items = storage.listNeighbourhoods().map((n) => {
      let active = storage.listMlsBySubdivision(n.name, 5000);
      if (active.length === 0) {
        // Fallback: tighter 800m radius (was 1500 — even the fallback should
        // err on the side of "this neighbourhood specifically").
        active = storage
          .listMlsNearPoint(n.centerLat, n.centerLng, 800, 5000)
          .filter((m) => m.status === "Active");
      }
      const activeCount = active.length;
      const avgPrice =
        activeCount > 0
          ? Math.round(active.reduce((s, l) => s + (l.listPrice || 0), 0) / activeCount)
          : n.avgPrice;
      return {
        ...n,
        activeCount,
        avgPrice,
        story: parseJsonArr(n.story),
        outsideCopy: parseJsonArr(n.outsideCopy),
        amenitiesCopy: parseJsonArr(n.amenitiesCopy),
        shopDineCopy: parseJsonArr(n.shopDineCopy),
        realEstateCopy: parseJsonArr(n.realEstateCopy),
        lifeCopy: parseJsonArr(n.lifeCopy),
        schools: parseJsonArr(n.schools),
        gallery: parseJsonArr(n.gallery),
        borders: (() => { try { return JSON.parse(n.borders); } catch { return {}; } })(),
      };
    });
    res.json(items);
  });

  // GET /api/public/condos (list)
  app.get("/api/public/condos", (_req, res) => {
    const items = storage.listCondoBuildings().map((c) => ({
      ...c,
      intro: parseJsonArr(c.intro),
      residencesCopy: parseJsonArr(c.residencesCopy),
      architecturalCopy: parseJsonArr(c.architecturalCopy),
      locationCopy: parseJsonArr((c as any).locationCopy),
      diningCopy: parseJsonArr((c as any).diningCopy),
      shoppingCopy: parseJsonArr((c as any).shoppingCopy),
      communityCopy: parseJsonArr((c as any).communityCopy),
      schoolsCopy: parseJsonArr((c as any).schoolsCopy),
      amenities: parseJsonArr(c.amenities),
      gallery: parseJsonArr(c.gallery),
    }));
    res.json(items);
  });

  // GET /api/public/condos/:slug
  app.get("/api/public/condos/:slug", (req, res) => {
    const c = storage.getCondoBuildingBySlug(req.params.slug);
    if (!c) return res.status(404).json({ message: "Condo building not found" });
    // Match by street number + street name. Pillar 9 now syncs StreetNumber
    // and StreetName as separate columns so this is the precise way to find
    // every unit in the building. Address parser handles e.g.
    // "1188 3 Street SE, Calgary, AB T2G 1H8" → number "1188", name "3 Street SE".
    // Some buildings span multiple street numbers (e.g. The River = 135 + 137
    // 26 Ave SW); `addressAliases` is a comma-separated list of additional
    // numbers at the same street name.
    const parsed = parseStreetAddress(c.address);
    let raw: any[] = [];
    if (parsed) {
      const numbers = [parsed.number];
      if ((c as any).addressAliases) {
        for (const alias of String((c as any).addressAliases).split(",")) {
          const n = alias.trim();
          if (n && !numbers.includes(n)) numbers.push(n);
        }
      }
      const seen = new Set<string>();
      for (const num of numbers) {
        const matches = storage.listMlsAtBuilding(num, parsed.name, 60);
        for (const m of matches) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            raw.push(m);
          }
        }
      }
    }
    // Fallbacks for listings synced before StreetNumber/StreetName were
    // populated: GPS first, then address substring.
    if (raw.length === 0) {
      raw = storage.listingsAtBuilding(c.lat, c.lng, 75, 60);
    }
    if (raw.length === 0) {
      const addressKey = c.address.split(",")[0].trim();
      raw = storage.listingsAtAddress(addressKey, 60);
    }
    const listings = raw.map((l) => ({
      id: l.id,
      mlsNumber: l.mlsNumber,
      fullAddress: l.fullAddress,
      listPrice: l.listPrice,
      beds: l.beds,
      baths: l.baths,
      sqft: l.sqft,
      photoCount: l.photoCount,
      heroImage: l.heroImage,
      status: l.status,
      neighbourhood: l.neighbourhood,
      lat: l.lat,
      lng: l.lng,
    }));
    res.json({
      ...c,
      intro: parseJsonArr(c.intro),
      residencesCopy: parseJsonArr(c.residencesCopy),
      architecturalCopy: parseJsonArr(c.architecturalCopy),
      locationCopy: parseJsonArr((c as any).locationCopy),
      diningCopy: parseJsonArr((c as any).diningCopy),
      shoppingCopy: parseJsonArr((c as any).shoppingCopy),
      communityCopy: parseJsonArr((c as any).communityCopy),
      schoolsCopy: parseJsonArr((c as any).schoolsCopy),
      amenities: parseJsonArr(c.amenities),
      gallery: parseJsonArr(c.gallery),
      listings,
    });
  });

  // GET /api/public/neighbourhoods/:slug
  app.get("/api/public/neighbourhoods/:slug", (req, res) => {
    const n = storage.getNeighbourhoodBySlug(req.params.slug);
    if (!n) return res.status(404).json({ message: "Neighbourhood not found" });
    // Match by subdivision name. Falls through to legacy name match → tight
    // 800m GPS as a last resort.
    let activeMatches = storage.listMlsBySubdivision(n.name, 5000);
    if (activeMatches.length === 0) {
      activeMatches = storage.listMlsByNeighbourhood(n.name, 5000) as any;
    }
    if (activeMatches.length === 0) {
      activeMatches = storage
        .listMlsNearPoint(n.centerLat, n.centerLng, 800, 5000)
        .filter((m) => m.status === "Active");
    }
    const listings = activeMatches.slice(0, 24);
    const liveActiveCount = activeMatches.length;
    const liveAvgPrice =
      liveActiveCount > 0
        ? Math.round(activeMatches.reduce((s, l) => s + (l.listPrice || 0), 0) / liveActiveCount)
        : n.avgPrice;
    res.json({
      ...n,
      activeCount: liveActiveCount,
      avgPrice: liveAvgPrice,
      story: parseJsonArr(n.story),
      outsideCopy: parseJsonArr(n.outsideCopy),
      amenitiesCopy: parseJsonArr(n.amenitiesCopy),
      shopDineCopy: parseJsonArr(n.shopDineCopy),
      realEstateCopy: parseJsonArr(n.realEstateCopy),
      lifeCopy: parseJsonArr(n.lifeCopy),
      schools: parseJsonArr(n.schools),
      gallery: parseJsonArr(n.gallery),
      borders: (() => { try { return JSON.parse(n.borders); } catch { return {}; } })(),
      listings,
    });
  });

  // GET /api/public/blog
  app.get("/api/public/blog", (_req, res) => {
    res.json(storage.listBlogPosts());
  });

  // GET /api/public/blog/:slug
  app.get("/api/public/blog/:slug", (req, res) => {
    const post = storage.getBlogBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  // GET /api/public/testimonials
  app.get("/api/public/testimonials", (_req, res) => {
    res.json(storage.listTestimonials());
  });

  // GET /api/public/stats — site stats for the homepage
  app.get("/api/public/stats", (_req, res) => {
    const activeCount = storage.countActiveMlsListings();
    const total = storage.countMlsListings();
    const lastSync = storage.getLatestSyncRun();
    res.json({
      activeListings: activeCount,
      totalListings: total,
      lastSyncAt: lastSync?.finishedAt ?? null,
      lastSyncStatus: lastSync?.status ?? null,
    });
  });

  // GET /api/admin/mls-sync (auth) — recent sync runs for admin sidebar
  app.get("/api/admin/mls-sync", requireAuth, (_req, res) => {
    res.json(storage.listRecentSyncRuns(15));
  });

  // POST /api/admin/mls-sync/run (auth) — manually trigger a sync run
  app.post("/api/admin/mls-sync/run", requireAuth, async (_req, res) => {
    try {
      // Fire-and-forget so the request returns quickly; the table will
      // pick up the new run on its next refetch.
      runSync().catch((err) => {
        console.error("[mls-sync] manual run failed:", err);
      });
      res.json({ ok: true, message: "Sync started" });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message ?? "Sync failed" });
    }
  });

  // POST /api/admin/mls-sync/reset (auth) — drop & recreate mls_listings table
  // (used to recover from "database disk image is malformed" after a publish
  // restored a corrupt SQLite snapshot; sync immediately starts after rebuild).
  app.post("/api/admin/mls-sync/reset", requireAuth, async (_req, res) => {
    try {
      const { db } = await import("./storage");
      const { sql } = await import("drizzle-orm");
      // Drop the corrupt tables
      try { db.run(sql`DROP TABLE IF EXISTS mls_listings`); } catch (e) { console.error("[reset] drop mls_listings:", e); }
      try { db.run(sql`DROP TABLE IF EXISTS mls_sync_runs`); } catch (e) { console.error("[reset] drop mls_sync_runs:", e); }
      // Rebuild the file to recover any corrupt pages left behind
      try { db.run(sql`VACUUM`); console.log("[reset] VACUUM ok"); } catch (e) { console.error("[reset] VACUUM failed:", e); }
      // Recreate fresh schemas (mirror of CREATE TABLE in storage.ts)
      db.run(sql`
        CREATE TABLE IF NOT EXISTS mls_listings (
          id TEXT PRIMARY KEY,
          mls_number TEXT,
          listing_key INTEGER,
          source TEXT,
          status TEXT,
          list_price INTEGER,
          original_price INTEGER,
          beds INTEGER,
          beds_above INTEGER,
          beds_below INTEGER,
          baths REAL,
          half_baths INTEGER,
          sqft INTEGER,
          sqft_below INTEGER,
          year_built INTEGER,
          property_type TEXT,
          property_sub_type TEXT,
          street_number TEXT,
          street_name TEXT,
          street_suffix TEXT,
          street_dir_suffix TEXT,
          unit_number TEXT,
          city TEXT,
          province TEXT,
          postal_code TEXT,
          neighbourhood TEXT,
          full_address TEXT,
          lat REAL,
          lng REAL,
          description TEXT,
          features TEXT,
          gallery TEXT,
          hero_image TEXT,
          photo_count INTEGER,
          lot_size TEXT,
          parking TEXT,
          garage_spaces INTEGER,
          days_on_market INTEGER,
          list_office TEXT,
          list_agent TEXT,
          modification_timestamp TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      db.run(sql`
        CREATE TABLE IF NOT EXISTS mls_sync_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          finished_at TEXT,
          status TEXT,
          source TEXT,
          fetched INTEGER,
          upserted INTEGER,
          removed INTEGER,
          error_message TEXT
        )
      `);
      // Kick off fresh sync
      runSync().catch((err) => {
        console.error("[mls-sync] post-reset run failed:", err);
      });
      res.json({ ok: true, message: "Tables reset; sync started" });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message ?? "Reset failed" });
    }
  });

  // ---------- POIs (Overpass API) ----------
  // GET /api/mls/:id/pois — schools, restaurants, parks, transit within 1km
  // of the listing. Cached 24h via fetchPoisForPoint().
  app.get("/api/mls/:id/pois", async (req, res) => {
    const listing = storage.getMlsListingById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.lat == null || listing.lng == null) {
      return res.json({
        center: { lat: null, lng: null },
        radius: 1000,
        schools: [], restaurants: [], parks: [], transit: [],
        cached: false, message: "No coordinates for listing",
      });
    }
    const lat = Number(listing.lat);
    const lng = Number(listing.lng);
    const radius = 1000;
    try {
      const result = await fetchPoisForPoint(lat, lng, radius);
      if (!result.ok) {
        return res.json({
          center: { lat, lng },
          radius,
          schools: [], restaurants: [], parks: [], transit: [],
          cached: false,
          error: result.error,
        });
      }
      res.json({ ...result.payload, center: { lat, lng }, radius, cached: result.cached });
    } catch (err: any) {
      console.error("[pois] error:", err?.message ?? err);
      res.json({
        center: { lat, lng },
        radius,
        schools: [], restaurants: [], parks: [], transit: [],
        cached: false,
        error: err?.message ?? "Overpass error",
      });
    }
  });

  // GET /api/public/condos/:slug/pois — same shape as /api/mls/:id/pois but
  // centered on the condo building's coordinates instead of a single listing.
  app.get("/api/public/condos/:slug/pois", async (req, res) => {
    const c = storage.getCondoBuildingBySlug(req.params.slug);
    if (!c) return res.status(404).json({ message: "Condo building not found" });
    const lat = Number(c.lat);
    const lng = Number(c.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.json({
        center: { lat: null, lng: null },
        radius: 1000,
        schools: [], restaurants: [], parks: [], transit: [],
        cached: false, message: "No coordinates for building",
      });
    }
    const radius = 1000;
    try {
      const result = await fetchPoisForPoint(lat, lng, radius);
      if (!result.ok) {
        return res.json({
          center: { lat, lng },
          radius,
          schools: [], restaurants: [], parks: [], transit: [],
          cached: false,
          error: result.error,
        });
      }
      res.json({ ...result.payload, center: { lat, lng }, radius, cached: result.cached });
    } catch (err: any) {
      console.error("[pois] condo error:", err?.message ?? err);
      res.json({
        center: { lat, lng },
        radius,
        schools: [], restaurants: [], parks: [], transit: [],
        cached: false,
        error: err?.message ?? "Overpass error",
      });
    }
  });

  // ---------- ROUTING (OSRM) ----------
  // GET /api/route?fromLat=..&fromLng=..&toLat=..&toLng=..&profile=foot|driving|bike
  // Returns { distance (m), duration (s), geometry (GeoJSON LineString) }
  app.get("/api/route", async (req, res) => {
    const fromLat = parseFloat(String(req.query.fromLat ?? ""));
    const fromLng = parseFloat(String(req.query.fromLng ?? ""));
    const toLat = parseFloat(String(req.query.toLat ?? ""));
    const toLng = parseFloat(String(req.query.toLng ?? ""));
    const profile = String(req.query.profile ?? "foot");
    if (![fromLat, fromLng, toLat, toLng].every((x) => Number.isFinite(x))) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }
    if (!["foot", "driving", "bike"].includes(profile)) {
      return res.status(400).json({ message: "Invalid profile" });
    }
    // OSRM uses {lng},{lat} order. Multiple public mirrors fall back if main is rate-limited.
    const OSRM_MIRRORS = [
      "https://router.project-osrm.org",
      "https://routing.openstreetmap.de/routed-foot",
    ];
    // The second mirror only handles foot — only try it for foot profile.
    const mirrors = profile === "foot" ? OSRM_MIRRORS : [OSRM_MIRRORS[0]];
    let lastError: string | null = null;
    for (const base of mirrors) {
      // For routing.openstreetmap.de, the profile is part of the host path.
      // For project-osrm, it's part of the URL path.
      const url = base.includes("routed-foot")
        ? `${base}/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
        : `${base}/route/v1/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      try {
        const r = await fetch(url, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "RiversRealEstate/1.0 (https://luxuryhomescalgary.ca)",
          },
        });
        if (!r.ok) {
          lastError = `${base} -> ${r.status}`;
          console.warn("[route] mirror failed:", lastError);
          continue;
        }
        const data: any = await r.json();
        if (data.code !== "Ok" || !data.routes?.[0]) {
          lastError = `${base} -> code=${data.code}`;
          console.warn("[route] mirror no route:", lastError);
          continue;
        }
        const route = data.routes[0];
        return res.json({
          profile,
          distance: route.distance, // meters
          duration: route.duration, // seconds
          geometry: route.geometry, // GeoJSON LineString
        });
      } catch (e: any) {
        lastError = `${base} -> ${e?.message ?? "fetch failed"}`;
        console.warn("[route] mirror error:", lastError);
      }
    }
    console.error("[route] all OSRM mirrors failed:", lastError);
    return res.status(502).json({ message: "Routing service unavailable", error: lastError });
  });

  // ---------- SAVED SEARCHES (auth) ----------
  app.get("/api/saved-searches", requireAuth, (req, res) => {
    const userId = (req as any).authUserId as number;
    const leadIdStr = typeof req.query.leadId === "string" ? req.query.leadId : "";
    const leadId = leadIdStr ? parseInt(leadIdStr, 10) : null;
    let rows = leadId
      ? storage.listSavedSearchesByLead(leadId)
      : storage.listSavedSearches(userId);
    const items = rows.map((s: any) => ({
      ...s,
      filters: (() => { try { return JSON.parse(s.filters); } catch { return {}; } })(),
    }));
    res.json(items);
  });
  app.post("/api/saved-searches", requireAuth, (req, res) => {
    const userId = (req as any).authUserId as number;
    const {
      name,
      filters,
      emailAlerts,
      leadId,
      emailRecipient,
      alertType,
      frequency,
      instant,
      active,
    } = req.body ?? {};
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Name required" });
    }
    if (alertType && !["listings", "snapshot"].includes(alertType)) {
      return res.status(400).json({ message: "Invalid alertType" });
    }
    const created = storage.createSavedSearch({
      userId,
      leadId: leadId ?? null,
      emailRecipient: emailRecipient ?? null,
      name,
      filters: filters ?? {},
      emailAlerts: emailAlerts !== false,
      alertType: alertType ?? "listings",
      frequency: frequency ?? "daily",
      instant,
      active,
    } as any);
    res.json(created);
  });
  app.patch("/api/saved-searches/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const updated = storage.updateSavedSearch(id, req.body ?? {});
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });
  app.delete("/api/saved-searches/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    res.json({ ok: storage.deleteSavedSearch(id) });
  });

  // ---------- SOCIAL POSTS (auth) ----------
  app.get("/api/social-posts", requireAuth, (req, res) => {
    const userId = (req as any).authUserId as number;
    const items = storage.listSocialPosts(userId).map((p) => ({
      ...p,
      channels: (() => { try { return JSON.parse(p.channels); } catch { return []; } })(),
      variants: (() => { try { return JSON.parse((p as any).variants ?? "{}"); } catch { return {}; } })(),
    }));
    res.json(items);
  });
  app.post("/api/social-posts", requireAuth, (req, res) => {
    const userId = (req as any).authUserId as number;
    const { caption, imageUrl, linkUrl, channels, variants, scheduledFor, status, listingId } = req.body ?? {};
    if (!caption || typeof caption !== "string") {
      return res.status(400).json({ message: "Caption required" });
    }
    const created = storage.createSocialPost({
      userId,
      caption,
      imageUrl: imageUrl ?? null,
      linkUrl: linkUrl ?? null,
      channels: Array.isArray(channels) ? channels : [],
      variants: typeof variants === "object" && variants !== null ? variants : {},
      scheduledFor: scheduledFor ?? null,
      status: status ?? "draft",
      listingId: listingId ?? null,
    } as any);
    res.json({
      ...created,
      channels: (() => { try { return JSON.parse(created.channels); } catch { return []; } })(),
      variants: (() => { try { return JSON.parse((created as any).variants ?? "{}"); } catch { return {}; } })(),
    });
  });
  app.patch("/api/social-posts/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const patch: any = {};
    const b = req.body ?? {};
    if (typeof b.caption === "string") patch.caption = b.caption;
    if ("imageUrl" in b) patch.imageUrl = b.imageUrl;
    if ("linkUrl" in b) patch.linkUrl = b.linkUrl;
    if ("scheduledFor" in b) patch.scheduledFor = b.scheduledFor;
    if ("status" in b) patch.status = b.status;
    if ("listingId" in b) patch.listingId = b.listingId;
    if (Array.isArray(b.channels)) patch.channels = b.channels;
    if (b.variants && typeof b.variants === "object") patch.variants = b.variants;
    const updated = storage.updateSocialPost(id, patch);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });
  app.post("/api/social-posts/:id/post", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const post: any = storage.getSocialPost(id);
    if (!post) return res.status(404).json({ message: "Not found" });

    // Resolve channels + variants. Each platform gets {caption, imageUrl,
    // linkUrl, scheduledFor} merged from master + variant overrides.
    const channels = (() => { try { return JSON.parse(post.channels); } catch { return []; } })() as string[];
    const variants = (() => { try { return JSON.parse(post.variants ?? "{}"); } catch { return {}; } })() as Record<string, any>;
    const posts: Record<string, any> = {};
    for (const ch of channels) {
      const v = variants[ch] ?? {};
      posts[ch] = {
        caption: typeof v.caption === "string" && v.caption.trim() ? v.caption : post.caption,
        imageUrl: v.imageUrl ?? post.imageUrl ?? null,
        linkUrl: v.linkUrl ?? post.linkUrl ?? null,
        scheduledFor: v.scheduledFor ?? post.scheduledFor ?? null,
      };
    }

    // Fire the Make webhook (if configured) with a per-platform payload.
    const url = process.env.MAKE_SOCIAL_WEBHOOK_URL;
    let dispatched = false;
    let webhookError: string | null = null;
    if (url && channels.length > 0) {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: post.id,
            listingId: post.listingId,
            platforms: channels, // backwards-compat with router filters
            posts,
            // backwards-compat top-level master fields
            caption: post.caption,
            imageUrl: post.imageUrl,
            linkUrl: post.linkUrl,
          }),
        });
        dispatched = r.ok;
        if (!r.ok) webhookError = `Webhook ${r.status}: ${await r.text()}`;
      } catch (e: any) {
        webhookError = e?.message ?? "fetch failed";
      }
    } else if (!url) {
      webhookError = "MAKE_SOCIAL_WEBHOOK_URL not set";
    }

    const updated = storage.updateSocialPost(id, {
      status: dispatched ? "posted" : "failed",
      postedAt: dispatched ? new Date().toISOString() : null,
    } as any);
    res.json({ ...updated, dispatched, webhookError, channels, posts });
  });
  app.delete("/api/social-posts/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    res.json({ ok: storage.deleteSocialPost(id) });
  });

  // ---------- ANALYTICS (auth) ----------
  // Lightweight read-only analytics derived from existing tables.
  app.get("/api/analytics/summary", requireAuth, (_req, res) => {
    const allListings = storage.listListings();
    const allLeads = storage.listLeads();
    const allTours = storage.listTours();
    const activeMls = storage.countActiveMlsListings();
    const totalMls = storage.countMlsListings();

    // Bucket leads by week (last 12 weeks)
    const now = new Date();
    const weeks: { weekStart: string; leads: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const ws = new Date(d);
      ws.setDate(d.getDate() - d.getDay());
      ws.setHours(0, 0, 0, 0);
      weeks.push({ weekStart: ws.toISOString().slice(0, 10), leads: 0 });
    }
    for (const lead of allLeads) {
      const t = new Date(lead.createdAt).getTime();
      for (let i = weeks.length - 1; i >= 0; i--) {
        const ws = new Date(weeks[i].weekStart).getTime();
        if (t >= ws) {
          weeks[i].leads++;
          break;
        }
      }
    }
    // Lead sources breakdown
    const sourceMap = new Map<string, number>();
    for (const l of allLeads) {
      sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1);
    }
    const sources = Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count }));

    // Lead status pipeline
    const statusMap = new Map<string, number>();
    for (const l of allLeads) {
      statusMap.set(l.status, (statusMap.get(l.status) ?? 0) + 1);
    }
    const pipeline = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // Top neighbourhoods by lead count
    const nbMap = new Map<string, number>();
    for (const l of allLeads) {
      if (!l.listingId) continue;
      const lst = storage.getListingById(l.listingId);
      if (lst?.neighbourhood) {
        nbMap.set(lst.neighbourhood, (nbMap.get(lst.neighbourhood) ?? 0) + 1);
      }
    }
    const neighbourhoods = Array.from(nbMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, leads]) => ({ name, leads }));

    // Aggregate views & list price
    const totalViews = allListings.reduce((s, l) => s + (l.views ?? 0), 0);
    const portfolioValue = allListings.reduce((s, l) => s + (l.price ?? 0), 0);

    res.json({
      kpis: {
        activeMls,
        totalMls,
        managedListings: allListings.length,
        totalLeads: allLeads.length,
        upcomingTours: allTours.filter((t) => t.status === "requested" || t.status === "confirmed").length,
        totalViews,
        portfolioValue,
        conversionRate: allLeads.length
          ? Math.round((allLeads.filter((l) => l.status === "qualified" || l.status === "closed").length / allLeads.length) * 1000) / 10
          : 0,
      },
      weeklyLeads: weeks,
      sources,
      pipeline,
      neighbourhoods,
    });
  });

  return httpServer;
}
