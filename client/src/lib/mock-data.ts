// Listings, leads, and amenity data for Rivers Real Estate / Luxury Homes Calgary.
// Neighborhoods limited to Spencer's market: Springbank Hill, Aspen Woods,
// Upper Mount Royal, Elbow Park, Britannia, Bel-Aire.
// Copy adheres to brand voice — no "nestled", "stunning", "must-see", "dream home".

export type ListingStatus = "active" | "draft" | "sold" | "pending";
export type LeadStatus = "new" | "contacted" | "qualified" | "tour-booked" | "lost";

export interface Listing {
  id: string;
  slug: string;
  title: string;
  address: string;
  neighbourhood: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSize?: string;
  yearBuilt: number;
  type: "Single Family" | "Condo" | "Townhouse" | "Acreage";
  status: ListingStatus;
  description: string;
  features: string[];
  heroImage: string;
  gallery: string[];
  views: number;
  leads: number;
  createdAt: string;
  agent: {
    name: string;
    title: string;
    brokerage: string;
    phone: string;
    email: string;
    avatar: string;
  };
  lat: number;
  lng: number;
}

export interface Lead {
  id: string;
  listingId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: "Landing page" | "Tour scheduler" | "Realtor.ca" | "Referral" | "Instagram";
  status: LeadStatus;
  createdAt: string;
  avatar?: string;
}

export interface Amenity {
  id: string;
  name: string;
  type: "school" | "park" | "cafe" | "restaurant" | "transit" | "shopping" | "fitness";
  lat: number;
  lng: number;
  rating?: number;
  walkMin?: number;
}

const AGENT = {
  name: "Spencer Rivers",
  title: "REALTOR® | CLHMS, CNE, CIPS",
  brokerage: "Synterra Realty / Rivers Real Estate",
  phone: "(403) 966-9237",
  email: "spencer@riversrealestate.ca",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
};

