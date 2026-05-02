// Public-facing types returned by the API. The server parses
// JSON-encoded array columns (features, gallery) before returning.

export interface PublicListing {
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
  lotSize: string | null;
  yearBuilt: number;
  type: string;
  status: string;
  description: string;
  features: string[];
  heroImage: string;
  gallery: string[];
  lat: number;
  lng: number;
  views: number;
  userId: number;
  createdAt: string;
}
