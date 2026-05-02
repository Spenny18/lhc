import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPriceCompact } from "@/lib/format";
import type { PublicNeighbourhood } from "@/lib/mls-types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=2400&h=1200&fit=crop";

export default function NeighbourhoodsIndexPage() {
  const { data, isLoading } = useQuery<PublicNeighbourhood[]>({
    queryKey: ["/api/public/neighbourhoods"],
  });

  return (
    <PublicLayout>
      {/* Page hero */}
      <section className="relative bg-black text-white">
        <div className="absolute inset-0 opacity-50">
          <img
            src={HERO_IMAGE}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-36">
          <div className="font-display text-[11px] tracking-[0.32em] text-white/65">
            CALGARY · LUXURY COMMUNITIES
          </div>
          <h1 className="mt-5 font-serif text-[44px] lg:text-[72px] leading-[1.02] max-w-[900px]">
            Six communities Spencer knows by street, not statistic.
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-white/75">
            Calgary's most established luxury enclaves are made of distinct
            blocks, schools, and cul-de-sacs. The right home depends on which
            community fits the way you actually live.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data ?? []).map((n) => (
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
                        <MapPin
                          className="w-3 h-3"
                          strokeWidth={1.8}
                        />
                        CALGARY
                      </div>
                      <div className="mt-2 font-serif text-3xl text-white">
                        {n.name}
                      </div>
                      <div className="mt-1 text-[13px] text-white/80 italic">
                        {n.tagline}
                      </div>
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
                        <span className="ml-2 font-medium text-foreground">
                          {n.activeCount}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-display text-[10px] tracking-[0.22em] text-foreground opacity-65 group-hover:opacity-100 transition-opacity">
                      EXPLORE
                      <ArrowRight
                        className="w-3 h-3"
                        strokeWidth={1.8}
                      />
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