// Six listings across Spencer's market neighborhoods.
// Coordinates are real for each Calgary neighborhood centroid.
export const listings: Listing[] = [
  {
    id: "l-001",
    slug: "82-aspen-summit-circle-sw",
    title: "Aspen Summit Estate",
    address: "82 Aspen Summit Circle SW",
    neighbourhood: "Aspen Woods",
    city: "Calgary, AB",
    price: 3275000,
    beds: 5,
    baths: 4.5,
    sqft: 4810,
    lotSize: "0.42 acres",
    yearBuilt: 2018,
    type: "Single Family",
    status: "active",
    description:
      "A craftsman-built estate at the western edge of Aspen Woods, with unobstructed Rocky Mountain views from the main floor and primary suite. Resort-grade amenities include an indoor sport court, infinity-edge pool, and a fully landscaped 0.42-acre lot with mature spruce.",
    features: [
      "Indoor sport court",
      "Infinity-edge pool",
      "Walkout lower level",
      "Heated 4-car garage",
      "Outdoor kitchen + pizza oven",
      "Mountain views from primary",
    ],
    heroImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600573472556-e636c2acda88?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1200&h=800&fit=crop",
    ],
    views: 2104,
    leads: 41,
    createdAt: "2026-03-19",
    agent: AGENT,
    lat: 51.0395,
    lng: -114.193,
  },
  {
    id: "l-002",
    slug: "1218-prospect-avenue-sw",
    title: "Upper Mount Royal Classical",
    address: "1218 Prospect Avenue SW",
    neighbourhood: "Upper Mount Royal",
    city: "Calgary, AB",
    price: 4950000,
    beds: 5,
    baths: 4,
    sqft: 5180,
    lotSize: "0.32 acres",
    yearBuilt: 1928,
    type: "Single Family",
    status: "active",
    description:
      "A landmark Upper Mount Royal home from 1928, restored with reverence — original mouldings, leaded glass, and reclaimed oak floors paired with a fully reimagined chef's kitchen and primary suite. One of the few remaining lots over 0.30 acres on Prospect.",
    features: [
      "Heritage character preserved",
      "Original millwork & leaded glass",
      "Modern chef's kitchen",
      "Mature gardens",
      "Wine cellar",
      "Detached double garage + carriage suite",
    ],
    heroImage:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
    ],
    views: 1872,
    leads: 33,
    createdAt: "2026-04-02",
    agent: AGENT,
    lat: 51.0265,
    lng: -114.0905,
  },
  {
    id: "l-003",
    slug: "44-elbow-park-lane-sw",
    title: "Elbow Park Riverside Residence",
    address: "44 Elbow Park Lane SW",
    neighbourhood: "Elbow Park",
    city: "Calgary, AB",
    price: 3895000,
    beds: 4,
    baths: 3.5,
    sqft: 4220,
    lotSize: "0.28 acres",
    yearBuilt: 2020,
    type: "Single Family",
    status: "active",
    description:
      "A new-build in Calgary's most established riverside community, designed by McKinley Burkart. Walnut interiors, a south-facing courtyard, and direct access to the Elbow River pathway from the back gate. Steps to River Park and Glencoe Club.",
    features: [
      "South-facing courtyard",
      "Walnut + plaster interiors",
      "Heated triple garage",
      "Gym + sauna",
      "Smart home (Lutron + Control4)",
      "Steps to Elbow River pathway",
    ],
    heroImage:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop",
    ],
    views: 1284,
    leads: 27,
    createdAt: "2026-04-08",
    agent: AGENT,
    lat: 51.0233,
    lng: -114.0892,
  },
  {
    id: "l-004",
    slug: "215-britannia-crescent-sw",
    title: "Britannia Mid-Century",
    address: "215 Britannia Crescent SW",
    neighbourhood: "Britannia",
    city: "Calgary, AB",
    price: 2850000,
    beds: 4,
    baths: 3,
    sqft: 3460,
    lotSize: "0.22 acres",
    yearBuilt: 1962,
    type: "Single Family",
    status: "active",
    description:
      "An architect-owned mid-century on one of Britannia's most desirable interior crescents. Floor-to-ceiling glass, post-and-beam ceilings, and a private rear yard with a heated saltwater pool. A true entertainer's home, walkable to the Britannia Plaza.",
    features: [
      "Heated saltwater pool",
      "Post-and-beam ceilings",
      "Floor-to-ceiling glass",
      "Original Eichler-style millwork",
      "Walk to Britannia Plaza",
      "Double garage",
    ],
    heroImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1200&h=800&fit=crop",
    ],
    views: 612,
    leads: 11,
    createdAt: "2026-04-12",
    agent: AGENT,
    lat: 51.0146,
    lng: -114.085,
  },
  {
    id: "l-005",
    slug: "18-bel-aire-place-sw",
    title: "Bel-Aire Reservoir View",
    address: "18 Bel-Aire Place SW",
    neighbourhood: "Bel-Aire",
    city: "Calgary, AB",
    price: 5750000,
    beds: 6,
    baths: 5.5,
    sqft: 6180,
    lotSize: "0.38 acres",
    yearBuilt: 2015,
    type: "Single Family",
    status: "active",
    description:
      "A Bel-Aire commission with direct sightlines to the Glenmore Reservoir. The lot rises gently to capture western light through a 28-foot great-room window wall. Indoor pool, six bedrooms, and a separately-titled 0.38-acre lot in Calgary's smallest luxury enclave.",
    features: [
      "Glenmore Reservoir views",
      "Indoor lap pool",
      "28-ft great-room window wall",
      "Separate guest wing",
      "5-car heated garage",
      "Geothermal heating + cooling",
    ],
    heroImage:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&h=1000&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600566753086-00f18fe6ba47?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop",
    ],
    views: 0,
    leads: 0,
    createdAt: "2026-04-22",
    agent: AGENT,
    lat: 51.0,
    lng: -114.1015,
  },
  {
    id: "l-006",
    slug: "126-springbank-hill-rise",
    title: "Springbank Hill Modern",
    address: "126 Springbank Hill Rise SW",
    neighbourhood: "Springbank Hill",
    city: "Calgary, AB",
    price: 2199000,
    beds: 4,
    baths: 3.5,
    sqft: 3640,
    lotSize: "0.18 acres",
    yearBuilt: 2022,
    type: "Single Family",
    status: "sold",
    description:
      "A modern Springbank Hill build sold off-market in 11 days. Black-stained cedar exterior, Italian-tile interior, and a fully landscaped lot backing onto a private greenbelt.",
    features: [
      "Black-stained cedar exterior",
      "Italian tile throughout",
      "Backs onto greenbelt",
      "Heated triple garage",
      "Smart home automation",
    ],
    heroImage:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&h=1000&fit=crop",
    gallery: [],
    views: 3221,
    leads: 62,
    createdAt: "2026-02-10",
    agent: AGENT,
    lat: 51.0245,
    lng: -114.196,
  },
];

