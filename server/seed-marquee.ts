// Marquee neighbourhood + condo seed data.
//
// These rows expand the curated long-form content beyond the original 6
// luxury markets. Coverage is intentionally selective — only neighbourhoods
// and buildings I have real, defensible content for. Spencer can add more
// rows over time (or via an admin editor) without me writing AI-thin pages
// that would hurt domain authority.

const HERO_BANK = {
  innerCityClassic: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=900&fit=crop",
  riverside: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1600&h=900&fit=crop",
  modernEstate: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&h=900&fit=crop",
  westsideEstate: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop",
  contemporaryHill: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&h=900&fit=crop",
  reservoir: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&h=900&fit=crop",
  highrise: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&h=900&fit=crop",
  cityLights: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&h=900&fit=crop",
  bridgeland: "https://images.unsplash.com/photo-1600573472556-e636c2acda88?w=1600&h=900&fit=crop",
  inglewood: "https://images.unsplash.com/photo-1600566753086-00f18fe6ba47?w=1600&h=900&fit=crop",
  mission: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1600&h=900&fit=crop",
};

interface MarqueeNeighbourhood {
  slug: string;
  name: string;
  tagline: string;
  story: string[];
  outsideCopy: string[];
  amenitiesCopy: string[];
  shopDineCopy: string[];
  realEstateCopy: string[];
  lifeCopy: string[];
  quadrant: "city-centre" | "west" | "south" | "southeast" | "north" | "northwest" | "northeast" | "east" | "surrounding";
  borders: { north: string; south: string; east: string; west: string };
  schools: Array<{ name: string; level: string; area?: string; url?: string }>;
  heroImage: string;
  centerLat: number;
  centerLng: number;
  avgPrice: number;
  sortOrder: number;
}

