import { useQueries } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronLeft, Heart, MapPin } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { useAccount, useFavorites, useRemoveFavorite } from "@/lib/account";
import { formatPriceCompact, formatSqft } from "@/lib/format";
import type { PublicMlsListing } from "@/lib/mls-types";

export default function AccountFavoritesPage() {
  const { data: me, isLoading: meLoading } = useAccount();
  const { data: favorites, isLoading: favLoading } = useFavorites();
  const removeFavorite = useRemoveFavorite();

  // Hydrate each favorite with full MLS data. We fire one /api/mls/:id call
  // per favorite — fine for typical user volume (10-100 saved listings).
  const listingQueries = useQueries({
    queries: (favorites ?? []).map((f) => ({
      queryKey: ["/api/mls", f.mlsId],
      queryFn: async () => {
        const r = await fetch(`/api/mls/${encodeURIComponent(f.mlsId)}`);
        if (!r.ok) return null;
        return (await r.json()) as PublicMlsListing;
      },
      staleTime: 60_000,
    })),
  });

  if (meLoading || favLoading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-6 py-32 text-center text-muted-foreground">
          Loading…
        </div>
      </PublicLayout>
    );
  }
  if (!me) {
    if (typeof window !== "undefined") window.location.href = "/account/login";
    return null;
  }

  return (
    <PublicLayout>
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-12 pb-24">
        <Link href="/account/dashboard">
          <a className="inline-flex items-center gap-1 text-xs font-display tracking-[0.22em] text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-3 h-3" /> BACK TO DASHBOARD
          </a>
        </Link>

        <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="font-display text-[11px] tracking-[0.32em] text-muted-foreground">
              YOUR PORTAL
            </div>
            <h1 className="mt-3 font-serif text-[40px] lg:text-[52px] leading-[1.05]">
              Favourites
            </h1>
            <p className="mt-3 text-muted-foreground text-[15px]">
              {favorites?.length ?? 0} listing{favorites?.length === 1 ? "" : "s"} saved
            </p>
          </div>
        </div>

        {(favorites?.length ?? 0) === 0 ? (
          <div className="mt-16 border border-border rounded-sm py-16 px-8 text-center">
            <Heart className="w-7 h-7 mx-auto text-muted-foreground" strokeWidth={1.5} />
            <div className="mt-5 font-serif text-2xl">No favourites yet.</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Browse the MLS and tap the heart on any listing to save it here.
              We'll keep an eye on price changes for you.
            </p>
            <Link href="/mls">
              <a className="mt-6 inline-flex items-center font-display text-[11px] tracking-[0.22em] underline">
                BROWSE MLS LISTINGS
              </a>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(favorites ?? []).map((f, idx) => {
              const listing = listingQueries[idx]?.data;
              return (
                <div key={f.id} className="border border-border rounded-sm overflow-hidden group relative">
                  <Link href={`/mls/${f.mlsId}`}>
                    <a className="block">
                      {listing?.heroImage ? (
                        <div className="aspect-[4/3] bg-muted overflow-hidden">
                          <img
                            src={listing.heroImage}
                            alt={listing.fullAddress ?? f.mlsId}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          {listing === null ? "Listing no longer available" : "Loading…"}
                        </div>
                      )}
                      <div className="p-4">
                        <div className="font-serif text-xl">
                          {listing ? formatPriceCompact(listing.listPrice) : "—"}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span className="truncate">{listing?.fullAddress ?? f.mlsId}</span>
                        </div>
                        {listing && (
                          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{listing.beds ?? "—"} bd</span>
                            <span>·</span>
                            <span>{listing.baths ?? "—"} ba</span>
                            <span>·</span>
                            <span>{listing.sqft ? formatSqft(listing.sqft) + " sqft" : "—"}</span>
                          </div>
                        )}
                      </div>
                    </a>
                  </Link>
                  <button
                    onClick={() => removeFavorite.mutate(f.mlsId)}
                    aria-label="Remove from favourites"
                    title="Remove from favourites"
                    className="absolute top-3 right-3 rounded-full bg-background/90 backdrop-blur w-9 h-9 flex items-center justify-center border border-border hover:bg-background transition-colors"
                    data-testid={`btn-unfavorite-${f.mlsId}`}
                  >
                    <Heart className="w-4 h-4 fill-current" strokeWidth={1.5} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