export function getListing(idOrSlug: string): Listing | undefined {
  return listings.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
}

// Leads — distributed across the active listings
export const leads: Lead[] = [
  {
    id: "ld-001",
    listingId: "l-001",
    name: "Marcus Chen",
    email: "m.chen@email.com",
    phone: "(403) 555-2918",
    message:
      "Very interested in the Aspen Summit estate. Looking for a June 1 possession date — flexible. Could we book a private showing this weekend?",
    source: "Landing page",
    status: "qualified",
    createdAt: "2026-04-26T14:32:00",
  },
  {
    id: "ld-002",
    listingId: "l-001",
    name: "Priya Anand",
    email: "priya.a@gmail.com",
    phone: "(587) 555-1102",
    message: "Is the pool heated year-round? Curious about geothermal load on this lot.",
    source: "Tour scheduler",
    status: "tour-booked",
    createdAt: "2026-04-25T09:18:00",
  },
  {
    id: "ld-003",
    listingId: "l-002",
    name: "Daniel & Erin O'Connell",
    email: "doconnell@workmail.io",
    phone: "(403) 555-7745",
    message:
      "Relocating from Vancouver. Upper Mount Royal Classical is exactly what we're after. Could you send floor plans and confirm property tax?",
    source: "Realtor.ca",
    status: "contacted",
    createdAt: "2026-04-25T16:50:00",
  },
  {
    id: "ld-004",
    listingId: "l-001",
    name: "Lina Park",
    email: "lina@parkdesign.studio",
    message: "Following on the Aspen listing — is the pool serviced year-round?",
    source: "Instagram",
    status: "new",
    createdAt: "2026-04-27T08:11:00",
  },
  {
    id: "ld-005",
    listingId: "l-003",
    name: "James Whittaker",
    email: "jwhittaker@law.ca",
    phone: "(403) 555-5601",
    message: "Elbow Park looks great — open this Saturday for a private showing?",
    source: "Landing page",
    status: "tour-booked",
    createdAt: "2026-04-24T11:02:00",
  },
  {
    id: "ld-006",
    listingId: "l-005",
    name: "Sofia Mendes",
    email: "sofia.m@designcollective.ca",
    message: "Could you confirm the lot orientation? Is the indoor pool a saltwater system?",
    source: "Tour scheduler",
    status: "qualified",
    createdAt: "2026-04-26T18:04:00",
  },
  {
    id: "ld-007",
    listingId: "l-002",
    name: "Robert Tanaka",
    email: "rtanaka@bowmail.com",
    message: "Just browsing for now — beautiful property.",
    source: "Realtor.ca",
    status: "lost",
    createdAt: "2026-04-22T13:20:00",
  },
  {
    id: "ld-008",
    listingId: "l-003",
    name: "Hannah Becker",
    email: "h.becker@homeagency.io",
    phone: "(587) 555-9911",
    message: "Buyer agent here — my client is keen, prepared to write at ask.",
    source: "Referral",
    status: "qualified",
    createdAt: "2026-04-26T20:45:00",
  },
  {
    id: "ld-009",
    listingId: "l-001",
    name: "Kabir Singh",
    email: "ksingh.calgary@email.ca",
    message: "Sport court dimensions? Is it regulation full-court or three-quarter?",
    source: "Landing page",
    status: "new",
    createdAt: "2026-04-27T07:48:00",
  },
];

