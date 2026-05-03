import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPriceCompact } from "@/lib/format";
import type { PublicNeighbourhood } from "@/lib/mls-types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=2400&h=1200&fit=crop";

// Display order for zone sections on the page. Zones not in this list fall to
// the bottom in alpha order. Calgary city zones first, then surrounding
// municipalities (Rural Rocky View County, Foothills MD, Airdrie, Chestermere,
// Canmore).
const ZONE_ORDER = [
  "City Centre",
  "West",
  "Southwest",
  "South",
  "Southeast",
  "Northwest",
  "Northeast",
  "Rural Rocky View County",
  "Foothills MD",
  "Airdrie",
  "Chestermere",
  "Canmore",
];

// Each zone needs a short blurb under its heading so the section feels
// intentional rather than just a label.
const ZONE_BLURBS: Record<string, string> = {
  "City Centre": "Calgary's most established inner-city blocks — heritage character, walkability, and quick access to downtown.",
  "West": "West-side family + estate communities paired with the Bow River escarpment, Edworthy Park, and Westside commuter routes.",
  "Southwest": "Established SW family communities anchored by Fish Creek Park and the Glenmore Reservoir.",
  "South": "South-side family communities along the Macleod / Bow Bottom corridors and the newest south-edge master-plans.",
  "Southeast": "SE communities built around private freshwater lakes — beaches, swimming, and tight-knit lake culture.",
  "Northwest": "Established NW family communities, golf-course addresses, and the U of C / Foothills corridor.",
  "Northeast": "Established NE family communities with strong school catchments and quick airport access.",
  "Rural Rocky View County": "Acreage estate communities west of Calgary — Bearspaw, Springbank, and the Elbow Valley.",
  "Foothills MD": "Country-residential parcels south of Calgary, paired with the Foothills commuter routes.",
  "Airdrie": "Calgary's largest commuter city — newer master-planned communities 20 minutes north on the QE2.",
  "Chestermere": "Lakefront luxury 20 minutes east of Calgary on Chestermere Lake.",
  "Canmore": "Mountain residences in Canmore, paired with Banff National Park and the Bow Valley.",
};

export default function NeighbourhoodsIndexPage() {
  const { data, isLoading } = useQuery<PublicNeighbourhood[]>({
    queryKey: ["/api/public/neighbourhoods"],
  });

  // Group neighbourhoods by zone, ordered by ZONE_ORDER.
  const grouped = useMemo(() => {
    const map = new Map<string, PublicNeighbourhood[]>();
    for (const n of data ?? []) {
      const z = (n as any).zone || "City Centre & Inner-City";
      if (!map.has(z)) map.set(z, []);
      map.get(z)!.push(n);
    }
    // Within each zone, sort by sortOrder then name
    Array.from(map.values()).forEach((arr) => {
      arr.sort((a: PublicNeighbourhood, b: PublicNeighbourhood) => {
        const so = (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
        return so !== 0 ? so : a.name.localeCompare(b.name);
      });
    });
    // Order the zones
    const ordered: Array<[string, PublicNeighbourhood[]]> = [];
    for (const z of ZONE_ORDER) {
      const list = map.get(z);
      if (list && list.length > 0) ordered.push([z, list]);
      map.delete(z);
    }
    // Append any leftover zones alpha-sorted
    Array.from(map.keys()).sort().forEach((z) => {
      ordered.push([z, map.get(z)!]);
    });
    return ordered;
  }, [data]);

  return (
    <PublicLayout>
      {/* Page hero */}
      <section className="relative bg-black text-white">
        <div className="absolute inset-0 opacity-50">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-36">
          <div className="font-display text-[11px] tracking-[0.32em] text-white/65">
            CALGARY · LUXURY COMMUNITIES
          </div>
          <h1 className="mt-5 font-serif text-[44px] lg:text-[72px] leading-[1.02] max-w-[900px]">
            Communities Spencer knows by street, not statistic.
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-white/75">
            Calgary's most established luxury enclaves are made of distinct blocks,
            schools, and cul-de-sacs. The right home depends on which community
            fits the way you actually live.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16 lg:py-20">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-sm" />
            ))}
          </div>
        ) : (
          grouped.map(([zone, list]) => (
            <div key={zone} className="mb-16 last:mb-0">
              {/* Zone heading */}
              <div className="flex items-end justify-between mb-6 border-b border-border pb-3 gap-4 flex-wrap">
                <div className="max-w-[800px]">
                  <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
                    {zone.toUpperCase()}
                  </div>
                  <h2
                    className="font-serif text-2xl lg:text-3xl mt-1"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {zone}
                  </h2>
                  {ZONE_BLURBS[zone] && (
                    <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                      {ZONE_BLURBS[zone]}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-display tracking-[0.16em] text-muted-foreground shrink-0">
                  {list.length} {list.length === 1 ? "COMMUNITY" : "COMMUNITIES"}
                </span>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((n) => (
                  <Link key={n.slug} href={`/neighbourhoods/${n.slug}`}>
                    <a
                      className="group block"
                      data-testid={`card-neighbourhood-${n.slug}`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-secondary">
                        <img
                          src={n.heroImage}
                          alt={n.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="font-display text-[10px] tracking-[0.22em] text-white/70 inline-flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" strokeWidth={1.8} />
                            CALGARY
                          </div>
                          <div className="mt-2 font-serif text-3xl text-white">{n.name}</div>
                          <div className="mt-1 text-[13px] text-white/80 italic">{n.tagline}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[12px]">
                        <div className="flex gap-6 tabular-nums">
                          <div>
                            <span className="text-muted-foreground">Avg price</span>
                            <span className="ml-2 font-medium text-foreground">
                              {formatPriceCompact(n.avgPrice)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Active</span>
                            <span className="ml-2 font-medium text-foreground">{n.activeCount}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 font-display text-[10px] tracking-[0.22em] text-foreground opacity-65 group-hover:opacity-100 transition-opacity">
                          EXPLORE
                          <ArrowRight className="w-3 h-3" strokeWidth={1.8} />
                        </span>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </PublicLayout>
  );
}