export const MARQUEE_NEIGHBOURHOODS: MarqueeNeighbourhood[] = [
  // ============================================================
  // EXISTING 6 — RE-EXPRESSED WITH THE NEW STRUCTURED FIELDS
  // ============================================================
  {
    slug: "upper-mount-royal",
    name: "Upper Mount Royal",
    tagline: "Calgary's most established prestige address.",
    story: [
      "Upper Mount Royal sits on the high ground south of 17th Avenue, plotted at the start of the 20th century when the railway barons wanted a neighbourhood that looked over the city instead of into it. A century of careful zoning has preserved the original lot widths — 50 to 100 feet — which means the streetscape still feels generous in a city that increasingly does not.",
      "The architecture reads as a quiet anthology: surviving Edwardians on Prospect, restrained Tudors on Hope and Talon, and a thin layer of contemporary infill where the original homes could not be saved. Replacement value runs higher here than anywhere else in Calgary, and the inventory is correspondingly thin — most years see fewer than thirty arm's-length sales.",
    ],
    outsideCopy: [
      "Mature American elms shade most of the side streets, and the neighbourhood's elevation gives almost every south-facing lot a downtown skyline view. Mount Royal Park sits at the eastern edge with a maintained tennis facility and a winter rink.",
    ],
    amenitiesCopy: [
      "The Glencoe Club, a five-minute drive into Elbow Park, is the standard family amenity. Calgary Golf & Country Club is the next nearest. MNP Community & Sports Centre, with its Olympic-sized pools and racquet courts, is a four-minute drive south.",
    ],
    shopDineCopy: [
      "4th Street and 17th Avenue are both walkable. Notable nearby: Cassis Bistro, Anju, Model Milk, Rouge — and the entire 17th Avenue retail strip from 4th to 14th Street SW.",
    ],
    realEstateCopy: [
      "Pricing breaks into three tiers: restored heritage on Prospect and Hope (typically $4-7M); contemporary new builds on the interior streets ($3.5-5.5M); and the entry tier — pre-1970s homes on smaller lots east of Mount Royal Crescent ($1.8-2.8M). Lot widths matter more here than in any other Calgary neighbourhood — a 75-foot lot on Prospect prices roughly 60% above an equivalent 50-foot lot one street over.",
      "Heritage status is a wildcard. Some homes are formally protected — meaningful renovation requires a heritage covenant amendment, which adds cost and time. Always ask for the lot's status before you write.",
    ],
    lifeCopy: [
      "Upper Mount Royal is not a young community — the median household runs older than most Calgary neighbourhoods, and the streets are quiet most evenings. Families do well here, but the rhythm is private rather than communal. Western Canada High School draws families who would otherwise consider private.",
    ],
    quadrant: "city-centre",
    borders: { north: "Royal Avenue SW", south: "Premier Way SW", east: "Mount Royal Crescent / Hillcrest Avenue", west: "14th Street SW" },
    schools: [
      { name: "Mount Royal School", level: "K-6", area: "Mount Royal", url: "https://school.cbe.ab.ca/school/mountroyal/" },
      { name: "Earl Grey School", level: "7-9", area: "Mount Royal", url: "https://school.cbe.ab.ca/school/earlgrey/" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow", url: "https://school.cbe.ab.ca/school/westerncanada/" },
      { name: "Calgary French & International School", level: "PreK-12 (private)", area: "Pump Hill" },
      { name: "Rundle College", level: "K-12 (private)", area: "Aspen" },
    ],
    heroImage: HERO_BANK.modernEstate,
    centerLat: 51.0265,
    centerLng: -114.0905,
    avgPrice: 3850000,
    sortOrder: 1,
  },
  {
    slug: "elbow-park",
    name: "Elbow Park",
    tagline: "Riverside character on Calgary's most walkable inner streets.",
    story: [
      "Elbow Park follows the curve of the Elbow River south of Mission, with most lots either backing onto the river itself or sitting two streets back from it. The rebuild after the 2013 flood reset the housing stock — roughly a third of the homes are now post-flood new builds, the rest are restored heritage.",
      "The neighbourhood's defining feature is its proximity. Glencoe Club, Calgary Golf & Country Club, and the Stanley Park pool are all reachable on foot, and the river pathway runs from Stanley Park north into downtown without a single road crossing.",
    ],
    outsideCopy: [
      "River Park and Stanley Park bookend the community. The off-leash trails through River Park are the closest serious off-leash space to downtown.",
    ],
    amenitiesCopy: [
      "Glencoe Club membership is the standard family amenity — a three-to-five-year wait, but transferable with most homes that already hold it. The Stanley Park outdoor pool is open to the public in summer.",
    ],
    shopDineCopy: [
      "Mission's 4th Street strip is a six-minute drive. Notable: Ten Foot Henry, Vendome, Pulcinella. Britannia Plaza is closer than Mission for everyday errands.",
    ],
    realEstateCopy: [
      "Riverfront lots are scarce — fewer than 60 homes have direct river frontage, and they almost never list publicly twice in the same decade. The interior streets price in tiers based on flood-zone status: post-2013 rebuilds on the established flood plain trade at a 10-15% premium over equivalent homes in the adjacent risk zone.",
      "Restored heritage homes on lots that escaped the 2013 flood are the strongest hold-value assets in the community. Pricing has compounded steadily since 2015 with very low volatility.",
    ],
    lifeCopy: [
      "Elbow Park is the most family-active of Calgary's prestige communities. The community association rink runs leagues for kids most weeknights through the winter, and the river pathway is the social spine in summer. Elbow Park Elementary anchors a tight cohort.",
    ],
    quadrant: "city-centre",
    borders: { north: "Mission Bridge / 25 Avenue SW", south: "50 Avenue SW", east: "Macleod Trail / Elbow River", west: "4th Street SW" },
    schools: [
      { name: "Elbow Park School", level: "K-6", area: "Elbow Park", url: "https://school.cbe.ab.ca/school/elbowpark/" },
      { name: "William Reid School", level: "K-6 (alt)", area: "Elbow Park" },
      { name: "Earl Grey School", level: "7-9", area: "Mount Royal" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.riverside,
    centerLat: 51.0233,
    centerLng: -114.0892,
    avgPrice: 2950000,
    sortOrder: 2,
  },
  {
    slug: "britannia",
    name: "Britannia",
    tagline: "Mid-century lots and the city's tightest infill market.",
    story: [
      "Britannia was platted in the 1950s as Calgary's first true post-war prestige community, with curved interior crescents instead of the grid that defined Mount Royal. The original mid-century housing stock has thinned considerably — roughly half the homes have been replaced or substantially renovated since 2010 — but the lot sizes (averaging 0.20 acres) remain a defining feature.",
      "Entry pricing is in the high $2M range for an original cottage on a teardown lot; finished rebuilds clear $5M on Britannia Drive. Inventory is famously tight: 8-15 transactions per year, often pre-MLS.",
    ],
    outsideCopy: [
      "Britannia Slopes drops west to the Elbow River pathway. The community greenbelt connects most of the interior crescents.",
    ],
    amenitiesCopy: [
      "Earl Grey School and Western Canada catchment. Glencoe Club is a four-minute drive. Mount Royal University is six minutes.",
    ],
    shopDineCopy: [
      "The Britannia Plaza is the local centre — Sunterra Market, Village Ice Cream, Crowfoot Wine & Spirits, Britannia Kitchen & Wine. It anchors the daily life of the community in a way few other Calgary neighbourhoods replicate.",
    ],
    realEstateCopy: [
      "Britannia trades on lot value more than home value. Even rebuilt, the most expensive home on a 60-foot lot will resell for less than a comparable build on a 90-foot lot two crescents over. When you tour, count street frontage first; everything else is second-order.",
      "The off-market network is dense here — most agents who work the community share inventory weeks before it lists publicly. Aspirational pricing is rare; the community sets a clear comparable range and homes that price within it move quickly.",
    ],
    lifeCopy: [
      "Britannia residents tend to stay for decades. Demographics skew established-family and empty-nester, with a quiet evening rhythm and minimal through-traffic. The community plaza is the social anchor.",
    ],
    quadrant: "city-centre",
    borders: { north: "50 Avenue SW", south: "Glenmore Trail SW", east: "Elbow River", west: "Elbow Drive" },
    schools: [
      { name: "Elbow Park School", level: "K-6", area: "Elbow Park" },
      { name: "Earl Grey School", level: "7-9", area: "Mount Royal" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
      { name: "Calgary French & International School", level: "PreK-12 (private)", area: "Pump Hill" },
    ],
    heroImage: HERO_BANK.innerCityClassic,
    centerLat: 51.0146,
    centerLng: -114.085,
    avgPrice: 3050000,
    sortOrder: 3,
  },
  {
    slug: "bel-aire",
    name: "Bel-Aire",
    tagline: "Calgary's smallest luxury enclave, on the Glenmore Reservoir.",
    story: [
      "Bel-Aire is the smallest of Calgary's recognized luxury communities — fewer than 100 homes — wrapped along the north shore of the Glenmore Reservoir. Lots run 0.30 to 0.60 acres, most facing west toward the water. Several still hold their original 1970s and 80s homes, and the rebuild cycle here is slower than anywhere else in the southwest.",
      "Sales activity is sparse: under ten per year on average, and many transactions never reach the open market. Pricing has moved decisively above $5M for a finished new build over the past three years.",
    ],
    outsideCopy: [
      "The Glenmore Reservoir pathway is the dominant outdoor amenity — 16 km of paved pathway accessible directly from the community.",
    ],
    amenitiesCopy: [
      "Earl Grey School and Western Canada High School. The Calgary Canoe Club is the historic community institution.",
    ],
    shopDineCopy: [
      "Britannia Plaza is the closest retail. Chinook Centre is a six-minute drive for full-service shopping.",
    ],
    realEstateCopy: [
      "Bel-Aire is a hold-for-decades community. Inventory is so thin that most arm's-length sales never list publicly — the agent network here is small and tightly networked. Buyers should expect to wait, often years, for the right home.",
      "Reservoir-view lots trade at 25-35% premiums over interior lots in the same community. The west-facing rim is the prize.",
    ],
    lifeCopy: [
      "Demographics skew older and established. The community is private and quiet — there's no neighbourhood plaza, no commercial strip, just the homes and the reservoir.",
    ],
    quadrant: "city-centre",
    borders: { north: "Glenmore Trail SW", south: "Glenmore Reservoir", east: "14 Street SW", west: "Bel-Aire Place SW" },
    schools: [
      { name: "Earl Grey School", level: "7-9", area: "Mount Royal" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
      { name: "Calgary French & International School", level: "PreK-12 (private)", area: "Pump Hill" },
    ],
    heroImage: HERO_BANK.reservoir,
    centerLat: 51.0,
    centerLng: -114.1015,
    avgPrice: 5450000,
    sortOrder: 4,
  },
  {
    slug: "aspen-woods",
    name: "Aspen Woods",
    tagline: "The newest of Calgary's prestige communities, with mountain views.",
    story: [
      "Aspen Woods sits at Calgary's western edge, where 17th Avenue rises into the foothills. The community was substantially built out between 2002 and 2018, which means the housing stock is uniformly newer than in the inner-city luxury communities — most homes are between 5 and 20 years old.",
      "The defining feature is the topography. The west-facing lots on the Aspen Summit ridge see the Rockies on a clear day; the east-facing lots see the city. Three private schools — Webber Academy, Calgary Academy, and Rundle College — all sit within the Aspen catchment, which is the single biggest driver of family demand.",
    ],
    outsideCopy: [
      "Aspen Estates Park and the 69th Street pathway connect through to West District. Edworthy Park and the Bow River pathway are a four-minute drive north.",
    ],
    amenitiesCopy: [
      "Webber Academy (K-12), Calgary Academy, Rundle College, Ambrose University. Calgary French & International School is a 12-minute drive south.",
    ],
    shopDineCopy: [
      "Aspen Landing — Blanco Cantina, Briggs Kitchen, Pie Junkie, Sunterra Market. West District (under construction) will add a second high-street precinct directly north.",
    ],
    realEstateCopy: [
      "Aspen prices off school catchment first, view second, lot size third. A west-facing ridge lot in the Webber catchment is the high tier; an interior lot in the same catchment without a view sits 15-25% below. Homes built before 2010 are increasingly being lifted to current standards via interior renovations rather than rebuilds — the lot premiums don't yet justify teardowns at scale.",
      "The community's relative youth (most homes under 20 years) means deferred-maintenance risk is much lower than in the inner-city luxury communities. That's a real value driver for buyers who don't want to inherit a renovation project.",
    ],
    lifeCopy: [
      "Aspen is the most family-dense of the prestige communities. The cohort effect is strong — kids walk to private schools together, parents network through school families. Suburban in feel, with the community amenity spine running through Aspen Landing.",
    ],
    quadrant: "west",
    borders: { north: "17 Avenue SW", south: "Old Banff Coach Road", east: "Sarcee Trail", west: "85 Street SW" },
    schools: [
      { name: "Webber Academy", level: "JK-12 (private)", area: "Aspen Woods" },
      { name: "Calgary Academy", level: "K-12 (private)", area: "Aspen Woods" },
      { name: "Rundle College", level: "K-12 (private)", area: "Aspen Woods" },
      { name: "Dr. Roberta Bondar School", level: "K-4", area: "Aspen Woods" },
      { name: "Ernest Manning High School", level: "10-12", area: "Cougar Ridge" },
    ],
    heroImage: HERO_BANK.westsideEstate,
    centerLat: 51.0395,
    centerLng: -114.193,
    avgPrice: 2750000,
    sortOrder: 5,
  },
  {
    slug: "springbank-hill",
    name: "Springbank Hill",
    tagline: "Acreage-feel lots in the foothills, ten minutes from downtown.",
    story: [
      "Springbank Hill rises west of Aspen Woods, with lots that increase in size as you move toward the city limit. The neighbourhood's older sections — built in the 1990s — have larger lots (0.18 to 0.35 acres) and a mix of original and rebuilt homes. The newer sections feel more like Aspen.",
      "The price-to-square-foot ratio here is the most favourable in Calgary's prestige market: buyers consistently get more home for the dollar than equivalent square footage in Aspen or Britannia. The trade-off is a 10-15 minute longer commute to downtown.",
    ],
    outsideCopy: [
      "Griffith Woods, the protected wetland ravine, runs along the southern edge with off-leash trails. Edworthy Park is a six-minute drive north.",
    ],
    amenitiesCopy: [
      "Webber Academy, Rundle College, Ambrose University, Calgary Academy. The public catchment is Olympic Heights / Ernest Manning High School.",
    ],
    shopDineCopy: [
      "Aspen Landing is the closest retail (four minutes). The 85th Street commercial node is closer for groceries — Co-op, Shoppers, several restaurants.",
    ],
    realEstateCopy: [
      "Springbank Hill is the dollar-efficient option in the western prestige cluster. Older sections (1990s) trade at meaningful per-square-foot discounts to Aspen and offer significantly larger lots — 0.18-0.35 acres versus Aspen's average 0.13 acre. Newer phases are pricing closer to Aspen comps.",
      "If you want acreage feel inside city limits without paying full Bearspaw prices, Springbank Hill is the play. Resale lags Aspen in tight markets but matches it in normal ones.",
    ],
    lifeCopy: [
      "Springbank Hill is suburban-quiet with strong family demographics. The newer sections have the cohort feel of Aspen; the older sections feel more spread-out and private.",
    ],
    quadrant: "west",
    borders: { north: "Old Banff Coach Road", south: "Highway 8 / Glenmore Trail", east: "69 Street SW / Sarcee Trail", west: "City limit (101 Street SW)" },
    schools: [
      { name: "Webber Academy", level: "JK-12 (private)", area: "Aspen Woods" },
      { name: "Rundle College", level: "K-12 (private)", area: "Aspen Woods" },
      { name: "Calgary Academy", level: "K-12 (private)", area: "Aspen Woods" },
      { name: "Ambrose University", level: "post-sec", area: "Springbank Hill" },
      { name: "Olympic Heights School", level: "K-6", area: "Cougar Ridge" },
      { name: "Ernest Manning High School", level: "10-12", area: "Cougar Ridge" },
    ],
    heroImage: HERO_BANK.contemporaryHill,
    centerLat: 51.0245,
    centerLng: -114.196,
    avgPrice: 2200000,
    sortOrder: 6,
  },

  // ============================================================
  // NEW: 24 ADDITIONAL MARQUEE NEIGHBOURHOODS
  // ============================================================
  {
    slug: "lower-mount-royal",
    name: "Lower Mount Royal",
    tagline: "Inner-city density meets century-old streetscape.",
    story: [
      "Lower Mount Royal sits on the slope between 17th Avenue and the Beltline, with a tighter grid and smaller lots than its uphill cousin. The original homes are early-1900s vernacular — two-storey wood frames on 25- to 50-foot lots — and a substantial portion have been replaced with infill duplexes and skinnies over the past two decades.",
      "The neighbourhood is increasingly the entry point for buyers who want Mount Royal proximity without Mount Royal pricing. Recent infill builds typically price between $1.1M and $1.8M, with the rare full-lot single-family homes clearing $2.5M.",
    ],
    outsideCopy: [
      "Tomkins Park anchors 17th Avenue at the community's eastern edge. The river pathway is a 12-minute walk north through the Beltline.",
    ],
    amenitiesCopy: [
      "Western Canada High School catchment. Sunalta School covers K-6. The Beltline's daily amenities — Co-op, Calgary Co-op Wine & Spirits, two boutique gyms — are within walking distance.",
    ],
    shopDineCopy: [
      "17th Avenue runs the entire eastern edge of the community. The full retail and dining strip from 4th to 14th Street SW is at your doorstep.",
    ],
    realEstateCopy: [
      "Lower Mount Royal is two markets in one envelope. New infill (post-2010) trades on rental yield as much as resale, since duplex configurations dominate. Original century homes are increasingly land plays — almost any home over 100 years old prices to its lot value.",
      "Walkability is the long-term value driver. Buyers who want the 17th Avenue lifestyle without committing to condo living come here.",
    ],
    lifeCopy: [
      "Demographics skew young-professional and DINK. Streets are walkable and active most evenings. Family density is lower than Upper Mount Royal but rising as duplexes attract second-time buyers.",
    ],
    quadrant: "city-centre",
    borders: { north: "12 Avenue SW", south: "Royal Avenue SW", east: "4 Street SW", west: "14 Street SW" },
    schools: [
      { name: "Sunalta School", level: "K-6", area: "Sunalta" },
      { name: "Mount Royal School", level: "K-6", area: "Mount Royal" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.innerCityClassic,
    centerLat: 51.038,
    centerLng: -114.0805,
    avgPrice: 1350000,
    sortOrder: 7,
  },
  {
    slug: "eau-claire",
    name: "Eau Claire",
    tagline: "Where the Bow River meets Calgary's downtown core.",
    story: [
      "Eau Claire is a small district pressed between the Bow River and downtown's western edge. The post-flood redevelopment around Princess Island Park has reshaped the streetscape since 2014, with the Concord and Parkside towers anchoring a new generation of riverfront living.",
      "The neighbourhood is functionally a condo market — fewer than a dozen single-family homes remain, mostly on Eau Claire Avenue. Tower inventory dominates: roughly 80 active listings in any given month, ranging from sub-$400K studios to $4M+ riverfront penthouses.",
    ],
    outsideCopy: [
      "Princes Island Park and the river pathway are the dominant amenity — kayak launches, pedestrian bridges to Memorial Drive, and the 21 km Bow River pathway running east-west through the community.",
    ],
    amenitiesCopy: [
      "Eau Claire Market (under redevelopment), the river pathway, Calgary Curling Club, and immediate access to the +15 walkway network into the downtown core. Connaught School covers K-6 from across the Beltline.",
    ],
    shopDineCopy: [
      "River Café on Princes Island is the destination dining anchor. Dahlia, Lukes Drug Mart, and the Beltline retail strip are all walkable.",
    ],
    realEstateCopy: [
      "Eau Claire trades almost entirely on building. The Concord, Princeton Grand, Parkside at Waterfront, and Point on the Bow form the prestige tier — riverfront orientation, full-service amenity packages, and 24/7 concierge. Older buildings (Tribeca, Eau Claire Estates) trade 30-40% below the prestige tier per square foot.",
      "View matters more than floor here. South-facing units lose the river view; north-facing units capture both the river and Memorial Drive parkway. The premium for a confirmed river view runs 15-20%.",
    ],
    lifeCopy: [
      "Eau Claire skews professional and downsizer. The community is more residential-feeling than the Beltline despite its downtown adjacency — quiet evenings, river-pathway commuters, and a high concentration of full-time residents (rather than investor-owned units).",
    ],
    quadrant: "city-centre",
    borders: { north: "Bow River", south: "5 Avenue SW", east: "Centre Street", west: "10 Street SW" },
    schools: [
      { name: "Connaught School", level: "K-6", area: "Beltline" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.cityLights,
    centerLat: 51.0535,
    centerLng: -114.0721,
    avgPrice: 1250000,
    sortOrder: 8,
  },
  {
    slug: "beltline",
    name: "Beltline",
    tagline: "Calgary's most walkable urban core.",
    story: [
      "The Beltline is the dense urban band running south of downtown between 9th and 17th Avenues, the most walkable neighbourhood in the city by every standard measure. Built originally as Calgary's first street-grid commercial extension at the start of the 20th century, the neighbourhood has cycled through industrial, residential, and mixed-use eras and now functions as Calgary's primary high-density residential district.",
      "Inventory is overwhelmingly condo: 600+ active units in any given month across roughly 50 buildings. Single-family supply is negligible. Pricing per square foot ranges from sub-$350 in the older walk-up era to over $900 in the 2015+ luxury towers like Park Point and The Royal.",
    ],
    outsideCopy: [
      "Central Memorial Park anchors the eastern half. Tomkins Park breaks 17th Avenue. The river pathway is a 10-12 minute walk north.",
    ],
    amenitiesCopy: [
      "Connaught School, Western Canada High catchment. The MNP Community & Sports Centre is a five-minute drive south.",
    ],
    shopDineCopy: [
      "17th Avenue (the Red Mile) and 4th Street SW run through the community — arguably Calgary's two strongest retail and dining strips. Notable: Model Milk, Rouge, Anju, Native Tongues, Calcutta Cricket Club, Pulcinella, Without Papers.",
    ],
    realEstateCopy: [
      "The Beltline is a building-quality market. Newer luxury towers (Park Point, The Royal, Drake, Smith) trade at $700-900/sqft and hold value. Older walk-ups and 1990s mid-rises trade in the $300-500 range and have soft resale momentum. The middle tier — 2005-2015 builds — is the most variable: building-by-building diligence matters more than neighbourhood-level data.",
      "AirBnB legality varies by building bylaws and the city's evolving short-term rental regime. Always verify before underwriting investment cases.",
    ],
    lifeCopy: [
      "Demographics skew young-professional and downsizer. Weekend retail and nightlife drive heavy foot traffic on 17th Ave; the side streets are calm. Dog ownership is high; family density is low.",
    ],
    quadrant: "city-centre",
    borders: { north: "9 Avenue SW", south: "17 Avenue SW", east: "Macleod Trail / 1 Street SE", west: "14 Street SW" },
    schools: [
      { name: "Connaught School", level: "K-6", area: "Beltline" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.cityLights,
    centerLat: 51.0398,
    centerLng: -114.0728,
    avgPrice: 580000,
    sortOrder: 9,
  },
  {
    slug: "mission",
    name: "Mission",
    tagline: "4th Street's brick row houses and new-build condos.",
    story: [
      "Mission runs along the east bank of the Elbow River south of downtown, structured around the 4th Street commercial spine. The community is one of Calgary's oldest — Holy Cross Hospital, the namesake mission, dates to 1894 — and the streetscape preserves a layer of red-brick row houses and stone churches that survived the 20th-century rebuild cycle.",
      "Housing splits roughly evenly between condo (in the river-fronting mid-rises and a growing band of new infill) and small-lot single-family. Inventory is tight; pricing has compounded steadily since 2015 with limited downside volatility.",
    ],
    outsideCopy: [
      "The Elbow River pathway runs the full western edge with kayak access at the Elbow Park bridge. Lindsay Park (around the MNP Centre) is a ten-minute walk south.",
    ],
    amenitiesCopy: [
      "MNP Community & Sports Centre is the dominant amenity — Olympic-sized pools, multiple fitness facilities, racquet courts. Western Canada High catchment.",
    ],
    shopDineCopy: [
      "4th Street SW between 17 and 26 Avenue is the densest restaurant strip in Calgary by some measures. Notable: Ten Foot Henry, Vendome, Pulcinella, Calcutta Cricket Club, Vine Arts.",
    ],
    realEstateCopy: [
      "Mission's character infill sits in the $1.1-1.7M range. River-adjacent condos in newer buildings (River Run, M2) trade at $700-900/sqft. Heritage row houses on the western blocks are the rarest inventory — fewer than 40 exist and almost never list publicly.",
      "Walkability is the persistent value driver. Buyers paying over $1M are paying for the 4th Street and river-pathway lifestyle as much as the home itself.",
    ],
    lifeCopy: [
      "Demographics are mixed: established residents on the row-house blocks, younger professionals in the condos, families on the western edges. Streetscape is active most days but never hectic.",
    ],
    quadrant: "city-centre",
    borders: { north: "Mission Bridge / 17 Avenue SW", south: "Macdonald Avenue SW / 26 Avenue", east: "Macleod Trail", west: "Elbow River" },
    schools: [
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
      { name: "Earl Grey School", level: "7-9", area: "Mount Royal" },
      { name: "Elbow Park School", level: "K-6", area: "Elbow Park" },
    ],
    heroImage: HERO_BANK.mission,
    centerLat: 51.0345,
    centerLng: -114.0688,
    avgPrice: 950000,
    sortOrder: 10,
  },
  {
    slug: "inglewood",
    name: "Inglewood",
    tagline: "Calgary's oldest neighbourhood, recently rediscovered.",
    story: [
      "Inglewood is Calgary's original townsite — the city was platted here in 1875, and the 9th Avenue commercial strip is the oldest continuous retail district in the city. The community sits on a peninsula formed by the Bow and Elbow rivers, which means almost every street is within 4 blocks of a river pathway.",
      "Housing is a mix of restored craftsman bungalows on small lots, mid-century walk-up condos, and a growing infill duplex/skinny inventory. Pricing has roughly doubled since 2015 as the 9th Avenue strip emerged as one of Calgary's strongest food + retail districts.",
    ],
    outsideCopy: [
      "Inglewood Bird Sanctuary, Pearce Estate Park, and the Bow River pathway are the outdoor anchors. The river loops the community on three sides.",
    ],
    amenitiesCopy: [
      "Colonel Walker School (K-9). Bishop Grandin and Western Canada High are the catchment options. The community association has an active rink and outdoor programming.",
    ],
    shopDineCopy: [
      "9th Avenue SE between 11th and 14th Streets is the spine — Rosso Coffee, Spolumbo's, Without Papers, Two Penny, Plant Geek, dozens of independent retailers. Notable music venues: Ironwood Stage, Festival Hall.",
    ],
    realEstateCopy: [
      "Inglewood inventory is character-driven. Restored 1910s bungalows on 35-45 foot lots trade $850-1.3M. Modern infill duplexes are $750-950K per side. The few remaining river-adjacent lots are aspirational pricing.",
      "Heritage protections and infill restrictions are tighter here than in most of Calgary. Always verify development potential before pricing in a rebuild thesis.",
    ],
    lifeCopy: [
      "Inglewood is the most artistic-identifying community in Calgary by self-report. The demographic is creative-class, professional, and increasingly families. Weekend foot traffic on 9th Ave is heavy; side streets are quiet.",
    ],
    quadrant: "city-centre",
    borders: { north: "Bow River / 12 Avenue SE", south: "Bow River / Inglewood Wildlands", east: "Inglewood Bird Sanctuary", west: "Elbow River / 6 Street SE" },
    schools: [
      { name: "Colonel Walker School", level: "K-9", area: "Inglewood" },
      { name: "Bishop Grandin High School", level: "10-12", area: "Acadia (Catholic)" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.inglewood,
    centerLat: 51.0399,
    centerLng: -114.0388,
    avgPrice: 875000,
    sortOrder: 11,
  },
  {
    slug: "bridgeland-riverside",
    name: "Bridgeland",
    tagline: "Italian heritage and downtown skyline views from the north bluff.",
    story: [
      "Bridgeland sits on the north bluff above the Bow River, looking south across the river at the downtown skyline. The community was settled by Italian and Eastern European families in the early 20th century, and the layered character of the streetscape — original brick and stone homes alongside post-war infills and 2010s skinnies — preserves that history.",
      "Recent infill activity has accelerated as buyers chase the views. Most new construction is duplex or three-storey skinny on the lots closest to the river escarpment, with prices starting around $1.1M and rising into the $2M range for view-confirmed top-floor units.",
    ],
    outsideCopy: [
      "Tom Campbell's Hill Natural Park sits at the eastern edge, with off-leash trails and skyline viewpoints. The Bow River pathway is reachable via the 4th Avenue flyover.",
    ],
    amenitiesCopy: [
      "Langevin School (K-9) covers French Immersion. St. Patrick School is the local Catholic option. Bridgeland-Riverside Community Association runs an active rink, outdoor pool, and summer programming.",
    ],
    shopDineCopy: [
      "1st Avenue NE is the commercial spine — Lina's Italian Market, OEB Breakfast, Una Pizza, Bridgeland Distillery, Phil & Sebastian Bridgeland. The General Hospital sits just east of the community.",
    ],
    realEstateCopy: [
      "Bridgeland trades on view first, lot size second. Bluff lots with confirmed downtown skyline views command 25-40% premiums over interior lots. Older heritage homes on view lots are the rarest inventory — most have been replaced with skinnies.",
      "The community's demographic transition (older Italian families to younger professional families) is mostly complete. Future appreciation will likely track the broader inner-city luxury market rather than continue the catch-up trajectory of 2015-2023.",
    ],
    lifeCopy: [
      "Demographics are mixed-young-professional and family. Sense of community is unusually strong — community-association events draw real attendance, and the Italian-heritage anchor businesses along 1st Avenue still drive a daytime social rhythm.",
    ],
    quadrant: "city-centre",
    borders: { north: "Memorial Drive NE", south: "Bow River", east: "12 Street NE", west: "Centre Street North" },
    schools: [
      { name: "Langevin School", level: "K-9 (French Immersion)", area: "Bridgeland" },
      { name: "St. Patrick School", level: "K-6 (Catholic)", area: "Bridgeland" },
      { name: "Crescent Heights High School", level: "10-12", area: "Crescent Heights" },
    ],
    heroImage: HERO_BANK.bridgeland,
    centerLat: 51.052,
    centerLng: -114.0479,
    avgPrice: 950000,
    sortOrder: 12,
  },
  {
    slug: "sunnyside",
    name: "Sunnyside",
    tagline: "Kensington's residential heart, two bridges from downtown.",
    story: [
      "Sunnyside sits between Hillhurst and Crescent Heights on the north bank of the Bow River, the residential complement to the Kensington commercial strip. The community is Calgary's densest non-Beltline neighbourhood and has the highest walkability score in the city outside the downtown core.",
      "Housing is roughly half single-family, half low-rise condo. The single-family inventory is mostly post-war character on 25-40 foot lots, with infill duplexes increasingly common. Condo inventory ranges from 1970s walk-ups to a small handful of modern mid-rises.",
    ],
    outsideCopy: [
      "Riley Park sits at the western edge with a public pool, cricket pitch, and outdoor concerts in summer. The Bow River pathway runs the southern edge with the Peace Bridge connecting to Eau Claire.",
    ],
    amenitiesCopy: [
      "Hillhurst School (K-6) and Queen Elizabeth School (7-12) cover the public catchment. Madeleine d'Houet provides French Immersion options. Several Catholic schools serve the community.",
    ],
    shopDineCopy: [
      "Kensington Road and 10 Street NW form the L-shaped retail spine: Pulcinella (the original), Container Bar, Made by Marcus, Vine Arts Wine, Higher Ground Coffee, Hayden Block.",
    ],
    realEstateCopy: [
      "Sunnyside is a walkability and transit play. The C-Train station sits at the southern edge, putting downtown five minutes away by transit. Family buyers come for the schools; young professionals come for Kensington and the river.",
      "Pricing is segmented: post-war original homes ($800K-1.1M), infill duplexes ($1.0-1.4M), heritage on a corner lot or river-adjacent lot ($1.4-1.9M). The condo segment is more variable.",
    ],
    lifeCopy: [
      "Sunnyside is one of Calgary's most age-balanced communities — established residents, young professionals, and growing families share the streets. The community association hosts the most active outdoor calendar of any inner-city community.",
    ],
    quadrant: "city-centre",
    borders: { north: "5 Avenue NW", south: "Bow River", east: "Centre Street", west: "10 Street NW" },
    schools: [
      { name: "Hillhurst School", level: "K-6", area: "Hillhurst" },
      { name: "Queen Elizabeth School", level: "7-12", area: "Hillhurst" },
      { name: "Madeleine d'Houet School", level: "K-9 (French Immersion)", area: "Mount Pleasant" },
    ],
    heroImage: HERO_BANK.bridgeland,
    centerLat: 51.0535,
    centerLng: -114.0855,
    avgPrice: 925000,
    sortOrder: 13,
  },
  {
    slug: "hillhurst",
    name: "Hillhurst",
    tagline: "Kensington-adjacent character on tree-lined streets.",
    story: [
      "Hillhurst sits west of Sunnyside on the north bank of the Bow, with a streetscape of mature elms and turn-of-the-century vernacular homes. The community shares the Kensington commercial strip with Sunnyside and feeds into the same school catchments, but the housing stock skews slightly older and the lots are slightly larger.",
      "The neighbourhood has been one of Calgary's strongest infill markets since 2010. Recent skinny and duplex construction has steadily replaced post-war bungalows on the interior streets, with the western edge near 14 Street holding the highest concentration of original homes.",
    ],
    outsideCopy: [
      "Riley Park is the dominant green space — outdoor pool, sports fields, summer concert series. The Bow River pathway runs the southern edge. McHugh Bluff connects east toward Crescent Heights.",
    ],
    amenitiesCopy: [
      "Hillhurst School (K-6) and Queen Elizabeth School (7-12) cover the public catchment. The Bow Cliffs YMCA and Kensington's gyms provide fitness amenities.",
    ],
    shopDineCopy: [
      "Kensington Road's full retail and dining strip is at the southern edge. 14 Street NW provides additional everyday retail.",
    ],
    realEstateCopy: [
      "Hillhurst is the dollar-balanced inner-city option. The single-family market splits between 1910s heritage on the western blocks ($1.2-1.8M) and 2010s+ infill on the interior ($1.0-1.5M). Lot widths range from 25 to 50 feet, with the 50-foot lots commanding meaningful premiums.",
      "Heritage protections are strong on the western blocks — meaningful renovation often requires variance approval. Buyers should verify development potential before pricing in a rebuild.",
    ],
    lifeCopy: [
      "Hillhurst skews family. Riley Park drives weekend rhythm; weekday foot traffic is light. The community association runs strong outdoor and youth programming.",
    ],
    quadrant: "city-centre",
    borders: { north: "5 Avenue NW", south: "Bow River", east: "10 Street NW", west: "14 Street NW" },
    schools: [
      { name: "Hillhurst School", level: "K-6", area: "Hillhurst" },
      { name: "Queen Elizabeth School", level: "7-12", area: "Hillhurst" },
    ],
    heroImage: HERO_BANK.bridgeland,
    centerLat: 51.0535,
    centerLng: -114.094,
    avgPrice: 1150000,
    sortOrder: 14,
  },
  {
    slug: "west-hillhurst",
    name: "West Hillhurst",
    tagline: "River-pathway access and easy access to Foothills hospital corridor.",
    story: [
      "West Hillhurst extends Hillhurst west to Crowchild Trail, with a slightly more residential character and lower commercial density. The community feeds the same Hillhurst School catchment but has a noticeably suburban interior — wider lots, more mature trees, fewer infill duplexes.",
      "The Foothills Medical Centre and University of Calgary anchor the western edge, which means the community is heavily occupied by medical and academic professionals. Pricing has tracked the broader inner-northwest market with low volatility.",
    ],
    outsideCopy: [
      "The Bow River pathway runs the southern edge with multiple access points. Edworthy Park sits at the southwestern corner.",
    ],
    amenitiesCopy: [
      "Hillhurst School (K-6), Queen Elizabeth School (7-12), and a tight catchment for both Foothills Hospital staff and University of Calgary faculty.",
    ],
    shopDineCopy: [
      "Memorial Drive's 19 Street SW retail node provides everyday amenities. Kensington (in adjacent Hillhurst) is a 5-minute drive or 12-minute walk.",
    ],
    realEstateCopy: [
      "West Hillhurst trades at a 10-15% discount to Hillhurst on equivalent square footage, despite very similar streetscapes. The discount reflects the slightly longer walk to Kensington and the larger commute time to downtown's east end.",
      "The community's strong professional demographic creates steady underlying demand and low resale-time variability.",
    ],
    lifeCopy: [
      "West Hillhurst is family-dense and quiet. The proximity to the hospital and university creates a high-education, established-professional community character.",
    ],
    quadrant: "city-centre",
    borders: { north: "5 Avenue NW", south: "Bow River", east: "14 Street NW", west: "Crowchild Trail" },
    schools: [
      { name: "Hillhurst School", level: "K-6", area: "Hillhurst" },
      { name: "Queen Elizabeth School", level: "7-12", area: "Hillhurst" },
      { name: "Madeleine d'Houet School", level: "K-9 (French Immersion)", area: "Mount Pleasant" },
    ],
    heroImage: HERO_BANK.innerCityClassic,
    centerLat: 51.0578,
    centerLng: -114.116,
    avgPrice: 1050000,
    sortOrder: 15,
  },
  {
    slug: "altadore",
    name: "Altadore",
    tagline: "Marda Loop's neighbourhood, with River Park at the door.",
    story: [
      "Altadore sits south of Garrison Woods and north of Glenmore Trail, structured around the 33rd Avenue and 20th Street commercial spines that form Marda Loop. The community is one of Calgary's strongest infill markets — over half the original 1950s housing stock has been replaced since 2005 with duplexes, skinnies, and contemporary single-family rebuilds.",
      "River Park, the community's southwestern anchor, runs along the Elbow River with serious off-leash trails. Sandy Beach, the swimming hole at the bottom of the park, is one of Calgary's most consistent summer crowds.",
    ],
    outsideCopy: [
      "River Park and Sandy Beach are the dominant amenities. The Elbow River pathway runs north into Mission and south toward Glenmore Reservoir.",
    ],
    amenitiesCopy: [
      "Altadore School (K-6), Dr. Oakley School, Lycée International de Calgary, Master's Academy, and Rundle Academy all sit within Altadore. The community has the highest concentration of K-12 schools in inner-city Calgary.",
    ],
    shopDineCopy: [
      "Marda Loop's commercial strip — UNA Pizza, OEB Breakfast, Phil & Sebastian, Made by Marcus, Yann's Bistro, Better Butcher. One of the strongest village-style commercial precincts in Calgary.",
    ],
    realEstateCopy: [
      "Altadore is a duplex-skinny market by inventory share — over 60% of the active single-family supply is post-2010 infill. Original 1950s bungalows are largely teardowns. Pricing on infill ranges $850K (entry duplex) to $1.4M (top-tier single-family rebuild on a corner lot).",
      "The community's school density creates persistent family demand, and the Marda Loop walkability creates persistent young-professional demand. Resale time is among the shortest in inner-city Calgary.",
    ],
    lifeCopy: [
      "Altadore is family-dense and walkable. Marda Loop is the social anchor; River Park is the weekend anchor. The community association runs an active outdoor rink.",
    ],
    quadrant: "city-centre",
    borders: { north: "33 Avenue SW", south: "50 Avenue SW", east: "Elbow Drive", west: "Crowchild Trail" },
    schools: [
      { name: "Altadore School", level: "K-6", area: "Altadore" },
      { name: "Dr. Oakley School", level: "K-6", area: "Altadore" },
      { name: "Lycée International de Calgary", level: "K-12 (private French)", area: "Altadore" },
      { name: "Master's Academy", level: "K-12 (private)", area: "Garrison Woods" },
      { name: "Rundle Academy", level: "5-12 (private, learning differences)", area: "Altadore" },
    ],
    heroImage: HERO_BANK.innerCityClassic,
    centerLat: 51.0223,
    centerLng: -114.099,
    avgPrice: 980000,
    sortOrder: 16,
  },
  {
    slug: "garrison-woods",
    name: "Garrison Woods",
    tagline: "Master-planned new urbanism on the former CFB Calgary base.",
    story: [
      "Garrison Woods is a master-planned community built on the former Canadian Forces Base Calgary, opened to development in the late 1990s. The new-urbanism plan prioritizes pedestrian-scale streets, alley-loaded garages, and a community-centre core that anchors the social rhythm.",
      "Housing is uniform in age (mostly 2000-2010 construction) and tightly designed. Single-family homes sit on 30-40 foot lots; town-style attached homes form the secondary inventory. The community sits adjacent to Marda Loop, sharing its commercial amenities.",
    ],
    outsideCopy: [
      "Garrison Woods Park sits at the community centre with a small market on summer Saturdays. The Glenmore Reservoir pathway is a six-minute drive south.",
    ],
    amenitiesCopy: [
      "Master's Academy (K-12 private) sits inside the community. Public catchment is Altadore School and Western Canada High.",
    ],
    shopDineCopy: [
      "Marda Loop's full retail strip is at the eastern edge — same amenities as Altadore.",
    ],
    realEstateCopy: [
      "Garrison Woods is the cleanest 'newer single-family in a pre-war frame' inventory in inner-city Calgary. Pricing has been remarkably stable since 2018. Single-family homes typically clear $900K-1.3M; town-style attached homes are $700-900K.",
      "The community's master-planned character means deferred-maintenance risk is low and resale time is short. Buyers who want move-in-ready inner-city without renovation exposure come here.",
    ],
    lifeCopy: [
      "Garrison Woods is family-dense and quiet. The community-centre design pulls daily life into the central park; the streets are calm and pedestrian-friendly.",
    ],
    quadrant: "city-centre",
    borders: { north: "Richmond Road SW", south: "33 Avenue SW", east: "Garrison Crossing", west: "Crowchild Trail" },
    schools: [
      { name: "Master's Academy", level: "K-12 (private)", area: "Garrison Woods" },
      { name: "Altadore School", level: "K-6", area: "Altadore" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.modernEstate,
    centerLat: 51.0265,
    centerLng: -114.103,
    avgPrice: 1050000,
    sortOrder: 17,
  },
  {
    slug: "currie-barracks",
    name: "Currie Barracks",
    tagline: "The next-generation new-urbanism build, in active development.",
    story: [
      "Currie sits south of Garrison Woods and is the newer master-planned community on what was the rest of the CFB Calgary lands. Phased development since 2015 has produced a community with denser townhouse and multi-family inventory plus a smaller single-family complement, all designed around walkable streets and shared green space.",
      "The community is still partially under construction, with new releases of townhouse and condo product appearing roughly annually. Pricing reflects the new-build premium but is leveling as the community matures.",
    ],
    outsideCopy: [
      "Internal park network connects to Glenmore Reservoir trails via the Lakeview Drive pathway.",
    ],
    amenitiesCopy: [
      "Master's Academy is adjacent. Public catchment is Altadore and Western Canada.",
    ],
    shopDineCopy: [
      "Marda Loop is a 5-minute drive. The community's own commercial node is in early stages.",
    ],
    realEstateCopy: [
      "Currie is a new-build market. Townhouse pricing typically clears $700-900K; single-family is $1.2-1.6M. Resale data is thin given the community's age, but early indicators suggest steady appreciation.",
      "Buyers should evaluate each phase individually — quality varies by builder and release year.",
    ],
    lifeCopy: [
      "Currie skews young-professional and young-family. The community is still establishing its rhythm; events and amenities are growing year over year.",
    ],
    quadrant: "city-centre",
    borders: { north: "33 Avenue SW", south: "Flanders Avenue / Lakeview Drive", east: "Crowchild Trail", west: "Sarcee Trail" },
    schools: [
      { name: "Master's Academy", level: "K-12 (private)", area: "Garrison Woods" },
      { name: "Altadore School", level: "K-6", area: "Altadore" },
    ],
    heroImage: HERO_BANK.modernEstate,
    centerLat: 51.018,
    centerLng: -114.116,
    avgPrice: 950000,
    sortOrder: 18,
  },
  {
    slug: "scarboro",
    name: "Scarboro",
    tagline: "Calgary's hidden hilltop heritage community.",
    story: [
      "Scarboro is a small (~250 homes) heritage community sitting on the bluff above 17th Avenue's western end. Plotted in 1910 as a CPR garden suburb, the community preserves the original curving streets and many original Edwardian and Craftsman homes.",
      "The neighbourhood is one of Calgary's most under-the-radar prestige addresses — limited public profile, almost no commercial frontage, and inventory in the single digits per year. Pricing is comparable to Upper Mount Royal on a like-for-like basis.",
    ],
    outsideCopy: [
      "Scarboro is bounded by the 17 Avenue commercial strip to the south but the residential streets are insulated. Shaganappi Golf Course is a five-minute drive north.",
    ],
    amenitiesCopy: [
      "Sunalta School covers K-6. Western Canada catchment for high school.",
    ],
    shopDineCopy: [
      "17th Avenue's western strip is at the community's southern edge. The Calgary Tennis Club sits on the eastern boundary.",
    ],
    realEstateCopy: [
      "Scarboro inventory is rare. The small community size combined with very low turnover (most owners hold for 20+ years) means meaningful sales activity is concentrated to a few transactions per year. Restored heritage on the original lots prices in the $2-3.5M range.",
      "Heritage covenants are common; buyers should verify development restrictions before any rebuild thesis.",
    ],
    lifeCopy: [
      "Scarboro is established-family and downsizer demographics, very quiet streets, and an unusually strong sense of community for an inner-city neighbourhood.",
    ],
    quadrant: "city-centre",
    borders: { north: "Bow Trail SW", south: "17 Avenue SW", east: "14 Street SW", west: "Crowchild Trail" },
    schools: [
      { name: "Sunalta School", level: "K-6", area: "Sunalta" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.innerCityClassic,
    centerLat: 51.04,
    centerLng: -114.105,
    avgPrice: 2200000,
    sortOrder: 19,
  },
  {
    slug: "rideau-park",
    name: "Rideau Park",
    tagline: "River-pathway access and quiet streets two minutes from Mission.",
    story: [
      "Rideau Park sits between Mission and Erlton on the south bluff above the Elbow River. The community is small (under 200 homes) and structured around 4th Street SW's southern extension, with a tight street grid and mostly post-war housing stock.",
      "Recent rebuild activity has been steady but measured. Most original homes have been restored or replaced, but the lot widths (mostly 50 feet) limit the community's transition into infill duplex territory.",
    ],
    outsideCopy: [
      "The Elbow River pathway runs the western edge with kayak access at Stanley Park. Rideau Park's interior streets back onto a community greenbelt.",
    ],
    amenitiesCopy: [
      "Rideau Park School (K-9) sits inside the community — a strong CBE community school. Western Canada catchment for high school.",
    ],
    shopDineCopy: [
      "Mission's 4th Street strip is a 5-minute drive. Britannia Plaza is closer for everyday errands.",
    ],
    realEstateCopy: [
      "Rideau Park inventory is sparse. Restored heritage and modern rebuilds typically clear $1.6-2.3M. The community's small size and limited public profile keep it adjacent to Elbow Park and Britannia in the buyer's mental hierarchy.",
      "Lot widths matter; corner lots and 60-footers price meaningfully above interior 50-foot lots.",
    ],
    lifeCopy: [
      "Rideau Park is family-dense around the school; the rest of the community is established-family and downsizer. Streets are quiet and cohesive.",
    ],
    quadrant: "city-centre",
    borders: { north: "26 Avenue SW", south: "Erlton Place SW", east: "Macleod Trail", west: "Elbow River" },
    schools: [
      { name: "Rideau Park School", level: "K-9", area: "Rideau Park" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.riverside,
    centerLat: 51.0265,
    centerLng: -114.072,
    avgPrice: 1850000,
    sortOrder: 20,
  },
  {
    slug: "roxboro",
    name: "Roxboro",
    tagline: "A 60-home riverside enclave at Mount Royal's southern edge.",
    story: [
      "Roxboro is one of Calgary's smallest named neighbourhoods — fewer than 70 homes — wrapped along a single curving boulevard at Mount Royal's southern edge, between the Elbow River and Mission. The community has the unusual character of feeling like a private extension of Mount Royal while retaining its own identity.",
      "Original homes date to the 1910s-1930s with a partial rebuild cycle since 2010. Pricing is tier-1 prestige; sales activity is minimal.",
    ],
    outsideCopy: [
      "The Elbow River pathway runs directly through the community. Stanley Park and Mount Royal Park bookend the walking distance.",
    ],
    amenitiesCopy: [
      "Earl Grey School and Western Canada High catchment. The Glencoe Club is a four-minute drive.",
    ],
    shopDineCopy: [
      "Mission's 4th Street strip is at the southern edge. The community has no internal commercial.",
    ],
    realEstateCopy: [
      "Roxboro is one of Calgary's tightest inventory markets — most years see 1-3 sales total, often unlisted. River-frontage homes are the rarest of all and price north of $4M when they appear.",
      "Buyers should expect a long wait. Working agents who hold the inventory off-MLS is the standard approach.",
    ],
    lifeCopy: [
      "Roxboro is established-family demographics, very quiet, and intensely private. The community feels almost rural in places despite its inner-city location.",
    ],
    quadrant: "city-centre",
    borders: { north: "26 Avenue SW", south: "Mission Bridge", east: "Macleod Trail", west: "Mount Royal" },
    schools: [
      { name: "Earl Grey School", level: "7-9", area: "Mount Royal" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.riverside,
    centerLat: 51.0298,
    centerLng: -114.077,
    avgPrice: 3250000,
    sortOrder: 21,
  },
  {
    slug: "mayfair",
    name: "Mayfair",
    tagline: "Pump Hill's quiet sibling, on the Glenmore Reservoir.",
    story: [
      "Mayfair is a small luxury community wedged between Bel-Aire and Pump Hill on the Glenmore Reservoir's north shore. Fewer than 80 homes, all on lots of 0.30 acres or larger, most facing west toward the reservoir.",
      "The community sits in the same prestige tier as Bel-Aire but with a slightly looser housing-quality standard — original 1970s/80s homes still dominate, with rebuilds appearing slowly. Pricing reflects the lot value premium more than the home value.",
    ],
    outsideCopy: [
      "Glenmore Reservoir pathway is the dominant outdoor amenity, with the Calgary Canoe Club at the eastern edge.",
    ],
    amenitiesCopy: [
      "Earl Grey School and Western Canada catchment. The MNP Centre is six minutes away.",
    ],
    shopDineCopy: [
      "Britannia Plaza is the closest retail; Chinook Centre is a six-minute drive.",
    ],
    realEstateCopy: [
      "Mayfair is a hold-for-decades community. Inventory is thin (under 5 sales most years) and the rebuild thesis is dollar-positive on most original homes — a teardown lot trades around $2.5M, and a finished new build clears $5-6M.",
      "View matters: reservoir-facing lots command 25-30% premiums over interior lots.",
    ],
    lifeCopy: [
      "Mayfair is established-family and downsizer. Quiet streets, no commercial, very private.",
    ],
    quadrant: "city-centre",
    borders: { north: "75 Avenue SW", south: "Glenmore Reservoir", east: "Elbow Drive", west: "14 Street SW" },
    schools: [
      { name: "Earl Grey School", level: "7-9", area: "Mount Royal" },
      { name: "Western Canada High School", level: "10-12", area: "Cliff Bungalow" },
    ],
    heroImage: HERO_BANK.reservoir,
    centerLat: 50.997,
    centerLng: -114.094,
    avgPrice: 3450000,
    sortOrder: 22,
  },
  {
    slug: "pump-hill",
    name: "Pump Hill",
    tagline: "Calgary's south-central luxury cluster.",
    story: [
      "Pump Hill is a luxury community on the south side of Glenmore Reservoir, with mature lots averaging 0.30-0.50 acres and a housing stock that mixes original 1970s/80s estates with a measured rebuild cycle. The community is home to Calgary French & International School (CFIS), which drives a meaningful family-buyer base.",
      "Pricing sits between Bel-Aire and Aspen Woods on a like-for-like basis. Inventory is thin but slightly more active than the inner-city luxury communities.",
    ],
    outsideCopy: [
      "Glenmore Reservoir pathway, Heritage Park, and the Weaselhead natural area are all reachable on foot or by short drive.",
    ],
    amenitiesCopy: [
      "Calgary French & International School (CFIS) is the anchor private institution. Public catchment is Henry Wise Wood High School and Cedarbrae School.",
    ],
    shopDineCopy: [
      "Britannia Plaza is a 5-minute drive. Chinook Centre is 8 minutes; Glenmore Landing is closer.",
    ],
    realEstateCopy: [
      "Pump Hill is a school-driven market — CFIS catchment status is the biggest single variable affecting price. Lot size and view are second and third. Original estates on view lots typically clear $2.5-4M; finished rebuilds run $4-6M.",
      "The community has been steady through cycles, with low resale-time variability.",
    ],
    lifeCopy: [
      "Pump Hill is family-dense and established. CFIS shapes the daily rhythm; the community is quiet outside school hours.",
    ],
    quadrant: "south",
    borders: { north: "Glenmore Reservoir", south: "90 Avenue SW", east: "14 Street SW", west: "Elbow Drive" },
    schools: [
      { name: "Calgary French & International School", level: "PreK-12 (private)", area: "Pump Hill" },
      { name: "Henry Wise Wood High School", level: "10-12", area: "Cedarbrae" },
      { name: "Cedarbrae School", level: "K-6", area: "Cedarbrae" },
    ],
    heroImage: HERO_BANK.westsideEstate,
    centerLat: 50.9885,
    centerLng: -114.0985,
    avgPrice: 2850000,
    sortOrder: 23,
  },
  {
    slug: "eagle-ridge",
    name: "Eagle Ridge",
    tagline: "South Calgary's smallest luxury enclave.",
    story: [
      "Eagle Ridge is a tiny luxury community (under 100 homes) on the south side of the Glenmore Reservoir, sitting in the same prestige tier as Bel-Aire and Mayfair but with a more interior orientation. Lots run 0.25-0.50 acres; most homes date to the 1970s-90s with a slow rebuild cycle.",
      "Inventory is among the thinnest in Calgary — most years see 1-4 sales. Pricing is tier-1 prestige.",
    ],
    outsideCopy: [
      "Glenmore Reservoir pathway is reachable on foot. Heritage Park is a four-minute drive.",
    ],
    amenitiesCopy: [
      "Calgary French & International School is at the southern edge. Public catchment overlaps with Pump Hill.",
    ],
    shopDineCopy: [
      "Glenmore Landing is the closest retail — Co-op, Save-On-Foods, several restaurants.",
    ],
    realEstateCopy: [
      "Eagle Ridge inventory is sparse. The community's small size keeps it off most public-search radar; agent networks know it well. Pricing tracks the broader south-side prestige cluster.",
      "Restored or rebuilt homes typically clear $3-5M.",
    ],
    lifeCopy: [
      "Eagle Ridge is established-family and downsizer demographics. Very quiet.",
    ],
    quadrant: "south",
    borders: { north: "Glenmore Reservoir", south: "75 Avenue SW", east: "Elbow Drive", west: "14 Street SW" },
    schools: [
      { name: "Calgary French & International School", level: "PreK-12 (private)", area: "Pump Hill" },
      { name: "Cedarbrae School", level: "K-6", area: "Cedarbrae" },
      { name: "Henry Wise Wood High School", level: "10-12", area: "Cedarbrae" },
    ],
    heroImage: HERO_BANK.reservoir,
    centerLat: 50.99,
    centerLng: -114.0905,
    avgPrice: 3650000,
    sortOrder: 24,
  },
  {
    slug: "bayview",
    name: "Bayview",
    tagline: "Lakeshore lots on Lake Bonavista's northern bay.",
    story: [
      "Bayview is the northern arm of Lake Bonavista, with lakefront lots and lake-access lots structured around a private resident lake. Lake-access communities are rare in Calgary, and Bayview's combination of lake amenity, mature lots, and southside location has made it one of the city's most stable hold-value communities.",
      "Lakefront lots are the prize and price north of $2.5M for finished homes. Interior lake-access lots typically clear $1.4-1.9M.",
    ],
    outsideCopy: [
      "The private lake (Lake Bonavista) is the dominant amenity — boat slips, beach, summer programming. Fish Creek Provincial Park is a six-minute drive south.",
    ],
    amenitiesCopy: [
      "Lake Bonavista School and Bishop Grandin (Catholic) cover the public catchments. The lake's recreation centre runs year-round programming.",
    ],
    shopDineCopy: [
      "Anderson Road's Centre 70 retail node provides everyday amenities. Chinook Centre is a 12-minute drive north.",
    ],
    realEstateCopy: [
      "Bayview's value driver is lake access. A lakefront lot with a buildable house trades 40-60% above an equivalent square footage on a non-lake lot in adjacent Lake Bonavista. Resale activity is steady; lakefront homes rarely list more than once a year.",
      "Heritage of the original 1970s housing stock is uneven; many homes have been substantially renovated or replaced.",
    ],
    lifeCopy: [
      "Bayview is family-dense. The lake drives summer rhythm; community programming brings consistent neighbour interaction.",
    ],
    quadrant: "south",
    borders: { north: "Anderson Road SE", south: "Lake Bonavista Drive SE", east: "Lake Bonavista", west: "Bow Bottom Trail" },
    schools: [
      { name: "Lake Bonavista School", level: "K-6", area: "Lake Bonavista" },
      { name: "Bishop Grandin High School", level: "10-12", area: "Acadia (Catholic)" },
      { name: "Henry Wise Wood High School", level: "10-12", area: "Cedarbrae" },
    ],
    heroImage: HERO_BANK.reservoir,
    centerLat: 50.9415,
    centerLng: -114.063,
    avgPrice: 1450000,
    sortOrder: 25,
  },
  {
    slug: "patterson",
    name: "Patterson",
    tagline: "Skyline-view ridges on Calgary's western escarpment.",
    story: [
      "Patterson sits on the bluff west of Bow Trail, with a streetscape oriented around the eastern escarpment that drops toward the Bow River valley. The community's defining feature is its skyline-view lots — the eastern edge has some of Calgary's strongest unbroken downtown views.",
      "Housing is a mix of 1980s-90s estate-style construction and a steady rebuild cycle on view lots. Lot sizes range 0.18-0.35 acres.",
    ],
    outsideCopy: [
      "Edworthy Park and the Bow River pathway are reachable via the 75 Street stairs. The Edworthy Off-Leash area is one of Calgary's largest.",
    ],
    amenitiesCopy: [
      "Bowness High School and Patterson School cover public catchment. Calgary Christian School sits inside the community.",
    ],
    shopDineCopy: [
      "Bow Trail's Westbrook node is at the southern edge. Edgemont Square (in adjacent Edgemont) is a 7-minute drive.",
    ],
    realEstateCopy: [
      "Patterson's value driver is view. A confirmed-skyline-view lot trades 30-50% above an equivalent interior lot. The eastern-edge streets (Patina, Pinnacle) hold the highest concentration of view lots.",
      "Original homes are increasingly rebuild candidates — most lots can support significantly larger homes than the originals built into them.",
    ],
    lifeCopy: [
      "Patterson is family-dense in the central blocks; established-family and downsizer on the view streets. Quiet and residential.",
    ],
    quadrant: "west",
    borders: { north: "Bow Trail SW", south: "Old Banff Coach Road", east: "Sarcee Trail", west: "85 Street SW" },
    schools: [
      { name: "Patterson School", level: "K-6", area: "Patterson" },
      { name: "Bowness High School", level: "10-12", area: "Bowness" },
      { name: "Calgary Christian School", level: "K-12 (private)", area: "Patterson" },
    ],
    heroImage: HERO_BANK.contemporaryHill,
    centerLat: 51.0455,
    centerLng: -114.166,
    avgPrice: 1450000,
    sortOrder: 26,
  },
  {
    slug: "discovery-ridge",
    name: "Discovery Ridge",
    tagline: "Forested lots backing onto Griffith Woods.",
    story: [
      "Discovery Ridge is a quiet community wrapped around Griffith Woods Park, the protected ravine and wetland system that separates it from Springbank Hill. The community is small (~1,000 homes) and was substantially built out in the early 2000s, with consistent housing-quality standards across the entire community.",
      "The defining feature is the natural amenity. Almost every street is within 200 metres of a forest trail; lots backing onto the ravine command meaningful premiums.",
    ],
    outsideCopy: [
      "Griffith Woods Park is the dominant amenity — paved and natural-surface trails, year-round access, off-leash sections.",
    ],
    amenitiesCopy: [
      "Webber Academy is a 5-minute drive. Public catchment is Olympic Heights and Ernest Manning High School.",
    ],
    shopDineCopy: [
      "Aspen Landing is a 6-minute drive. The 85 Street commercial node is closer for everyday groceries.",
    ],
    realEstateCopy: [
      "Discovery Ridge trades on forest-backing status first, lot size second. Ravine-backing lots clear $1.5-2M for finished homes; interior lots are $1.1-1.4M.",
      "The community's age-uniformity creates predictable resale and low deferred-maintenance risk.",
    ],
    lifeCopy: [
      "Discovery Ridge is family-dense and quiet. The forest network drives outdoor rhythm; community events center around the small commercial node and the school catchments.",
    ],
    quadrant: "west",
    borders: { north: "Highway 8 / Discovery Ridge Way SW", south: "Griffith Woods", east: "Sarcee Trail", west: "Discovery Ridge Boulevard" },
    schools: [
      { name: "Olympic Heights School", level: "K-6", area: "Cougar Ridge" },
      { name: "Ernest Manning High School", level: "10-12", area: "Cougar Ridge" },
      { name: "Webber Academy", level: "JK-12 (private)", area: "Aspen Woods" },
    ],
    heroImage: HERO_BANK.contemporaryHill,
    centerLat: 51.0,
    centerLng: -114.193,
    avgPrice: 1350000,
    sortOrder: 27,
  },
  {
    slug: "west-springs",
    name: "West Springs",
    tagline: "Family-dense west-side community, walkable to Aspen.",
    story: [
      "West Springs sits between Aspen Woods and Cougar Ridge, with a streetscape of post-2000 single-family homes structured around the West Springs commercial spine on 85th Street. The community is one of Calgary's most family-dense — school catchments and proximity to the Aspen private-school cluster drive consistent demand.",
      "Lot sizes are smaller than Aspen (0.10-0.18 acres) and the housing-quality standard is uniformly high. Pricing tracks Aspen at a 15-25% discount.",
    ],
    outsideCopy: [
      "West Springs Park anchors the community centre. The Bow River pathway is reachable via the 69 Street pathway.",
    ],
    amenitiesCopy: [
      "Webber Academy, Calgary Academy, Rundle College all in adjacent Aspen. Public catchment is West Springs School and Ernest Manning High.",
    ],
    shopDineCopy: [
      "85 Street's commercial strip and Aspen Landing both serve the community.",
    ],
    realEstateCopy: [
      "West Springs is the dollar-balanced westside option. Single-family pricing typically clears $1.0-1.5M. The community's family demographics keep resale times short and predictable.",
      "Lot size is the primary differentiator. Larger lots (0.15+ acres) command meaningful premiums.",
    ],
    lifeCopy: [
      "West Springs is family-dense and walkable. The community centre and the 85 Street commercial node drive daily life.",
    ],
    quadrant: "west",
    borders: { north: "Bow Trail SW", south: "17 Avenue SW", east: "69 Street SW", west: "85 Street SW" },
    schools: [
      { name: "West Springs School", level: "K-6", area: "West Springs" },
      { name: "Ernest Manning High School", level: "10-12", area: "Cougar Ridge" },
      { name: "Webber Academy", level: "JK-12 (private)", area: "Aspen Woods" },
    ],
    heroImage: HERO_BANK.westsideEstate,
    centerLat: 51.05,
    centerLng: -114.183,
    avgPrice: 1250000,
    sortOrder: 28,
  },
  {
    slug: "mahogany",
    name: "Mahogany",
    tagline: "Calgary's largest freshwater lake community.",
    story: [
      "Mahogany is Calgary's largest lake community, with a 63-acre freshwater lake at its centre and a community design oriented around water access. Built out between 2010 and 2024, the community has consistent post-2010 housing stock and one of the highest amenity-to-home ratios in Calgary.",
      "Housing ranges from townhouse and condo on the perimeter to large lakefront single-family on the lake's interior. Pricing follows water access closely.",
    ],
    outsideCopy: [
      "The lake is the dominant amenity — beach access, sailing, fishing, year-round skating. Mahogany's Beach Club is members-only for residents.",
    ],
    amenitiesCopy: [
      "Mahogany School (K-4), Divine Mercy School (K-9 Catholic), Joane Cardinal-Schubert High School (catchment).",
    ],
    shopDineCopy: [
      "Westman Village commercial node serves the community — Co-op, Diner Deluxe, Analog Coffee, several restaurants.",
    ],
    realEstateCopy: [
      "Mahogany is a lake-access market. Lakefront lots and lake-access lots command large premiums over non-lake interior lots. Single-family pricing ranges $700K (entry townhouse-style) to $3M+ (lakefront with private dock).",
      "The community's amenity package is a real value driver — the Beach Club membership transfers with the home.",
    ],
    lifeCopy: [
      "Mahogany is family-dense and amenity-driven. Summer rhythm centres on the lake; winter on the rink and Beach Club.",
    ],
    quadrant: "southeast",
    borders: { north: "52 Street SE", south: "196 Avenue SE", east: "Bow River", west: "Stoney Trail" },
    schools: [
      { name: "Mahogany School", level: "K-4", area: "Mahogany" },
      { name: "Divine Mercy School", level: "K-9 (Catholic)", area: "Mahogany" },
      { name: "Joane Cardinal-Schubert High School", level: "10-12", area: "Mahogany" },
    ],
    heroImage: HERO_BANK.modernEstate,
    centerLat: 50.8835,
    centerLng: -113.961,
    avgPrice: 850000,
    sortOrder: 29,
  },
  {
    slug: "auburn-bay",
    name: "Auburn Bay",
    tagline: "Auburn Bay Lake and the South Health Campus, side by side.",
    story: [
      "Auburn Bay sits north of Mahogany on a 43-acre freshwater lake, with the South Health Campus at its northern boundary. The community was substantially built out 2008-2018 and has uniform post-2010 housing stock.",
      "Housing is dominated by single-family and townhouse, with a small condo complement. Lake-access status is the primary value differentiator.",
    ],
    outsideCopy: [
      "Auburn Bay Lake (43 acres) anchors the community. The Bow River pathway extends south via Mahogany.",
    ],
    amenitiesCopy: [
      "Auburn Bay School (K-4) and Prince of Peace School (K-9 Catholic). The South Health Campus is a major employment anchor at the northern boundary.",
    ],
    shopDineCopy: [
      "Seton's commercial spine is a 5-minute drive — Costco, Sobeys, Cineplex, multiple restaurants.",
    ],
    realEstateCopy: [
      "Auburn Bay's value driver is lake access combined with proximity to the hospital. Single-family pricing typically clears $700-1.2M; lakefront homes can reach $2M+.",
      "The community's age uniformity and amenity package keep resale predictable.",
    ],
    lifeCopy: [
      "Auburn Bay is family-dense. The lake and hospital create distinct daytime and weekend rhythms.",
    ],
    quadrant: "southeast",
    borders: { north: "Stoney Trail SE", south: "52 Street SE", east: "Deerfoot Trail", west: "Auburn Bay Boulevard" },
    schools: [
      { name: "Auburn Bay School", level: "K-4", area: "Auburn Bay" },
      { name: "Prince of Peace School", level: "K-9 (Catholic)", area: "Auburn Bay" },
      { name: "Joane Cardinal-Schubert High School", level: "10-12", area: "Mahogany" },
    ],
    heroImage: HERO_BANK.modernEstate,
    centerLat: 50.9035,
    centerLng: -113.961,
    avgPrice: 770000,
    sortOrder: 30,
  },
];

// ============================================================
// MARQUEE CONDO BUILDINGS
// ============================================================

interface MarqueeCondo {
  slug: string;
  name: string;
  tagline: string;
  intro: string[];
  residencesCopy: string[];
  architecturalCopy: string[];
  // Long-form neighbourhood copy. Each section is its own H3 on the public
  // condo page. All optional — if omitted, the section is hidden.
  locationCopy?: string[];
  diningCopy?: string[];
  shoppingCopy?: string[];
  communityCopy?: string[];
  schoolsCopy?: string[];
  amenities: string[];
  address: string;
  neighbourhoodSlug: string;
  neighbourhood: string;
  quadrant: string;
  units?: number;
  stories?: number;
  builtIn?: number;
  developer?: string;
  architect?: string;
  lat: number;
  lng: number;
  heroImage: string;
  sortOrder: number;
  featured: boolean;
  // Optional comma-separated additional street numbers at the same street.
  // Used when a single building spans multiple addresses (e.g. The River).
  addressAliases?: string;
}

export const MARQUEE_CONDOS: MarqueeCondo[] = [
  {
    slug: "the-guardian-south",
    name: "The Guardian South Tower II",
    tagline: "Calgary's tallest residential tower, watching over the inner city.",
    intro: [
      "The Guardian South Tower II is the second of two twin towers that together form Calgary's tallest residential complex. Completed in 2016 in the Beltline's eastern quadrant, the tower rises 44 stories above the surrounding streetscape with full glass facades and a slim, vertical massing that has become a defining marker of the Calgary skyline.",
    ],
    residencesCopy: [
      "316 residential units across 44 floors, in floor plans from one-bedroom studios at roughly 410 sqft to two-bedroom corner suites over 900 sqft. Each unit features full-height windows, contemporary Italian-inspired kitchens with quartz counters, and integrated appliances.",
    ],
    architecturalCopy: [
      "Designed with sleek glass facades and a slim residential profile that maximizes views in every direction. South-facing units capture the Bow River and the Rocky Mountains; north-facing units look across the downtown core.",
    ],
    amenities: [
      "1,350 sqft Social Club lounge with adjoining garden terrace",
      "Lions Gym fitness facility with dedicated yoga studio",
      "Resident workshop with tools and workbenches",
      "Secured underground parking",
      "Bicycle storage",
      "24/7 concierge",
      "Three high-speed elevators",
    ],
    address: "1188 3 Street SE, Calgary, AB T2G 1H8",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 316,
    stories: 44,
    builtIn: 2016,
    developer: "Hon Towers",
    architect: "Lemay",
    lat: 51.043,
    lng: -114.058,
    heroImage: "/condo-heroes/the-guardian-south.png",
    sortOrder: 1,
    featured: true,
  },
  {
    slug: "the-guardian-north",
    name: "The Guardian North Tower 1",
    tagline: "The first of Calgary's tallest residential twins.",
    intro: [
      "The Guardian North Tower 1, completed a year ahead of its twin, opened in 2015 as the first half of the Guardian project. The 44-story tower introduced a new vertical scale to the Beltline and immediately became one of Calgary's most-photographed residential buildings.",
    ],
    residencesCopy: [
      "316 residential units across 44 floors, in one-bedroom and two-bedroom configurations averaging 500-900 sqft. Italian-inspired kitchens with quartz counters and stainless appliances; floor-to-ceiling glazing throughout.",
    ],
    architecturalCopy: [
      "Identical massing to the South Tower II, with the two buildings flanking 11 Avenue SE as a paired marker of the Beltline's eastern edge. Designed by Lemay.",
    ],
    amenities: [
      "Social Club lounge",
      "Lions Gym fitness facility",
      "Yoga studio",
      "Workshop",
      "Secured parking",
      "Bicycle storage",
      "24/7 concierge",
    ],
    address: "1122 3 Street SE, Calgary, AB T2G 1H7",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 316,
    stories: 44,
    builtIn: 2015,
    developer: "Hon Towers",
    architect: "Lemay",
    lat: 51.0435,
    lng: -114.058,
    heroImage: "/condo-heroes/the-guardian-north.png",
    sortOrder: 2,
    featured: true,
  },
  {
    slug: "the-royal",
    name: "The Royal",
    tagline: "Beltline's premium residential address on 17th Avenue.",
    intro: [
      "The Royal is a 36-story luxury tower at the corner of 8 Street and 16 Avenue SW, completed in 2020 by Embassy BOSA. The building defined a new tier in Beltline residential — full-service concierge, retail and dining at street level, and a residential floor plate calibrated to family-scale living rather than investor units.",
    ],
    residencesCopy: [
      "236 residential units in one-bedroom, two-bedroom, and three-bedroom configurations. Larger floor plans (1,200-2,500 sqft) with chef's kitchens, full laundry rooms, and engineered hardwood floors throughout.",
    ],
    architecturalCopy: [
      "Designed by IBI Group with a precast and glass facade that integrates with the 17 Avenue commercial scale. Three retail bays at street level house Urban Fare and complementary tenants.",
    ],
    amenities: [
      "24/7 concierge and security",
      "Fitness centre with weights and cardio rooms",
      "Yoga and barre studio",
      "Owner's lounge with kitchen and patio",
      "Pet wash",
      "Bicycle storage and repair room",
      "Secure underground parking with EV chargers",
      "Guest suites",
    ],
    address: "930 16 Avenue SW, Calgary, AB T2R 0R2",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 236,
    stories: 36,
    builtIn: 2020,
    developer: "Embassy BOSA",
    architect: "IBI Group",
    lat: 51.0398,
    lng: -114.084,
    heroImage: "/condo-heroes/the-royal.png",
    sortOrder: 3,
    featured: true,
  },
  {
    slug: "le-germain",
    name: "Le Germain",
    tagline: "Boutique-hotel-grade living above Calgary's downtown.",
    intro: [
      "Le Germain is a hybrid hotel + condo project at 9 Avenue and Centre Street SW, completed in 2010. The lower floors operate as the Hotel Le Germain Calgary; the upper floors house 30 high-end private residences with full concierge service from the hotel staff.",
    ],
    residencesCopy: [
      "30 private residences across the upper floors. Floor plans range from compact one-bedroom suites to multi-floor penthouses. Each unit benefits from the hotel's amenity package and concierge.",
    ],
    architecturalCopy: [
      "Designed by Lemay with a contemporary glass and copper-toned facade. The hotel-residence fusion was a first for Calgary at the time of completion.",
    ],
    amenities: [
      "Hotel concierge service",
      "Access to hotel fitness facility and spa",
      "Restaurant and bar (Charcut Roast House)",
      "24/7 valet parking",
      "Housekeeping available",
      "+15 walkway access",
    ],
    address: "108 9 Avenue SW, Calgary, AB T2P 1J6",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Eau Claire",
    quadrant: "city-centre",
    units: 30,
    stories: 18,
    builtIn: 2010,
    developer: "Group Germain",
    architect: "Lemay",
    lat: 51.046,
    lng: -114.0665,
    heroImage: "/condo-heroes/le-germain.png",
    sortOrder: 4,
    featured: true,
  },
  {
    slug: "princeton-grand",
    name: "Princeton Grand",
    tagline: "Eau Claire's most established luxury address.",
    intro: [
      "Princeton Grand sits on the north side of 1 Street SW between Eau Claire and the river, completed in 2009 as the high-end anchor of the Princeton complex. The building is one of the most consistent hold-value condo addresses in Calgary, with most original owners still in residence.",
    ],
    residencesCopy: [
      "Larger floor plans (typically 1,200-2,800 sqft) with two- and three-bedroom configurations. Full-height windows, granite kitchens, and gas fireplaces in most units.",
    ],
    architecturalCopy: [
      "Designed with a refined post-modern brick and glass facade that reads more European than contemporary. The building integrates carefully into the Eau Claire low-rise residential character.",
    ],
    amenities: [
      "24/7 concierge",
      "Fitness centre",
      "Indoor pool",
      "Owner's lounge with kitchen and dining room",
      "Guest suites",
      "Underground parking",
      "Storage lockers",
      "Direct river-pathway access",
    ],
    address: "600 Princeton Way SW, Calgary, AB T2P 5N4",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Eau Claire",
    quadrant: "city-centre",
    units: 110,
    stories: 14,
    builtIn: 2009,
    lat: 51.0517,
    lng: -114.073,
    heroImage: "/condo-heroes/princeton-grand.png",
    sortOrder: 5,
    featured: true,
  },
  {
    slug: "point-on-the-bow",
    name: "Point on the Bow",
    tagline: "Riverfront living at the western tip of Eau Claire.",
    intro: [
      "Point on the Bow occupies a prime riverfront site at the western edge of Eau Claire, completed in 2009. Most units capture direct Bow River views, with the upper floors looking west to the foothills.",
    ],
    residencesCopy: [
      "Floor plans skew larger (1,000-2,500 sqft). Two- and three-bedroom configurations dominate. Full-height river-facing windows; granite kitchens; gas fireplaces.",
    ],
    architecturalCopy: [
      "Designed to maximize riverfront orientation. The C-shaped massing creates an interior courtyard and gives nearly every unit some river or skyline view.",
    ],
    amenities: [
      "24/7 concierge",
      "Fitness centre",
      "Indoor pool and hot tub",
      "Owner's lounge",
      "Guest suite",
      "Underground parking",
      "Direct pathway access",
    ],
    address: "837 2 Avenue SW, Calgary, AB T2P 0E6",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Eau Claire",
    quadrant: "city-centre",
    units: 110,
    stories: 19,
    builtIn: 2009,
    lat: 51.052,
    lng: -114.082,
    heroImage: "/condo-heroes/point-on-the-bow.png",
    sortOrder: 6,
    featured: true,
  },
  {
    slug: "the-concord",
    name: "The Concord",
    tagline: "Calgary's most expensive residential address per square foot.",
    intro: [
      "The Concord is a low-rise luxury condominium on Eau Claire's western edge, completed in 2017. Among the most expensive Calgary residential addresses per square foot, the building was designed for a small number of large floor plans and finished to a hotel-grade standard.",
    ],
    residencesCopy: [
      "60 residences across 6 floors, with floor plans typically 1,800-5,000 sqft. Two- and three-bedroom configurations dominate; several penthouses occupy entire half-floors.",
    ],
    architecturalCopy: [
      "Designed by Arthur Erickson Architectural Corporation (one of Erickson's last residential projects) with a refined glass and limestone facade.",
    ],
    amenities: [
      "24/7 concierge and valet",
      "Indoor pool, hot tub, and steam room",
      "Fully equipped fitness centre",
      "Resident's lounge with full chef's kitchen",
      "Wine cellar",
      "Boardroom",
      "Guest suite",
      "Underground parking with car wash",
      "Direct Bow River pathway access",
    ],
    address: "738 1 Avenue SW, Calgary, AB T2P 5G8",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Eau Claire",
    quadrant: "city-centre",
    units: 60,
    stories: 6,
    builtIn: 2017,
    developer: "Concord Pacific",
    architect: "Arthur Erickson Architectural Corporation",
    lat: 51.0525,
    lng: -114.082,
    heroImage: "/condo-heroes/the-concord.png",
    sortOrder: 7,
    featured: true,
  },
  {
    slug: "park-point",
    name: "Park Point",
    tagline: "Beltline's mid-rise luxury overlooking Central Memorial Park.",
    intro: [
      "Park Point overlooks Central Memorial Park at 12 Avenue and 4 Street SW, completed in 2018. The building introduced a new tier of mid-rise luxury to the Beltline, with full-floor and half-floor units and amenity spaces designed to support family-scale living.",
    ],
    residencesCopy: [
      "289 units across 34 floors. Floor plans run from 600 sqft one-bedrooms to 2,500+ sqft penthouses. Quartz kitchens, integrated Miele appliances, engineered hardwood throughout.",
    ],
    architecturalCopy: [
      "Designed by IBI Group. Glass and metal facade with a stepped massing that gives upper floors south-facing terraces overlooking the park.",
    ],
    amenities: [
      "24/7 concierge",
      "Fitness centre and yoga studio",
      "Owner's lounge with chef's kitchen",
      "Steam room and sauna",
      "Pet wash",
      "Bicycle storage and repair room",
      "Underground parking",
      "Park-side terrace",
    ],
    address: "1118 12 Avenue SW, Calgary, AB T2R 0P4",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 289,
    stories: 34,
    builtIn: 2018,
    developer: "QuallEx Development",
    architect: "IBI Group",
    lat: 51.0395,
    lng: -114.087,
    heroImage: "/condo-heroes/park-point.png",
    sortOrder: 8,
    featured: true,
  },
  {
    slug: "drake",
    name: "Drake",
    tagline: "Beltline's design-forward boutique tower.",
    intro: [
      "Drake is a 30-story luxury tower at 5 Street and 17 Avenue SW, completed in 2018. The building emphasizes design-forward finishes and a curated amenity package — smaller in scale than The Royal but in the same Beltline luxury tier.",
    ],
    residencesCopy: [
      "200+ units across 30 floors in compact one-bedroom (550-700 sqft) through two-bedroom plus den (900-1,200 sqft) configurations.",
    ],
    architecturalCopy: [
      "Sleek glass facade with bronze accents. Designed for the Beltline's young-professional demographic.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Owner's lounge",
      "Pet wash",
      "Bike storage",
      "Underground parking",
    ],
    address: "210 15 Avenue SW, Calgary, AB T2R 0P9",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 220,
    stories: 30,
    builtIn: 2018,
    lat: 51.0405,
    lng: -114.077,
    heroImage: "/condo-heroes/drake.png",
    sortOrder: 9,
    featured: true,
  },
  {
    slug: "smith",
    name: "Smith",
    tagline: "Boutique 14-story address on 14 Avenue.",
    intro: [
      "Smith is a smaller boutique tower at 102 14 Avenue SW, completed in 2017. The 14-floor building has a tight unit count and a mid-tier luxury amenity package, sitting in the Beltline's quieter southern blocks.",
    ],
    residencesCopy: [
      "Approximately 200 units across 14 floors. Compact one-bedroom and two-bedroom plans with quartz kitchens and engineered hardwood.",
    ],
    architecturalCopy: [
      "Glass and steel facade with a precast accent band. Designed for the same young-professional buyer as Drake but at a slightly lower price point.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Owner's lounge with kitchen",
      "Bike storage",
      "Underground parking",
    ],
    address: "102 14 Avenue SW, Calgary, AB T2R 0X7",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 200,
    stories: 14,
    builtIn: 2017,
    lat: 51.041,
    lng: -114.071,
    heroImage: "/condo-heroes/smith.png",
    sortOrder: 10,
    featured: true,
  },
  {
    slug: "vogue",
    name: "Vogue",
    tagline: "Downtown's tallest residential tower at 36 floors.",
    intro: [
      "Vogue is a 36-story tower at 6 Avenue and 9 Street SW in the Downtown West End, completed in 2017. The building is the tallest pure-residential tower in the downtown core and sits directly above the C-Train station for transit access into the central business district.",
    ],
    residencesCopy: [
      "Approximately 360 units across 36 floors. One-, two-, and three-bedroom configurations from 500 to 1,400 sqft. Sub-zero appliances and quartz counters in larger units.",
    ],
    architecturalCopy: [
      "Designed by IBI Group with a glass curtain wall and a slim residential massing.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Indoor pool and hot tub",
      "Steam room",
      "Owner's lounge",
      "Pet wash",
      "Bike storage",
      "Underground parking with EV chargers",
      "Direct C-Train access",
    ],
    address: "930 6 Avenue SW, Calgary, AB T2P 5K7",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Downtown West End",
    quadrant: "city-centre",
    units: 360,
    stories: 36,
    builtIn: 2017,
    developer: "La Caille Group",
    architect: "IBI Group",
    lat: 51.048,
    lng: -114.086,
    heroImage: "/condo-heroes/vogue.png",
    sortOrder: 11,
    featured: true,
  },
  {
    slug: "five-west-phase-i",
    name: "Five West Phase I",
    tagline: "Downtown West End's polished residential anchor.",
    intro: [
      "Five West Phase I is a 27-story tower at 5 Avenue and 9 Street SW, completed in 2007. The building helped catalyze the Downtown West End's transition from commercial to mixed residential and remains one of the area's most established condo addresses.",
    ],
    residencesCopy: [
      "Approximately 200 units across 27 floors. Floor plans range from 500 sqft one-bedrooms to 1,800 sqft two-bedroom-plus-den.",
    ],
    architecturalCopy: [
      "Glass curtain wall with a tapered upper massing. The building paired with Phase II to define a new residential corridor along 5 Avenue.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Indoor pool",
      "Owner's lounge",
      "Underground parking",
      "Bike storage",
    ],
    address: "920 5 Avenue SW, Calgary, AB T2P 5N1",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Downtown West End",
    quadrant: "city-centre",
    units: 200,
    stories: 27,
    builtIn: 2007,
    lat: 51.0488,
    lng: -114.085,
    heroImage: "/condo-heroes/five-west-phase-i.png",
    sortOrder: 12,
    featured: false,
  },
  {
    slug: "evolution-pulse",
    name: "Evolution Pulse",
    tagline: "East Village's flagship residential project.",
    intro: [
      "Evolution Pulse is one of three towers in the Evolution complex in East Village, completed in 2014. The project anchored East Village's residential rebirth and brought the first significant density to the area in over a generation.",
    ],
    residencesCopy: [
      "Floor plans range from 450 sqft studios to 1,400 sqft three-bedrooms. Quartz kitchens, integrated appliances, full-height windows.",
    ],
    architecturalCopy: [
      "Designed by S2 Architecture with a glass and metal facade. The building's lower-floor amenities open directly to the East Village riverside boardwalk.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Owner's lounge",
      "Pet wash",
      "Bike storage",
      "Underground parking",
      "Direct East Village riverwalk access",
    ],
    address: "510 6 Avenue SE, Calgary, AB T2G 1L7",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Downtown East Village",
    quadrant: "city-centre",
    units: 250,
    stories: 27,
    builtIn: 2014,
    developer: "Embassy BOSA",
    lat: 51.046,
    lng: -114.054,
    heroImage: "/condo-heroes/evolution-pulse.png",
    sortOrder: 13,
    featured: true,
  },
  {
    slug: "verve",
    name: "Verve",
    tagline: "East Village's design-forward later-phase tower.",
    intro: [
      "Verve, completed in 2019 in East Village, is one of the area's newer and more design-driven residential towers. The building emphasizes amenity quality and a younger demographic appeal.",
    ],
    residencesCopy: [
      "Approximately 290 units in compact studio through two-bedroom configurations. Strong amenity package; quartz kitchens; full-height windows.",
    ],
    architecturalCopy: [
      "Sleek glass facade with a slim residential massing. Sits adjacent to the National Music Centre and Studio Bell.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Yoga studio",
      "Owner's lounge",
      "Outdoor terrace with views",
      "Bike storage",
      "Underground parking",
    ],
    address: "615 6 Avenue SE, Calgary, AB T2G 1S2",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Downtown East Village",
    quadrant: "city-centre",
    units: 290,
    stories: 25,
    builtIn: 2019,
    lat: 51.046,
    lng: -114.052,
    heroImage: "/condo-heroes/verve.png",
    sortOrder: 14,
    featured: false,
  },
  {
    slug: "avenue",
    name: "Avenue",
    tagline: "Downtown West End's amenity-focused mid-rise.",
    intro: [
      "Avenue is a 14-story mid-rise on 5 Avenue SW, completed in 2017. The building sits in the Downtown West End's residential cluster and offers a mid-tier amenity package at a more accessible price point than the higher-end towers.",
    ],
    residencesCopy: [
      "Approximately 160 units. One- and two-bedroom configurations from 500-1,100 sqft.",
    ],
    architecturalCopy: [
      "Glass facade with a precast podium. Designed for everyday luxury rather than tier-1 prestige.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Owner's lounge",
      "Bike storage",
      "Underground parking",
    ],
    address: "1025 5 Avenue SW, Calgary, AB T2P 1N4",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Downtown West End",
    quadrant: "city-centre",
    units: 160,
    stories: 14,
    builtIn: 2017,
    lat: 51.0488,
    lng: -114.088,
    heroImage: "/condo-heroes/avenue.png",
    sortOrder: 15,
    featured: false,
  },
  {
    slug: "the-mark",
    name: "Mark on 10th",
    tagline: "Beltline's high-density 35-floor tower.",
    intro: [
      "Mark on 10th is a 35-story tower at 10 Avenue and 6 Street SW, completed in 2017. One of the Beltline's tallest residential buildings, the tower sits at the intersection of the daytime business district and the residential community south of 10 Avenue.",
    ],
    residencesCopy: [
      "Approximately 320 units. Compact studios through two-bedroom configurations.",
    ],
    architecturalCopy: [
      "Glass curtain wall with a slim massing. Strong views in every direction from upper floors.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Owner's lounge",
      "Bike storage",
      "Underground parking",
    ],
    address: "510 6 Street SW, Calgary, AB T2P 0M6",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 320,
    stories: 35,
    builtIn: 2017,
    lat: 51.045,
    lng: -114.075,
    heroImage: "/condo-heroes/the-mark.png",
    sortOrder: 16,
    featured: false,
  },
  {
    slug: "vetro",
    name: "Vetro",
    tagline: "Beltline's strong-fundamentals investment building.",
    intro: [
      "Vetro is a 38-story tower at the corner of 12 Avenue and 5 Street SE, completed in 2009. One of the Beltline's largest residential buildings by unit count, Vetro has been a consistent rental and resale market for over a decade.",
    ],
    residencesCopy: [
      "Approximately 460 units. Compact one-bedroom (450-600 sqft) plans dominate; two-bedrooms run 700-1,000 sqft.",
    ],
    architecturalCopy: [
      "Glass and metal curtain wall. The building's eastern Beltline location captures Stampede Park views.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Indoor pool and hot tub",
      "Steam room",
      "Owner's lounge",
      "Bike storage",
      "Underground parking",
    ],
    address: "1320 1 Street SE, Calgary, AB T2G 0G8",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 460,
    stories: 38,
    builtIn: 2009,
    lat: 51.0405,
    lng: -114.062,
    heroImage: "/condo-heroes/vetro.png",
    sortOrder: 17,
    featured: false,
  },
  {
    slug: "park-place",
    name: "Park Place",
    tagline: "One of Beltline's earliest mid-rise residential addresses.",
    intro: [
      "Park Place is a 26-story residential tower at 13 Avenue and 1 Street SW, completed in 2008. One of the Beltline's earlier high-rise residential buildings, Park Place established the precedent for the wave of luxury condos that followed.",
    ],
    residencesCopy: [
      "Approximately 180 units in mid- to large-format floor plans (700-1,800 sqft).",
    ],
    architecturalCopy: [
      "Glass and precast facade. The building's location across from Central Memorial Park gives most upper-floor units park views.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Indoor pool",
      "Owner's lounge",
      "Underground parking",
    ],
    address: "215 13 Avenue SW, Calgary, AB T2R 0V1",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 180,
    stories: 26,
    builtIn: 2008,
    lat: 51.041,
    lng: -114.073,
    heroImage: "/condo-heroes/park-place.png",
    sortOrder: 18,
    featured: false,
  },
  {
    slug: "keynote",
    name: "Keynote One",
    tagline: "Beltline's full-block residential complex over Sunterra Market.",
    intro: [
      "Keynote One is part of the Keynote complex on 12 Avenue SE, completed in 2010. The 36-story building sits above a Sunterra Market and full retail podium, giving residents direct grocery and dining access.",
    ],
    residencesCopy: [
      "Approximately 270 units in studio through three-bedroom configurations.",
    ],
    architecturalCopy: [
      "Glass curtain wall with a stepped upper massing. The building's full-block site allowed for a particularly large amenity floor plate.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Indoor pool and hot tub",
      "Steam room",
      "Owner's lounge",
      "Sunterra Market at street level",
      "Underground parking",
    ],
    address: "135 13 Avenue SE, Calgary, AB T2G 0R1",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 270,
    stories: 36,
    builtIn: 2010,
    developer: "Embassy BOSA",
    lat: 51.04,
    lng: -114.062,
    heroImage: "/condo-heroes/keynote.png",
    sortOrder: 19,
    featured: false,
  },
  {
    slug: "parkside-at-waterfront",
    name: "Parkside at Waterfront",
    tagline: "Eau Claire riverfront mid-rise on Princes Island.",
    intro: [
      "Parkside at Waterfront sits on the river-pathway side of Eau Claire near the Peace Bridge, completed in 2014. The building is part of the Anthem Properties Waterfront masterplan and offers direct pathway access along with full-service amenities.",
    ],
    residencesCopy: [
      "Approximately 140 units in mid- to large-format configurations. Many units capture direct river views.",
    ],
    architecturalCopy: [
      "Mid-rise glass and metal facade with a residential massing that integrates carefully into the Eau Claire low-rise streetscape.",
    ],
    amenities: [
      "Concierge",
      "Fitness centre",
      "Owner's lounge",
      "Bike storage",
      "Underground parking",
      "Direct river-pathway access",
    ],
    address: "108 Waterfront Court SW, Calgary, AB T2P 1K7",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Eau Claire",
    quadrant: "city-centre",
    units: 140,
    stories: 14,
    builtIn: 2014,
    developer: "Anthem Properties",
    lat: 51.0535,
    lng: -114.077,
    heroImage: "/condo-heroes/parkside-at-waterfront.png",
    sortOrder: 20,
    featured: true,
  },
  // ---------- 11 condos imported from luxuryhomescalgary.ca ----------
  {
    slug: "residences-of-king-edward",
    name: "Residences of King Edward",
    tagline: "Boutique heritage residences on the former King Edward School site in South Calgary.",
    intro: [
      "Residences of King Edward is a rare boutique luxury living experience in Calgary's South Calgary neighbourhood, just steps from the vibrant Marda Loop district. Developed by Rockwood Custom Homes and completed in 2018, this intimate 3-storey residence at 3030 17 Street SW houses just 18 luxury single-level flats — each crafted with meticulous attention to detail.",
    ],
    residencesCopy: [
      "Single-level luxury flats with premium finishes throughout, designed for residents seeking quiet, low-density inner-city living. Generous floorplans, high ceilings, and oversized windows showcase the meticulous craftsmanship Rockwood Custom Homes is known for.",
    ],
    architecturalCopy: [
      "The building's coursed ashlar facade honours the former King Edward School that occupied this site since 1895. The exterior features natural sandstone in both split-faced and smooth-faced finishes, crowned by a front entrance cornice weighing over 25,000 pounds of custom-carved stone — a heritage-inspired design that blends historical character with contemporary luxury.",
    ],
    amenities: ["Heritage sandstone exterior", "Single-level flats", "Underground parking", "Bike storage", "Secure entry", "Steps to Marda Loop"],
    address: "3030 17 Street SW, Calgary, AB",
    neighbourhoodSlug: "south-calgary",
    neighbourhood: "South Calgary",
    quadrant: "city-centre",
    units: 18,
    stories: 3,
    builtIn: 2018,
    developer: "Rockwood Custom Homes",
    lat: 51.0245,
    lng: -114.0937,
    heroImage: "/condo-heroes/residences-of-king-edward.png",
    sortOrder: 22,
    featured: true,
  },
  {
    slug: "princeton-hall",
    name: "Princeton Hall",
    tagline: "Pinnacle of luxury condominium living in Calgary's coveted Eau Claire neighbourhood.",
    intro: [
      "Princeton Hall represents the pinnacle of luxury condominium living in Calgary's coveted Eau Claire neighbourhood. Located at 690 Princeton Way SW, this exclusive 14-storey residence was originally completed in 2002 by Princeton Developments and underwent a comprehensive renovation from 2012 to 2015, transforming it into a contemporary masterpiece.",
    ],
    residencesCopy: [
      "Princeton Hall houses just 43 suites — with the majority occupying full or half floors — creating an exceptionally private living environment. Interiors carry premium finishes throughout, with multiple terraces, gas fireplaces, and chef-grade kitchens common across the upper-floor residences.",
    ],
    architecturalCopy: [
      "The building's post-renovation contemporary design combines refined aesthetics with premium construction quality. Condo fees include heat, air conditioning, and heated underground parking with a dedicated car wash facility.",
    ],
    amenities: ["Concierge", "Heated underground parking", "Car wash facility", "Heat + AC included", "Storage lockers", "Adjacent to Bow River pathway"],
    address: "690 Princeton Way SW, Calgary, AB",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Eau Claire",
    quadrant: "city-centre",
    units: 43,
    stories: 14,
    builtIn: 2002,
    developer: "Princeton Developments",
    lat: 51.0498,
    lng: -114.0782,
    heroImage: "/condo-heroes/princeton-hall.png",
    sortOrder: 23,
    featured: true,
  },
  {
    slug: "reflection-westman-village",
    name: "Reflection — Westman Village",
    tagline: "Boutique lakefront residences inside Westman Village, Western Canada's premier lakeside community.",
    intro: [
      "Reflection at Westman Village delivers an unparalleled lakefront luxury experience in Calgary's master-planned Mahogany community. Developed by Jayman BUILT and completed in 2018, Reflection is part of the award-winning 13.6-acre Westman Village — Western Canada's premier lakeside residential community.",
    ],
    residencesCopy: [
      "Reflection is a boutique 4-storey residence housing 54 luxury suites within Westman Village's interconnected campus of five 6-storey buildings. Layouts emphasize natural light and views over Mahogany Lake and the surrounding wetlands.",
    ],
    architecturalCopy: [
      "The contemporary West Coast-inspired design features clean lines, earth tones, and natural wood accents with low-pitch rooflines. A Mitsubishi Electric HVAC system — recognized as the largest Canadian multi-unit residential village installation — provides efficient climate control year-round. All buildings are connected by heated underground pathways and +15 skywalks.",
    ],
    amenities: ["Indoor saltwater pool", "Fitness centre", "Theatre room", "Art studio", "Wine room", "Private dining", "Direct beach access (Mahogany Lake)", "+15 skywalks between buildings", "Underground parking"],
    address: "30 Mahogany Mews SE, Calgary, AB",
    neighbourhoodSlug: "mahogany",
    neighbourhood: "Mahogany",
    quadrant: "se",
    units: 54,
    stories: 4,
    builtIn: 2018,
    developer: "Jayman BUILT",
    lat: 50.9094,
    lng: -113.9442,
    heroImage: "/condo-heroes/reflection-westman-village.png",
    sortOrder: 24,
    featured: true,
  },
  {
    slug: "the-montana",
    name: "The Montana",
    tagline: "27-storey contemporary tower and Beltline landmark on 15th Avenue SW.",
    intro: [
      "The Montana is one of Calgary's premier boutique luxury condominium residences in the heart of the Beltline. Located at 817 15 Avenue SW, this striking 27-storey contemporary tower was completed in 2009 by ProCura Real Estate Services and has become a landmark of upscale inner-city living.",
    ],
    residencesCopy: [
      "Generous one and two-bedroom layouts with floor-to-ceiling windows, hardwood floors, and gas fireplaces. Most units have private balconies framing downtown skyline views or quieter south-facing exposures.",
    ],
    architecturalCopy: [
      "Sleek concrete-and-glass tower designed for the Beltline corridor, with retail at street level and 27 stories of residences above. ProCura Real Estate Services anchored its reputation in Calgary with this build.",
    ],
    amenities: ["Concierge", "Fitness room", "Underground heated parking", "Visitor parking", "Bicycle storage", "Secure entry"],
    address: "817 15 Avenue SW, Calgary, AB",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    stories: 27,
    builtIn: 2009,
    developer: "ProCura Real Estate Services",
    lat: 51.0394,
    lng: -114.0742,
    heroImage: "/condo-heroes/the-montana.png",
    sortOrder: 25,
    featured: true,
  },
  {
    slug: "princes-island-estates",
    name: "Prince's Island Estates",
    tagline: "Exclusive gated riverside community in Calgary's prestigious Eau Claire neighbourhood.",
    intro: [
      "Prince's Island Estates offers an exclusive gated living experience in Calgary's prestigious Eau Claire neighbourhood. This boutique condominium community at 400 Eau Claire Avenue SW was developed by Trizec Properties and designed by Graham Edmunds Architects, creating one of the most sought-after riverside addresses in the city.",
    ],
    residencesCopy: [
      "Prince's Island Estates houses 94 unique residences — very few of which share identical floor plans. Spacious estate-sized layouts feature multiple terraces, premium appliances, and direct elevator access on most floors. The complex rises to 8 storeys plus a loft level.",
    ],
    architecturalCopy: [
      "Four elegant brick-clad buildings arranged around a gated centre courtyard with a circular driveway, buffered by mature trees and landscaped walkways. The exterior features a sophisticated brick and stucco facade with metal-clad wood windows, built on concrete foundations.",
    ],
    amenities: ["Gated entry + concierge", "Underground heated parking", "Centre courtyard with circular driveway", "Mature landscaped grounds", "Direct elevator access", "Adjacent to Prince's Island Park", "Bow River pathway access"],
    address: "400 Eau Claire Avenue SW, Calgary, AB",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Eau Claire",
    quadrant: "city-centre",
    units: 94,
    stories: 8,
    developer: "Trizec Properties",
    architect: "Graham Edmunds Architects",
    lat: 51.0494,
    lng: -114.0717,
    heroImage: "https://luxuryhomescalgary.ca/wp-content/uploads/2024/08/princes-island-estates-eau-claire-calgary.jpg",
    sortOrder: 26,
    featured: true,
  },
  {
    slug: "the-views",
    name: "The Views",
    tagline: "15-storey concrete high-rise (also known as Liberté) on the edge of Eau Claire.",
    intro: [
      "The Views condos for sale offer stylish urban living in one of Calgary's most desirable Eau Claire locations. Rising 15 storeys at 804 3 Avenue SW, The Views (also known as Liberté) was completed by Bosa Developments and has become a sought-after address for those seeking river-view living with walkable downtown convenience.",
    ],
    residencesCopy: [
      "Large one, two, and three-bedroom plans with full-height south-facing windows, hardwood floors, and large balconies. Distinctive well-rounded balconies set the building apart from neighbouring towers.",
    ],
    architecturalCopy: [
      "The Views is a concrete high-rise featuring a fresh, contemporary design with distinctive architectural elements. The building's unique layout includes crossover floors on the 5th, 9th, and 13th levels connected by glass walkways, along with signature well-rounded balconies. South-facing expansive windows flood suites with natural light throughout the day.",
    ],
    amenities: ["24/7 concierge", "Indoor pool", "Fitness centre", "Steam room", "Sauna", "Underground heated parking", "Visitor parking", "Bicycle storage"],
    address: "804 3 Avenue SW, Calgary, AB",
    neighbourhoodSlug: "eau-claire",
    neighbourhood: "Eau Claire",
    quadrant: "city-centre",
    stories: 15,
    developer: "Bosa Developments",
    lat: 51.0497,
    lng: -114.0738,
    heroImage: "/condo-heroes/the-views.png",
    sortOrder: 27,
    featured: true,
  },
  {
    slug: "covenant-house",
    name: "Covenant House",
    tagline: "Boutique low-rise in Eagle Ridge — traditional architecture, generous floorplans, established luxury.",
    intro: [
      "Covenant House is a boutique low-rise condominium located in the prestigious community of Eagle Ridge in Southwest Calgary. Known for its traditional architectural character and spacious layouts, this exclusive building offers a refined residential experience for buyers seeking privacy, security, and long-term value in one of Calgary's most established luxury neighbourhoods.",
    ],
    residencesCopy: [
      "Spacious residences with generous floorplans, large windows, and private terraces — designed to deliver single-family comfort within a low-density condominium setting. The building's lower-rise format keeps the resident community small and the atmosphere intimate.",
    ],
    architecturalCopy: [
      "Covenant House features classic architectural styling that blends seamlessly with the mature, tree-lined surroundings of Eagle Ridge. The design emphasizes understated elegance rather than high-rise density, creating a quieter and more intimate atmosphere compared to downtown condominium towers.",
    ],
    amenities: ["Boutique low-rise", "Generous private terraces", "Underground parking", "Secure entry", "Storage lockers", "Mature Eagle Ridge setting"],
    address: "Eagle Ridge, Calgary, AB",
    neighbourhoodSlug: "eagle-ridge",
    neighbourhood: "Eagle Ridge",
    quadrant: "city-centre",
    lat: 51.0040,
    lng: -114.0828,
    heroImage: "https://luxuryhomescalgary.ca/wp-content/uploads/2025/10/covenant-house.jpeg",
    sortOrder: 28,
    featured: true,
  },
  {
    slug: "lincoln",
    name: "Lincoln",
    tagline: "Calgary's newest landmark luxury high-rise — 36 storeys by Truman in the heart of the Beltline.",
    intro: [
      "Lincoln represents Calgary's newest landmark luxury high-rise, developed by Truman in the heart of the Beltline. Rising 36 storeys at 301 11 Avenue SW, Lincoln brings approximately 274 meticulously designed residences to one of Calgary's most walkable neighbourhoods, with a Walk Score of 98/100.",
    ],
    residencesCopy: [
      "Open-plan one and two-bedroom residences with floor-to-ceiling windows, quartz counters, and integrated appliances. Higher-floor units capture sweeping downtown skyline and Rocky Mountain views from the building's 36-storey profile.",
    ],
    architecturalCopy: [
      "Lincoln is a modern concrete high-rise designed by NORR Architects, featuring a sleek contemporary facade that complements the Beltline's evolving urban landscape. The design emphasizes clean lines, expansive glazing, and premium materials — setting a new benchmark for the Lincoln Calgary condominium experience.",
    ],
    amenities: ["Concierge", "Fitness facility", "Underground heated parking", "Visitor parking", "Bicycle storage", "Pet-friendly", "Walk Score 98/100"],
    address: "301 11 Avenue SW, Calgary, AB",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 274,
    stories: 36,
    developer: "Truman",
    architect: "NORR Architects",
    lat: 51.0438,
    lng: -114.0712,
    heroImage: "/condo-heroes/lincoln.png",
    sortOrder: 29,
    featured: true,
  },
  {
    slug: "arriva",
    name: "Arriva",
    tagline: "34-storey concrete high-rise in Beltline / Victoria Park — executive-scale layouts with downtown convenience.",
    intro: [
      "Arriva is a 34-storey concrete high-rise in Calgary's Beltline / Victoria Park (433 11 Avenue SE), known for its clean modern architecture, floor-to-ceiling glass, and larger executive-scale layouts compared to many newer downtown towers. With a reputation for strong construction and privacy, Arriva appeals to buyers who want downtown convenience without compromising on space and quiet.",
      "With only approximately 164 units across 34 storeys, Arriva offers a more private ownership experience while still delivering true walkability to downtown offices, restaurants, transit, and major entertainment venues.",
    ],
    residencesCopy: [
      "Larger executive-scale one and two-bedroom residences with floor-to-ceiling windows, integrated appliances, quartz counters, and private balconies. Lower density per floor (vs. newer downtown towers) means more privacy and quieter common areas.",
    ],
    architecturalCopy: [
      "Concrete high-rise built for durability and acoustic separation. The clean modern facade reads as a slim downtown tower, with full-height glazing maximizing daylight and skyline views.",
    ],
    amenities: ["24/7 concierge", "Fitness facility", "Yoga studio", "Resident lounge", "Underground heated parking", "Bicycle storage", "Visitor parking"],
    address: "433 11 Avenue SE, Calgary, AB",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline / Victoria Park",
    quadrant: "city-centre",
    units: 164,
    stories: 34,
    lat: 51.0440,
    lng: -114.0568,
    heroImage: "https://luxuryhomescalgary.ca/wp-content/uploads/2024/08/dsc09521-hdr-1.jpg",
    sortOrder: 30,
    featured: true,
  },
  {
    slug: "arris-residences",
    name: "Arris Residences",
    tagline: "East Village twin towers, the largest residential build of its generation.",
    intro: [
      "Arris is the residential centrepiece of Calgary's East Village renewal — a pair of luxury towers above retail, developed by Bosa Properties. The towers contain hundreds of residences and are anchored by an Urban Fare grocery store at street level, plus extensive in-building amenities.",
    ],
    residencesCopy: [
      "One, two, and three-bedroom residences with full-height windows, premium kitchens, integrated appliances, and large balconies. Penthouse residences span the upper floors with sweeping Bow River and downtown views.",
    ],
    architecturalCopy: [
      "Two interconnected residential towers above a retail podium, defining the southwest corner of East Village. Modern glass-and-concrete language with extensive ground-floor activation.",
    ],
    amenities: ["24/7 concierge", "Indoor pool", "Hot tub", "Fitness centre", "Spin studio", "Yoga room", "Resident lounge", "Theatre room", "Pet wash station", "Outdoor terrace", "On-site Urban Fare grocery", "Underground heated parking"],
    address: "530 3 Street SE, Calgary, AB",
    neighbourhoodSlug: "east-village",
    neighbourhood: "East Village",
    quadrant: "city-centre",
    units: 488,
    stories: 42,
    builtIn: 2024,
    developer: "Bosa Properties",
    lat: 51.0455,
    lng: -114.0497,
    heroImage: "https://luxuryhomescalgary.ca/wp-content/uploads/2026/04/Gemini_Generated_Image_mjx700mjx700mjx7-scaled.png",
    sortOrder: 31,
    featured: true,
  },
  {
    slug: "6th-and-tenth",
    name: "6th and Tenth",
    tagline: "Beltline luxury high-rise at the corner of 6th Street and 10th Avenue SW.",
    intro: [
      "6th and Tenth is a luxury Beltline condo tower at 1010 6 Street SW, completed by Lamb Development Corp. The 35-story tower is one of the more refined recent residential additions to the southern Beltline corridor, blending contemporary design with neighbourhood-scale ground floor activation.",
    ],
    residencesCopy: [
      "Open-concept one and two-bedroom residences with floor-to-ceiling glass, quartz counters, premium appliances, and large private balconies. Higher-floor units capture downtown skyline and Rocky Mountain views.",
    ],
    architecturalCopy: [
      "Slim 35-story tower with curtain wall glazing, contemporary mixed-use podium with retail at grade. Designed by Lamb Development Corp.",
    ],
    amenities: ["24/7 concierge", "Fitness centre", "Resident lounge", "Outdoor terrace", "Underground heated parking", "Bicycle storage", "Pet-friendly", "Visitor parking"],
    address: "1010 6 Street SW, Calgary, AB",
    neighbourhoodSlug: "beltline",
    neighbourhood: "Beltline",
    quadrant: "city-centre",
    units: 271,
    stories: 35,
    builtIn: 2018,
    developer: "Lamb Development Corp",
    lat: 51.0428,
    lng: -114.0723,
    heroImage: "https://luxuryhomescalgary.ca/wp-content/uploads/2024/06/002-2503-1010-6st-2-1024x1024.jpeg",
    sortOrder: 32,
    featured: true,
  },
  {
    slug: "the-river",
    name: "The River",
    tagline: "Ledcor Properties' 38-residence Mission landmark, paired across 135 + 137 26 Avenue SW.",
    intro: [
      "The River is a 15-story, 38-residence luxury condominium completed by Ledcor Properties in 2015. Set in Mission, the building shares a single architectural identity across two interconnected residential addresses (135 + 137 26 Avenue SW) — one of the most established premium condo addresses south of the river.",
      "The Mission location places residents steps from the Elbow River pathway, the Stampede grounds, and 4th Street SW's restaurant strip — a rare combination of urban access and natural amenity in the inner city.",
    ],
    residencesCopy: [
      "Thirty-eight residences across fifteen stories, ranging from one-bedroom apartments through expansive penthouses. Each unit is laid out to maximize space and natural light, with floor-to-ceiling windows framing panoramic Bow River and downtown Calgary views.",
      "Interiors are finished with premium materials — hardwood flooring, granite countertops, custom cabinetry — and signature 2-sided fireplaces. Kitchens carry top-of-the-line appliances; spa-style bathrooms feature deep soaker tubs, rain showers, and designer fixtures. In-suite laundry, ample storage, and climate control are standard.",
    ],
    architecturalCopy: [
      "A sleek, contemporary facade in high-quality materials, designed to blend with Mission's premium-residential character. The two addresses (135 and 137 26 Avenue SW) share a single shared parcel and architectural treatment, paired as one building under one identity.",
    ],
    locationCopy: [
      "Mission is one of Calgary's most established inner-city neighbourhoods — a tree-lined grid south of the Elbow River, walkable to downtown but quiet enough to feel residential. The River sits a block off 4th Street SW, putting the building's residents within a five-minute walk of the river pathway, Lindsay Park, and the MNP Community & Sport Centre.",
      "Commuter access is exceptional: a four-minute drive to the downtown core via Macleod Trail, direct bike-lane access along 12 Avenue, and the 39 Avenue and Erlton/Stampede LRT stations each within a fifteen-minute walk. The Stampede grounds and Saddledome are six blocks east, making event access frictionless.",
    ],
    diningCopy: [
      "Mission and the adjacent 4th Street SW restaurant row deliver one of the strongest dining clusters in the city. Within a five-minute walk: Anju (Korean-influenced fine dining), Una Pizza + Wine, Without Papers Pizza, Cassis Bistro, and Boogie's Burgers. Coffee runs to OEB Breakfast Co., Phil & Sebastian, and Analog Coffee.",
      "Evenings extend to Proof, Last Best Brewing, and the Hop in Brew Pub for craft cocktails and beer. The Mission BIA (Business Improvement Area) maintains the strip with consistent year-round programming, including Lilac Festival each spring.",
    ],
    shoppingCopy: [
      "Day-to-day shopping is anchored by Safeway on 4th Street SW and a Sunterra Market two blocks away — both within easy walking distance. Specialty retailers along 4th include Britannia Wine Merchants, BARK YYC for pet supplies, and a cluster of independent boutiques. Chinook Centre, Calgary's largest mall, is a six-minute drive south on Macleod Trail.",
    ],
    communityCopy: [
      "Mission has a strong sense of community character — a mix of multi-generational families, young professionals, and downsizing executives drawn by the walkability and the river-pathway lifestyle. The Calgary Stampede and the Saddledome bring a steady event calendar; the Mission Bridge and Elbow River pathway connect to Stanley Park, the Repsol Sport Centre, and the broader downtown bike-pathway network.",
      "Cultural anchors include the Lougheed House (a National Historic Site) on 13 Avenue SW and the riverside Talisman Centre. Mission's mature elm canopy and tightly-woven street grid make it one of the most photographed inner-city neighbourhoods in Calgary.",
    ],
    schoolsCopy: [
      "Public catchment is Western Canada High School (one of Calgary's top-ranked public secondaries) and Earl Grey School for K–6. Catholic options include St. Monica Elementary and St. Mary's High School. Mount Royal University is a fifteen-minute drive west; SAIT and the University of Calgary are accessible by LRT in under thirty minutes.",
    ],
    amenities: [
      "Underground heated parking stalls",
      "Guest suites",
      "Massage room for owners",
      "Boardroom",
      "Rooftop terrace with greenery",
      "Large private balconies",
      "Fully equipped fitness room",
      "Catering kitchen",
      "24/7 concierge + security services",
      "Car wash and detailing station",
      "Pet wash and grooming station",
      "2-sided in-unit fireplaces",
    ],
    address: "135 26 Avenue SW, Calgary, AB",
    addressAliases: "137",
    neighbourhoodSlug: "mission",
    neighbourhood: "Mission",
    quadrant: "city-centre",
    units: 38,
    stories: 15,
    builtIn: 2015,
    developer: "Ledcor Properties",
    lat: 51.0322,
    lng: -114.0700,
    heroImage: "/condo-heroes/the-river.png",
    sortOrder: 21,
    featured: true,
  },
];
