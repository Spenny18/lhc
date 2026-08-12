import { useQueries } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronLeft, Calendar, MapPin, X } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { useAccount, useTours, useCancelTour } from "@/lib/account";
import { formatPriceCompact } from "@/lib/format";
import type { PublicMlsListing } from "@/lib/mls-types";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  requested: { label: "Awaiting confirmation", tone: "bg-muted text-foreground" },
  confirmed: { label: "Confirmed", tone: "bg-foreground text-background" },
  cancelled: { label: "Cancelled", tone: "bg-destructive/10 text-destructive" },
  completed: { label: "Completed", tone: "bg-secondary text-secondary-foreground" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AccountToursPage() {
  const { data: me, isLoading: meLoading } = useAccount();
  const { data: tours, isLoading } = useTours();
  const cancel = useCancelTour();

  const listingQueries = useQueries({
    queries: (tours ?? []).map((t) => ({
      queryKey: ["/api/mls", t.listingId],
      queryFn: async () => {
        const r = await fetch(`/api/mls/${encodeURIComponent(t.listingId)}`);
        if (!r.ok) return null;
        return (await r.json()) as PublicMlsListing;
      },
      staleTime: 60_000,
    })),
  });

  if (meLoading || isLoading) {
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
      <section className="max-w-4xl mx-auto px-6 lg:px-10 pt-12 pb-24">
        <Link href="/account/dashboard" className="inline-flex items-center gap-1 text-xs font-display tracking-[0.22em] text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-3 h-3" /> BACK TO DASHBOARD
          
        </Link>

        <div className="mt-6">
          <div className="font-display text-[11px] tracking-[0.32em] text-muted-foreground">
            YOUR PORTAL
          </div>
          <h1 className="mt-3 font-serif text-[40px] lg:text-[52px] leading-[1.05]">
            Property tours
          </h1>
          <p className="mt-3 text-muted-foreground text-[15px] max-w-xl leading-relaxed">
            Tours you've requested. Spencer reviews each request personally
            and reaches out to confirm a time that works for both of you.
          </p>
        </div>

        {(tours?.length ?? 0) === 0 ? (
          <div className="mt-16 border border-border rounded-sm py-16 px-8 text-center">
            <Calendar className="w-7 h-7 mx-auto text-muted-foreground" strokeWidth={1.5} />
            <div className="mt-5 font-serif text-2xl">No tour requests yet.</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              On any listing detail page, click "Request a showing" to ask
              Spencer to walk you through the property in person.
            </p>
            <Link href="/mls" className="mt-6 inline-flex items-center font-display text-[11px] tracking-[0.22em] underline">
                BROWSE MLS LISTINGS
              
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {(tours ?? []).map((t, idx) => {
              const listing = listingQueries[idx]?.data;
              const status = STATUS_LABELS[t.status] ?? STATUS_LABELS.requested;
              const isCancellable = t.status === "requested" || t.status === "confirmed";
              return (
                <div key={t.id} className="border border-border rounded-sm p-5 flex flex-col md:flex-row gap-5">
                  <Link href={`/mls/${t.listingId}`} className="md:w-48 md:flex-shrink-0 block bg-muted h-32">
                      {listing?.heroImage ? (
                        <img
                          src={listing.heroImage}
                          alt={listing.fullAddress ?? t.listingId}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <Link href={`/mls/${t.listingId}`} className="block group min-w-0">
                          <div className="font-serif text-xl group-hover:underline truncate">
                            {listing ? formatPriceCompact(listing.listPrice) : "—"}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span className="truncate">{listing?.fullAddress ?? t.listingId}</span>
                          </div>
                        
                      </Link>
                      <span className={`px-2.5 py-1 font-display text-[10px] tracking-[0.22em] rounded-sm ${status.tone}`}>
                        {status.label.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{fmt(t.scheduledFor)}</span>
                    </div>
                    {t.notes && (
                      <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        <span className="font-display text-[10px] tracking-[0.22em]">YOUR NOTE: </span>
                        {t.notes}
                      </div>
                    )}
                    {isCancellable && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancel.mutate(t.id)}
                          data-testid={`btn-cancel-tour-${t.id}`}
                        >
                          <X className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                          Cancel request
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