// Amenity ring around a given lat/lng. Names are appropriate to Calgary luxury communities.
export function getAmenitiesAround(lat: number, lng: number, neighbourhood?: string): Amenity[] {
  const sets: Record<string, Array<[number, number, Omit<Amenity, "id" | "lat" | "lng">]>> = {
    "Aspen Woods": [
      [0.004, -0.006, { name: "Aspen Landing Shopping", type: "shopping", rating: 4.6, walkMin: 6 }],
      [-0.003, 0.005, { name: "Phil & Sebastian Coffee", type: "cafe", rating: 4.8, walkMin: 8 }],
      [0.006, 0.003, { name: "Aspen Woods Park", type: "park", rating: 4.7, walkMin: 5 }],
      [-0.005, -0.009, { name: "Webber Academy", type: "school", rating: 4.9, walkMin: 11 }],
      [0.009, -0.002, { name: "69 Street CTrain", type: "transit", walkMin: 14 }],
      [-0.008, 0.004, { name: "Wine Bar at Aspen", type: "restaurant", rating: 4.6, walkMin: 9 }],
      [0.002, 0.011, { name: "Discovery Ridge Park", type: "park", rating: 4.5, walkMin: 12 }],
      [-0.011, -0.003, { name: "Orangetheory Aspen", type: "fitness", rating: 4.7, walkMin: 10 }],
      [0.005, -0.012, { name: "Save-On-Foods Aspen", type: "shopping", walkMin: 8 }],
      [-0.006, 0.012, { name: "Una Pizza Aspen", type: "restaurant", rating: 4.7, walkMin: 11 }],
    ],
    "Upper Mount Royal": [
      [0.004, -0.006, { name: "Mount Royal Village", type: "shopping", rating: 4.5, walkMin: 7 }],
      [-0.003, 0.005, { name: "Analog Coffee", type: "cafe", rating: 4.8, walkMin: 5 }],
      [0.006, 0.003, { name: "Tomkins Park", type: "park", rating: 4.4, walkMin: 8 }],
      [-0.005, -0.009, { name: "Western Canada High", type: "school", rating: 4.6, walkMin: 12 }],
      [0.009, -0.002, { name: "17 Ave SW Bus", type: "transit", walkMin: 5 }],
      [-0.008, 0.004, { name: "Model Milk", type: "restaurant", rating: 4.8, walkMin: 9 }],
      [0.002, 0.011, { name: "Mount Royal Tennis Club", type: "fitness", rating: 4.7, walkMin: 6 }],
      [-0.011, -0.003, { name: "Equinox Mount Royal", type: "fitness", rating: 4.6, walkMin: 10 }],
      [0.005, -0.012, { name: "Mona Lisa Artisan", type: "restaurant", rating: 4.7, walkMin: 8 }],
      [-0.006, 0.012, { name: "Earl Grey Park", type: "park", rating: 4.5, walkMin: 7 }],
    ],
    "Elbow Park": [
      [0.004, -0.006, { name: "River Café", type: "restaurant", rating: 4.9, walkMin: 9 }],
      [-0.003, 0.005, { name: "Monogram Coffee", type: "cafe", rating: 4.9, walkMin: 6 }],
      [0.006, 0.003, { name: "Stanley Park", type: "park", rating: 4.8, walkMin: 4 }],
      [-0.005, -0.009, { name: "Elbow Park School", type: "school", rating: 4.7, walkMin: 5 }],
      [0.009, -0.002, { name: "Elbow Drive Bus", type: "transit", walkMin: 4 }],
      [-0.008, 0.004, { name: "Glencoe Club", type: "fitness", rating: 4.9, walkMin: 7 }],
      [0.002, 0.011, { name: "River Park", type: "park", rating: 4.9, walkMin: 6 }],
      [-0.011, -0.003, { name: "Sandy Beach", type: "park", rating: 4.8, walkMin: 9 }],
      [0.005, -0.012, { name: "Britannia Plaza", type: "shopping", walkMin: 11 }],
      [-0.006, 0.012, { name: "Una Takeaway", type: "restaurant", rating: 4.7, walkMin: 10 }],
    ],
    "Britannia": [
      [0.004, -0.006, { name: "Sunterra Britannia", type: "shopping", rating: 4.6, walkMin: 5 }],
      [-0.003, 0.005, { name: "Monogram Britannia", type: "cafe", rating: 4.9, walkMin: 4 }],
      [0.006, 0.003, { name: "Britannia Park", type: "park", rating: 4.4, walkMin: 6 }],
      [-0.005, -0.009, { name: "Elboya School", type: "school", rating: 4.5, walkMin: 8 }],
      [0.009, -0.002, { name: "Elbow Drive Bus", type: "transit", walkMin: 6 }],
      [-0.008, 0.004, { name: "Village Ice Cream", type: "restaurant", rating: 4.8, walkMin: 5 }],
      [0.002, 0.011, { name: "Stanley Park", type: "park", rating: 4.8, walkMin: 9 }],
      [-0.011, -0.003, { name: "Ritual Hot Yoga", type: "fitness", rating: 4.6, walkMin: 7 }],
      [0.005, -0.012, { name: "Glencoe Club", type: "fitness", rating: 4.9, walkMin: 11 }],
      [-0.006, 0.012, { name: "Bridgette Bar", type: "restaurant", rating: 4.7, walkMin: 14 }],
    ],
    "Bel-Aire": [
      [0.004, -0.006, { name: "Glenmore Landing", type: "shopping", rating: 4.4, walkMin: 8 }],
      [-0.003, 0.005, { name: "Phil & Sebastian Mission", type: "cafe", rating: 4.8, walkMin: 12 }],
      [0.006, 0.003, { name: "Glenmore Park pathway", type: "park", rating: 4.9, walkMin: 3 }],
      [-0.005, -0.009, { name: "Calgary Academy", type: "school", rating: 4.7, walkMin: 10 }],
      [0.009, -0.002, { name: "Heritage Drive Bus", type: "transit", walkMin: 7 }],
      [-0.008, 0.004, { name: "The Lake House", type: "restaurant", rating: 4.6, walkMin: 9 }],
      [0.002, 0.011, { name: "North Glenmore Park", type: "park", rating: 4.8, walkMin: 5 }],
      [-0.011, -0.003, { name: "Calaway Yacht Club", type: "fitness", rating: 4.7, walkMin: 11 }],
      [0.005, -0.012, { name: "Sunterra Glenmore", type: "shopping", walkMin: 9 }],
      [-0.006, 0.012, { name: "Heritage Pointe Cafe", type: "cafe", rating: 4.5, walkMin: 13 }],
    ],
    "Springbank Hill": [
      [0.004, -0.006, { name: "Aspen Landing Shopping", type: "shopping", rating: 4.6, walkMin: 9 }],
      [-0.003, 0.005, { name: "Monogram Springbank", type: "cafe", rating: 4.7, walkMin: 7 }],
      [0.006, 0.003, { name: "Griffith Woods Park", type: "park", rating: 4.9, walkMin: 6 }],
      [-0.005, -0.009, { name: "Rundle College", type: "school", rating: 4.8, walkMin: 10 }],
      [0.009, -0.002, { name: "69 Street CTrain", type: "transit", walkMin: 12 }],
      [-0.008, 0.004, { name: "Cassis Bistro", type: "restaurant", rating: 4.7, walkMin: 11 }],
      [0.002, 0.011, { name: "Edworthy Park", type: "park", rating: 4.7, walkMin: 14 }],
      [-0.011, -0.003, { name: "F45 Springbank", type: "fitness", rating: 4.6, walkMin: 9 }],
      [0.005, -0.012, { name: "Save-On-Foods Aspen", type: "shopping", walkMin: 8 }],
      [-0.006, 0.012, { name: "Cobs Bread Aspen", type: "shopping", walkMin: 10 }],
    ],
  };

  const fallback = sets["Aspen Woods"];
  const offsets = (neighbourhood && sets[neighbourhood]) || fallback;
  return offsets.map(([dLat, dLng, rest], i) => ({
    id: `a-${i}`,
    lat: lat + dLat,
    lng: lng + dLng,
    ...rest,
  }));
}

// Analytics — sparkline data
export function getViewsSeries(): { day: string; views: number }[] {
  const days = ["Apr 21", "Apr 22", "Apr 23", "Apr 24", "Apr 25", "Apr 26", "Apr 27"];
  const values = [142, 198, 167, 231, 289, 312, 354];
  return days.map((day, i) => ({ day, views: values[i] }));
}

export function getLeadsByDay(): { day: string; leads: number }[] {
  const days = ["Apr 21", "Apr 22", "Apr 23", "Apr 24", "Apr 25", "Apr 26", "Apr 27"];
  const values = [3, 5, 4, 8, 7, 11, 9];
  return days.map((day, i) => ({ day, leads: values[i] }));
}

// Format helpers
export function formatPrice(n: number): string {
  return `$${n.toLocaleString("en-CA")}`;
}

export function formatPriceCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-CA");
}
