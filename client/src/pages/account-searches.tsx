import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Search, Trash2, Bell, BellOff } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAccount,
  useSavedSearches,
  useUpdateSavedSearch,
  useDeleteSavedSearch,
  type SavedSearch,
} from "@/lib/account";

const FREQ_LABELS: Record<SavedSearch["frequency"], string> = {
  instant: "Instant",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function summariseFilters(raw: string): string {
  let f: any = {};
  try {
    f = JSON.parse(raw);
  } catch {
    return "All listings";
  }
  const parts: string[] = [];
  if (f.q) parts.push(`"${f.q}"`);
  if (f.type && f.type !== "any") parts.push(String(f.type));
  if (f.beds && f.beds !== "any") parts.push(`${f.beds}+ bd`);
  if (f.baths && f.baths !== "any") parts.push(`${f.baths}+ ba`);
  if (f.minPrice || f.maxPrice) {
    const lo = f.minPrice ? `$${Math.round(Number(f.minPrice) / 1000)}K` : "";
    const hi = f.maxPrice ? `$${Math.round(Number(f.maxPrice) / 1000)}K` : "";
    parts.push([lo, hi].filter(Boolean).join("–"));
  }
  if (f.neighbourhood) parts.push(String(f.neighbourhood));
  return parts.length ? parts.join(" · ") : "All listings";
}

function filtersToQuery(raw: string): string {
  let f: any = {};
  try {
    f = JSON.parse(raw);
  } catch {
    return "";
  }
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === null || v === "" || v === "any") continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function AccountSearchesPage() {
  const { data: me, isLoading: meLoading } = useAccount();
  const { data: searches, isLoading } = useSavedSearches();
  const update = useUpdateSavedSearch();
  const del = useDeleteSavedSearch();
  const [deleting, setDeleting] = useState<number | null>(null);

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
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-12 pb-24">
        <Link href="/account/dashboard" className="inline-flex items-center gap-1 text-xs font-display tracking-[0.22em] text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-3 h-3" /> BACK TO DASHBOARD
          
        </Link>

        <div className="mt-6">
          <div className="font-display text-[11px] tracking-[0.32em] text-muted-foreground">
            YOUR PORTAL
          </div>
          <h1 className="mt-3 font-serif text-[40px] lg:text-[52px] leading-[1.05]">
            Saved searches
          </h1>
          <p className="mt-3 text-muted-foreground text-[15px] max-w-xl leading-relaxed">
            Filter sets that email you when matching listings come on market or
            change price. Sign-in email: <strong>{me.email}</strong>
          </p>
        </div>

        {(searches?.length ?? 0) === 0 ? (
          <div className="mt-16 border border-border rounded-sm py-16 px-8 text-center">
            <Search className="w-7 h-7 mx-auto text-muted-foreground" strokeWidth={1.5} />
            <div className="mt-5 font-serif text-2xl">No saved searches yet.</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Browse listings on the MLS page, set the filters you care about,
              and tap "Save this search" — we'll email you when something new
              matches.
            </p>
            <Link href="/mls" className="mt-6 inline-flex items-center font-display text-[11px] tracking-[0.22em] underline">
                BROWSE MLS LISTINGS
              
            </Link>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-border border border-border rounded-sm">
            {(searches ?? []).map((s) => (
              <div key={s.id} className="p-5 lg:p-6 flex items-start justify-between gap-6 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-xl">{s.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {summariseFilters(s.filters)}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {s.emailAlerts ? (
                      <span className="inline-flex items-center gap-1">
                        <Bell className="w-3 h-3" /> {FREQ_LABELS[s.frequency]} alerts
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <BellOff className="w-3 h-3" /> Alerts paused
                      </span>
                    )}
                    {s.lastMatchCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{s.lastMatchCount} match{s.lastMatchCount === 1 ? "" : "es"} last run</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-32">
                    <Select
                      value={s.frequency}
                      onValueChange={(v) =>
                        update.mutate({ id: s.id, frequency: v as SavedSearch["frequency"] })
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant={s.emailAlerts ? "outline" : "default"}
                    size="sm"
                    onClick={() => update.mutate({ id: s.id, emailAlerts: !s.emailAlerts })}
                    data-testid={`btn-toggle-alerts-${s.id}`}
                  >
                    {s.emailAlerts ? "Pause" : "Resume"}
                  </Button>
                  <Link href={`/mls${filtersToQuery(s.filters)}`}>
                      <Button variant="outline" size="sm">View</Button>
                    
                  </Link>
                  <button
                    onClick={() => {
                      if (deleting === s.id) {
                        del.mutate(s.id);
                        setDeleting(null);
                      } else {
                        setDeleting(s.id);
                        setTimeout(() => setDeleting((cur) => (cur === s.id ? null : cur)), 3000);
                      }
                    }}
                    aria-label="Delete saved search"
                    className={`h-9 w-9 rounded-sm border flex items-center justify-center transition-colors ${
                      deleting === s.id
                        ? "border-destructive text-destructive bg-destructive/5"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
                    data-testid={`btn-delete-search-${s.id}`}
                    title={deleting === s.id ? "Click again to confirm" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
