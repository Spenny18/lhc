import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, BarChart3, Trash2, Bell, BellOff } from "lucide-react";
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
  useMarketReports,
  useSubscribeMarketReport,
  useUpdateMarketReport,
  useDeleteMarketReport,
  type MarketReportSub,
} from "@/lib/account";
import type { PublicNeighbourhood } from "@/lib/mls-types";

const FREQ_LABELS: Record<MarketReportSub["frequency"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function fmtNeighbourhood(slug: string | null, hoods: PublicNeighbourhood[]): string {
  if (!slug) return "All saved-search areas";
  const found = hoods.find((h) => h.slug === slug);
  return found?.name ?? slug;
}

export default function AccountReportsPage() {
  const { data: me, isLoading: meLoading } = useAccount();
  const { data: subs, isLoading } = useMarketReports();
  const subscribe = useSubscribeMarketReport();
  const update = useUpdateMarketReport();
  const del = useDeleteMarketReport();
  const [pickHood, setPickHood] = useState<string>("");
  const [pickFreq, setPickFreq] = useState<MarketReportSub["frequency"]>("weekly");
  const [deleting, setDeleting] = useState<number | null>(null);

  const { data: hoods } = useQuery<PublicNeighbourhood[]>({
    queryKey: ["/api/public/neighbourhoods"],
    queryFn: async () => {
      const r = await fetch("/api/public/neighbourhoods");
      if (!r.ok) return [];
      return r.json();
    },
    staleTime: 5 * 60_000,
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

  const allHoods = hoods ?? [];

  function handleSubscribe() {
    if (!pickHood) return;
    subscribe.mutate(
      {
        neighbourhoodSlug: pickHood === "__all__" ? null : pickHood,
        frequency: pickFreq,
      },
      { onSuccess: () => setPickHood("") },
    );
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
            Market reports
          </h1>
          <p className="mt-3 text-muted-foreground text-[15px] max-w-xl leading-relaxed">
            Recurring digests for the neighbourhoods you care about — new
            listings, price reductions, sold comparables, and average days on
            market. Delivered to {me.email}.
          </p>
        </div>

        {/* Subscribe form */}
        <div className="mt-10 border border-border rounded-sm p-5">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
            ADD A NEW REPORT
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-3 items-end">
            <div>
              <label className="block font-display text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5">
                NEIGHBOURHOOD
              </label>
              <Select value={pickHood} onValueChange={setPickHood}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pick a neighbourhood…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All saved-search areas</SelectItem>
                  {allHoods.map((h) => (
                    <SelectItem key={h.slug} value={h.slug}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block font-display text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5">
                FREQUENCY
              </label>
              <Select value={pickFreq} onValueChange={(v) => setPickFreq(v as MarketReportSub["frequency"])}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={!pickHood || subscribe.isPending}
              className="h-10"
              data-testid="btn-subscribe-report"
            >
              {subscribe.isPending ? "Adding…" : "Subscribe"}
            </Button>
          </div>
        </div>

        {/* Existing subscriptions */}
        {(subs?.length ?? 0) === 0 ? (
          <div className="mt-10 border border-border rounded-sm py-16 px-8 text-center">
            <BarChart3 className="w-7 h-7 mx-auto text-muted-foreground" strokeWidth={1.5} />
            <div className="mt-5 font-serif text-2xl">No active reports yet.</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Pick a neighbourhood above and choose a cadence to start
              receiving market digests by email.
            </p>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-border border border-border rounded-sm">
            {(subs ?? []).map((s) => (
              <div
                key={s.id}
                className="p-5 flex items-start justify-between gap-6 flex-wrap"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-xl">
                    {fmtNeighbourhood(s.neighbourhoodSlug, allHoods)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-2">
                    {s.active ? (
                      <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
                    ) : (
                      <BellOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                    )}
                    {FREQ_LABELS[s.frequency]} · {s.active ? "Active" : "Paused"}
                    {s.lastSentAt && (
                      <>
                        <span>·</span>
                        <span>last sent {new Date(s.lastSentAt).toLocaleDateString("en-CA")}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <Select
                      value={s.frequency}
                      onValueChange={(v) =>
                        update.mutate({ id: s.id, frequency: v as MarketReportSub["frequency"] })
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant={s.active ? "outline" : "default"}
                    size="sm"
                    onClick={() => update.mutate({ id: s.id, active: !s.active })}
                  >
                    {s.active ? "Pause" : "Resume"}
                  </Button>
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
                    aria-label="Delete subscription"
                    className={`h-9 w-9 rounded-sm border flex items-center justify-center transition-colors ${
                      deleting === s.id
                        ? "border-destructive text-destructive bg-destructive/5"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
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
