import { Link } from "wouter";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import type { PublicMlsListing } from "@/lib/mls-types";
import { formatPrice, formatSqft } from "@/lib/format";
import { apiUrl } from "@/lib/queryClient";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=900&fit=crop";

interface Props {
  listing: PublicMlsListing;
  variant?: "default" | "compact";
}

export function ListingCard({ listing, variant = "default" }: Props) {
  const isCompact = variant === "compact";
  const status = listing.status?.toLowerCase();
  const isSold = status === "sold";
  const isPending = status === "pending" || status === "conditional";

  return (
    <Link href={`/mls/${listing.id}`}>
      <a
        className="group block"
        data-testid={`card-listing-${listing.id}`}
      >
        <div
          className={`relative overflow-hidden rounded-sm border border-border bg-card ${
            isCompact ? "" : "transition-all hover:border-foreground/20"
          }`}
        >
          {/* Image */}
          <div
            className={`relative ${isCompact ? "aspect-[4/3]" : "aspect-[5/4]"} overflow-hidden bg-secondary`}
          >
            <img
              src={listing.heroImage ? apiUrl(listing.heroImage) : FALLBACK_HERO}
              alt={listing.fullAddress}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_HERO;
              }}
            />
            {(isSold || isPending) && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black text-white font-display text-[10px] tracking-[0.22em]">
                {isSold ? "SOLD" : "PENDING"}
              </div>
            )}
            {listing.daysOnMarket != null && listing.daysOnMarket <= 3 && !isSold && (
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur text-black font-display text-[10px] tracking-[0.22em]">
                NEW
              </div>
            )}
          </div>

          {/* Body */}
          <div className={`p-5 ${isCompact ? "" : "lg:p-6"}`}>
            <div className="font-serif text-[22px] lg:text-[26px] leading-none text-foreground tabular-nums">
              {formatPrice(listing.listPrice)}
            </div>

            <div className="mt-3 text-[14px] font-medium text-foreground leading-snug line-clamp-1">
              {listing.fullAddress}
            </div>
            <div className="mt-1 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
              <MapPin className="w-3 h-3" strokeWidth={1.6} />
              <span className="truncate">
                {listing.neighbourhood || listing.city}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-[12px] text-foreground/85 tabular-nums">
              <span className="inline-flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5" strokeWidth={1.6} />
                {listing.beds}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5" strokeWidth={1.6} />
                {listing.baths}
              </span>
              {listing.sqft ? (
                <span className="inline-flex items-center gap-1.5">
                  <Square className="w-3.5 h-3.5" strokeWidth={1.6} />
                  {formatSqft(listing.sqft).replace(" sqft", " sqft")}
                </span>
              ) : null}
            </div>

            {!isCompact && listing.mlsNumber && (
              <div className="mt-4 font-display text-[10px] tracking-[0.18em] text-muted-foreground">
                MLS # {listing.mlsNumber}
              </div>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
}
