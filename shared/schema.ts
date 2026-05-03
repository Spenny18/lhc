import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---- Users (agent accounts) -----------------------------------------------
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  title: text("title"),
  avatar: text("avatar"),
  phone: text("phone"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  title: true,
  avatar: true,
  phone: true,
});

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
  name: z.string().min(2),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "passwordHash">;

// ---- Listings -------------------------------------------------------------
export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  address: text("address").notNull(),
  neighbourhood: text("neighbourhood").notNull(),
  city: text("city").notNull().default("Calgary, AB"),
  price: integer("price").notNull(),
  beds: integer("beds").notNull(),
  baths: real("baths").notNull(),
  sqft: integer("sqft").notNull(),
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  description: text("description").notNull(),
  features: text("features").notNull().default("[]"), // JSON array
  heroImage: text("hero_image").notNull(),
  gallery: text("gallery").notNull().default("[]"), // JSON array
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  views: integer("views").notNull().default(0),
  userId: integer("user_id").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const insertListingSchema = createInsertSchema(listings).omit({
  createdAt: true,
  views: true,
});

export type InsertListing = z.infer<typeof insertListingSchema>;
export type ListingRow = typeof listings.$inferSelect;

// ---- Leads ----------------------------------------------------------------
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: text("listing_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  source: text("source").notNull().default("Landing page"),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const inquirySchema = z.object({
  listingId: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
  source: z.string().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// ---- Messages (lead thread) -----------------------------------------------
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: integer("lead_id").notNull(),
  fromAgent: integer("from_agent", { mode: "boolean" }).notNull().default(false),
  body: text("body").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ---- Tours ----------------------------------------------------------------
export const tours = sqliteTable("tours", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: text("listing_id").notNull(),
  leadId: integer("lead_id"),
  scheduledFor: text("scheduled_for").notNull(),
  status: text("status").notNull().default("requested"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
  createdAt: true,
});

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;

// ---- MLS Listings (live Pillar 9 feed) ------------------------------------
// Mirrors the public listing card we want to render. Photos and description
// come from the RETS Property/Media resources. We keep raw RETS fields out of
// here on purpose — anything specific gets normalized at sync time.
export const mlsListings = sqliteTable("mls_listings", {
  // Pillar 9 ListingKey or MLS#. Used as primary key so re-syncs idempotently upsert.
  id: text("id").primaryKey(),
  mlsNumber: text("mls_number").notNull(),
  // Pillar 9 ListingKeyNumeric — the numeric ID required by RETS GetObject for photos.
  listingKey: integer("listing_key"),
  status: text("status").notNull().default("Active"), // Active / Pending / Sold / Conditional
  listPrice: integer("list_price").notNull(),
  soldPrice: integer("sold_price"),
  // Address
  streetNumber: text("street_number"),
  streetName: text("street_name"),
  unit: text("unit"),
  fullAddress: text("full_address").notNull(),
  neighbourhood: text("neighbourhood"),
  city: text("city").notNull().default("Calgary"),
  province: text("province").notNull().default("AB"),
  postalCode: text("postal_code"),
  lat: real("lat"),
  lng: real("lng"),
  // Property
  propertyType: text("property_type").notNull().default("Detached"),
  propertySubType: text("property_sub_type"),
  beds: integer("beds").notNull().default(0),
  bedsAbove: integer("beds_above"),
  bedsBelow: integer("beds_below"),
  baths: real("baths").notNull().default(0),
  halfBaths: integer("half_baths"),
  sqft: integer("sqft"),
  sqftBelow: integer("sqft_below"),
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built"),
  parking: text("parking"),
  garageSpaces: integer("garage_spaces"),
  // ---- structured Pillar 9 fields (populated lazily; multi-value stored as
  // raw RETS string with separators preserved, matched with LIKE at query time) ----
  structureType: text("structure_type"),
  architecturalStyle: text("architectural_style"),
  levels: text("levels"),
  basement: text("basement"),
  basementDevelopment: text("basement_development"),
  parkingFeatures: text("parking_features"),
  garageYn: integer("garage_yn", { mode: "boolean" }),
  lotFeatures: text("lot_features"),
  laundryFeatures: text("laundry_features"),
  appliances: text("appliances"),
  cooling: text("cooling"),
  heating: text("heating"),
  flooring: text("flooring"),
  fireplacesTotal: integer("fireplaces_total"),
  fireplaceFeatures: text("fireplace_features"),
  poolPrivateYn: integer("pool_private_yn", { mode: "boolean" }),
  poolFeatures: text("pool_features"),
  waterfrontYn: integer("waterfront_yn", { mode: "boolean" }),
  view: text("view"),
  subdivision: text("subdivision"),
  district: text("district"),
  condoFee: integer("condo_fee"),
  associationFeeIncludes: text("association_fee_includes"),
  associationAmenities: text("association_amenities"),
  accessibilityFeatures: text("accessibility_features"),
  inclusions: text("inclusions"),
  exclusions: text("exclusions"),
  zoning: text("zoning"),
  suite: text("suite"),
  legalSuiteYn: integer("legal_suite_yn", { mode: "boolean" }),
  suiteLocation: text("suite_location"),
  // Price change tracking (populated by sync when price changes)
  previousPrice: integer("previous_price"),
  priceChangedAt: text("price_changed_at"),
  // Removal tracking — when a listing disappears from the Pillar 9 active feed,
  // we capture the date it stopped appearing and the prior status if known.
  // removedReason values: Sold | Expired | Withdrawn | Terminated | Pending | Unknown.
  removedAt: text("removed_at"),
  removedReason: text("removed_reason"),
  // ---- /structured fields ----
  // Listing meta
  listDate: text("list_date"),
  daysOnMarket: integer("days_on_market"),
  description: text("description"),
  features: text("features").notNull().default("[]"), // JSON array
  // Listing agent / brokerage (from RETS)
  listAgentName: text("list_agent_name"),
  listAgentPhone: text("list_agent_phone"),
  listOffice: text("list_office"),
  // Photos
  heroImage: text("hero_image"),
  gallery: text("gallery").notNull().default("[]"), // JSON array of URLs
  photoCount: integer("photo_count").notNull().default(0),
  // Sync bookkeeping
  source: text("source").notNull().default("pillar9"), // pillar9 | seed | manual
  rawJson: text("raw_json"), // optional — full RETS row for debugging
  syncedAt: text("synced_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type MlsListing = typeof mlsListings.$inferSelect;
export type InsertMlsListing = typeof mlsListings.$inferInsert;

// ---- MLS Sync Runs --------------------------------------------------------
export const mlsSyncRuns = sqliteTable("mls_sync_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
  status: text("status").notNull().default("running"), // running | success | error | skipped
  source: text("source").notNull().default("pillar9"), // pillar9 | seed
  fetched: integer("fetched").notNull().default(0),
  upserted: integer("upserted").notNull().default(0),
  removed: integer("removed").notNull().default(0),
  errorMessage: text("error_message"),
});

export type MlsSyncRun = typeof mlsSyncRuns.$inferSelect;

// ---- Blog posts -----------------------------------------------------------
export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull().default("Market"),
  heroImage: text("hero_image").notNull(),
  authorName: text("author_name").notNull().default("Spencer Rivers"),
  authorAvatar: text("author_avatar"),
  readMinutes: integer("read_minutes").notNull().default(4),
  publishedAt: text("published_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ---- Neighbourhoods (editorial content) -----------------------------------
export const neighbourhoods = sqliteTable("neighbourhoods", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  // Long-form editorial paragraphs (JSON array of strings)
  story: text("story").notNull().default("[]"),
  outsideCopy: text("outside_copy").notNull().default("[]"),
  amenitiesCopy: text("amenities_copy").notNull().default("[]"),
  shopDineCopy: text("shop_dine_copy").notNull().default("[]"),
  // Real-estate intro paragraphs (JSON array of strings)
  realEstateCopy: text("real_estate_copy").notNull().default("[]"),
  // Lifestyle / family copy (JSON array of strings)
  lifeCopy: text("life_copy").notNull().default("[]"),
  // Quadrant: city-centre | west | south | southeast | north | northwest | northeast | east | surrounding
  quadrant: text("quadrant").notNull().default("city-centre"),
  // Display zone for grouping on /neighbourhoods (e.g. "City Centre & Inner-City",
  // "Northwest", "Southwest Estates", "Southeast Lakes", "Surrounding Towns").
  // Public /neighbourhoods page groups by this label.
  zone: text("zone").notNull().default("City Centre & Inner-City"),
  // Border streets {north, south, east, west}
  borders: text("borders").notNull().default("{}"),
  // Schools list — JSON array of {name, level, area, url}
  schools: text("schools").notNull().default("[]"),
  heroImage: text("hero_image").notNull(),
  gallery: text("gallery").notNull().default("[]"),
  centerLat: real("center_lat").notNull(),
  centerLng: real("center_lng").notNull(),
  avgPrice: integer("avg_price").notNull(),
  activeCount: integer("active_count").notNull().default(0),
  // Sort order in lists
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---- Condo Buildings ------------------------------------------------------
export const condoBuildings = sqliteTable("condo_buildings", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  // Editorial paragraphs (JSON arrays). The first three describe the
  // building itself; the rest describe the immediate neighbourhood. Each
  // field renders as its own H3 section on the public condo page.
  intro: text("intro").notNull().default("[]"),
  residencesCopy: text("residences_copy").notNull().default("[]"),
  architecturalCopy: text("architectural_copy").notNull().default("[]"),
  locationCopy: text("location_copy").notNull().default("[]"),
  diningCopy: text("dining_copy").notNull().default("[]"),
  shoppingCopy: text("shopping_copy").notNull().default("[]"),
  communityCopy: text("community_copy").notNull().default("[]"),
  schoolsCopy: text("schools_copy").notNull().default("[]"),
  // Amenities list — JSON array of strings
  amenities: text("amenities").notNull().default("[]"),
  // Address fields. `addressAliases` is an optional comma-separated list of
  // additional street numbers at the same building (e.g. The River condo
  // spans 135 + 137 26 Ave SW). Listings at any of those numbers + the same
  // street name are pulled into the building's unit list.
  address: text("address").notNull(),
  addressAliases: text("address_aliases"),
  // Neighbourhood + quadrant for cross-linking + listing filtering
  neighbourhoodSlug: text("neighbourhood_slug").notNull(),
  neighbourhood: text("neighbourhood").notNull(),
  quadrant: text("quadrant").notNull().default("city-centre"),
  // Building stats
  units: integer("units"),
  stories: integer("stories"),
  builtIn: integer("built_in"),
  developer: text("developer"),
  architect: text("architect"),
  // Lat/lng
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  heroImage: text("hero_image").notNull(),
  gallery: text("gallery").notNull().default("[]"),
  // Sort + display
  sortOrder: integer("sort_order").notNull().default(0),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
});

export type CondoBuilding = typeof condoBuildings.$inferSelect;
export type InsertCondoBuilding = typeof condoBuildings.$inferInsert;

// ---- Lead Alerts ---------------------------------------------------------
// Each alert ties a lead to a filter set (same JSON shape as savedSearches.filters)
// and a delivery frequency. The hourly cron picks up due alerts and emails the
// matched listings to the lead's email + Spencer.
export const leadAlerts = sqliteTable("lead_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: integer("lead_id").notNull(),
  label: text("label").notNull(),
  filters: text("filters").notNull().default("{}"),
  // instant | daily | weekly | monthly
  frequency: text("frequency").notNull().default("daily"),
  // True only when frequency = "instant" — when true, every new matching
  // listing fires an immediate email rather than waiting for the cron.
  instant: integer("instant", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  lastSentAt: text("last_sent_at"),
  lastMatchCount: integer("last_match_count").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type LeadAlert = typeof leadAlerts.$inferSelect;
export type InsertLeadAlert = typeof leadAlerts.$inferInsert;

// ---- MLS Price History --------------------------------------------------
// Append-only log: each row records a price change observed during a sync
// (or status change like Sold/Pending). Used to compute market snapshots
// (price reductions, recent sales) without losing history when listings
// re-update.
export const mlsPriceHistory = sqliteTable("mls_price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: text("listing_id").notNull(),
  oldPrice: integer("old_price"),
  newPrice: integer("new_price"),
  oldStatus: text("old_status"),
  newStatus: text("new_status"),
  changedAt: text("changed_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type MlsPriceHistory = typeof mlsPriceHistory.$inferSelect;
export type InsertMlsPriceHistory = typeof mlsPriceHistory.$inferInsert;

// ---- User integrations (OAuth tokens for Google, etc.) ------------------
export const userIntegrations = sqliteTable("user_integrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // 'google' | 'buffer'
  accountEmail: text("account_email"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: text("expires_at"),
  scope: text("scope"),
  // Provider-specific JSON blob (e.g. selected calendar ID for Google,
  // profile IDs for Buffer)
  metadata: text("metadata").notNull().default("{}"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type UserIntegration = typeof userIntegrations.$inferSelect;
export type InsertUserIntegration = typeof userIntegrations.$inferInsert;

// Add a column to tours so we can track the Google Calendar event id and
// keep two-way sync going. Stored as a string because Google IDs aren't ints.
// (The actual ALTER TABLE happens in storage.ts's migration block.)

export type Neighbourhood = typeof neighbourhoods.$inferSelect;
export type InsertNeighbourhood = typeof neighbourhoods.$inferInsert;

// ---- Testimonials ---------------------------------------------------------
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(), // "Mount Royal Sellers", "Aspen Woods Buyer"
  rating: integer("rating").notNull().default(5),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// ---- POI cache (Overpass API) ---------------------------------------------
export const poisCache = sqliteTable("pois_cache", {
  // Composite key: "<lat>:<lng>:<radius>" rounded
  id: text("id").primaryKey(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  radius: integer("radius").notNull().default(1000),
  payload: text("payload").notNull(), // JSON {schools, restaurants, parks, transit}
  fetchedAt: text("fetched_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type PoiCacheRow = typeof poisCache.$inferSelect;
export type InsertPoiCache = typeof poisCache.$inferInsert;

// ---- Saved searches (buyer-side) ------------------------------------------
// Unified table: both Spencer's personal searches (leadId = null, emails go
// to SPENCER_NOTIFY_EMAIL or his account) and lead-attached searches (leadId
// set, emails go to lead.email) live here.
export const savedSearches = sqliteTable("saved_searches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  // Optional lead linkage. If set, emails address the lead; lastSentAt drives
  // cadence. If null, the search is the agent's personal browsing search.
  leadId: integer("lead_id"),
  // Optional override for the email recipient. If null and leadId is set, we
  // use lead.email. If null and leadId is null, we fall back to SPENCER_NOTIFY_EMAIL.
  emailRecipient: text("email_recipient"),
  name: text("name").notNull(),
  filters: text("filters").notNull().default("{}"), // JSON: {minPrice, maxPrice, beds, neighbourhood, ...}
  emailAlerts: integer("email_alerts", { mode: "boolean" }).notNull().default(true),
  // 'listings' = digest of new matches + price reductions; 'snapshot' = stats only
  alertType: text("alert_type").notNull().default("listings"),
  // instant | daily | weekly | monthly
  frequency: text("frequency").notNull().default("daily"),
  // True only when frequency = 'instant' (cron treats specially)
  instant: integer("instant", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  lastSentAt: text("last_sent_at"),
  lastMatchCount: integer("last_match_count").notNull().default(0),
  lastRunAt: text("last_run_at"),
  matchCount: integer("match_count").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({
  id: true,
  createdAt: true,
  lastRunAt: true,
  matchCount: true,
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;

// ---- Social posts (Marketing) ---------------------------------------------
export const socialPosts = sqliteTable("social_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  listingId: text("listing_id"), // optional — when post is tied to a specific listing
  caption: text("caption").notNull(), // master/default caption (used when a platform variant is empty)
  imageUrl: text("image_url"), // master/default image
  linkUrl: text("link_url"), // master/default link (Facebook + X support clickable links; GBP CTA URL)
  channels: text("channels").notNull().default("[]"), // JSON array: ["instagram","facebook","x","linkedin","gbp","youtube"]
  variants: text("variants").notNull().default("{}"), // JSON map: {[platform]: {caption?, imageUrl?, linkUrl?, scheduledFor?}}
  scheduledFor: text("scheduled_for"), // null = post immediately (master schedule)
  status: text("status").notNull().default("draft"), // draft | scheduled | posted | failed
  postedAt: text("posted_at"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
  postedAt: true,
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
