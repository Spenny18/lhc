import { useQueries } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronLeft, FileText, MapPin } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { useAccount, useNotes } from "@/lib/account";
import { formatPriceCompact } from "@/lib/format";
import type { PublicMlsListing } from "@/lib/mls-types";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccountNotesPage() {
  const { data: me, isLoading: meLoading } = useAccount();
  const { data: notes, isLoading } = useNotes();

  const listingQueries = useQueries({
    queries: (notes ?? []).map((n) => ({
      queryKey: ["/api/mls", n.mlsId],
      queryFn: async () => {
        const r = await fetch(`/api/mls/${encodeURIComponent(n.mlsId)}`);
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
        <Link href="/account/dashboard">
          <a className="inline-flex items-center gap-1 text-xs font-display tracking-[0.22em] text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-3 h-3" /> BACK TO DASHBOARD
          </a>
        </Link>

        <div className="mt-6">
          <div className="font-display text-[11px] tracking-[0.32em] text-muted-foreground">
            YOUR PORTAL
          </div>
          <h1 className="mt-3 font-serif text-[40px] lg:text-[52px] leading-[1.05]">
            Notes
          </h1>
          <p className="mt-3 text-muted-foreground text-[15px] max-w-xl leading-relaxed">
            Private observations on properties you're considering. Only you see
            these — not shared with Spencer or anyone else.
          </p>
        </div>

        {(notes?.length ?? 0) === 0 ? (
          <div className="mt-16 border border-border rounded-sm py-16 px-8 text-center">
            <FileText className="w-7 h-7 mx-auto text-muted-foreground" strokeWidth={1.5} />
            <div className="mt-5 font-serif text-2xl">No notes yet.</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              On any listing detail page, scroll down to the "Your notes"
              section and jot down what you liked, questions to ask, or things
              to compare against other properties.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {(notes ?? []).map((n, idx) => {
              const listing = listingQueries[idx]?.data;
              return (
                <div key={n.id} className="border border-border rounded-sm overflow-hidden flex flex-col md:flex-row">
                  <Link href={`/mls/${n.mlsId}`}>
                    <a className="md:w-56 md:flex-shrink-0 block bg-muted">
                      {listing?.heroImage ? (
                        <img
                          src={listing.heroImage}
                          alt={listing.fullAddress ?? n.mlsId}
                          className="w-full h-40 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 md:h-full flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </a>
                  </Link>
                  <div className="p-5 flex-1 min-w-0">
                    <Link href={`/mls/${n.mlsId}`}>
                      <a className="block group">
                        <div className="font-serif text-xl group-hover:underline">
                          {listing ? formatPriceCompact(listing.listPrice) : "—"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span className="truncate">{listing?.fullAddress ?? n.mlsId}</span>
                        </div>
                      </a>
                    </Link>
                    <div className="mt-3 text-[14px] whitespace-pre-line leading-relaxed">
                      {n.note}
                    </div>
                    <div className="mt-3 text-[11px] font-display tracking-[0.18em] text-muted-foreground">
                      UPDATED {fmtDate(n.updatedAt)}
                    </div>
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
