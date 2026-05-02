import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Database, RefreshCw, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

type MlsSyncRun = {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  status: "running" | "success" | "error" | "skipped";
  source: "pillar9" | "seed";
  fetched: number;
  upserted: number;
  removed: number;
  errorMessage: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  success: "bg-foreground text-background",
  running: "bg-secondary text-foreground",
  error: "bg-destructive text-destructive-foreground",
  skipped: "bg-muted text-muted-foreground",
};

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function durationMs(start: string, end: string | null): string {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
}

export default function MlsSyncPage() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery<MlsSyncRun[]>({
    queryKey: ["/api/admin/mls-sync"],
    refetchInterval: 15_000,
  });

  const triggerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/mls-sync/run", {});
    },
    onSuccess: () => {
      toast({ title: "Sync started", description: "Fetching latest listings from Pillar 9." });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/mls-sync"] });
      }, 1500);
    },
    onError: (err: any) => {
      toast({
        title: "Could not start sync",
        description: err?.message ?? "Try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const runs = data ?? [];
  const lastSuccess = runs.find((r) => r.status === "success");
  const lastError = runs.find((r) => r.status === "error");
  const isRunning = runs.some((r) => r.status === "running");

  return (
    <AppShell
      pageTitle="MLS Sync"
      pageActions={
        <Button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending || isRunning}
          className="rounded-sm font-display tracking-[0.16em] text-[11px]"
          data-testid="button-run-sync"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${triggerMutation.isPending ? "animate-spin" : ""}`} />
          {isRunning ? "RUNNING…" : "RUN SYNC NOW"}
        </Button>
      }
    >
      <div className="px-8 py-7 space-y-6 max-w-7xl">
        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-foreground" />
                <span className="eyebrow text-muted-foreground">Last successful sync</span>
              </div>
              <div className="font-serif text-xl" data-testid="text-last-success">
                {lastSuccess ? fmtTime(lastSuccess.finishedAt ?? lastSuccess.startedAt) : "Never"}
              </div>
              {lastSuccess && (
                <div className="text-xs text-muted-foreground mt-1">
                  {lastSuccess.upserted} upserted · {lastSuccess.removed} removed · {lastSuccess.source}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-foreground" />
                <span className="eyebrow text-muted-foreground">Cadence</span>
              </div>
              <div className="font-serif text-xl">Hourly</div>
              <div className="text-xs text-muted-foreground mt-1">
                Cron runs on the hour while server is up.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-foreground" />
                <span className="eyebrow text-muted-foreground">Last error</span>
              </div>
              <div className="font-serif text-xl" data-testid="text-last-error">
                {lastError ? fmtTime(lastError.startedAt) : "None"}
              </div>
              {lastError?.errorMessage && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {lastError.errorMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Runs table */}
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-lg" style={{ letterSpacing: "-0.01em" }}>
                Recent runs
              </h2>
              <span className="eyebrow text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />
                Auto-refreshes every 15s
              </span>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : runs.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <Database className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="font-serif text-lg">No sync runs yet</p>
                <p className="text-sm mt-1">Click RUN SYNC NOW to trigger the first one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="px-5 py-3 eyebrow text-muted-foreground font-normal">Started</th>
                      <th className="px-5 py-3 eyebrow text-muted-foreground font-normal">Status</th>
                      <th className="px-5 py-3 eyebrow text-muted-foreground font-normal">Source</th>
                      <th className="px-5 py-3 eyebrow text-muted-foreground font-normal text-right">Fetched</th>
                      <th className="px-5 py-3 eyebrow text-muted-foreground font-normal text-right">Upserted</th>
                      <th className="px-5 py-3 eyebrow text-muted-foreground font-normal text-right">Removed</th>
                      <th className="px-5 py-3 eyebrow text-muted-foreground font-normal text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border hover:bg-secondary/40 transition-colors"
                        data-testid={`row-sync-${r.id}`}
                      >
                        <td className="px-5 py-3 tabular-nums">{fmtTime(r.startedAt)}</td>
                        <td className="px-5 py-3">
                          <Badge className={`${STATUS_BADGE[r.status] ?? ""} rounded-sm font-display text-[10px] tracking-[0.14em] uppercase`}>
                            {r.status}
                          </Badge>
                          {r.errorMessage && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                              {r.errorMessage}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 capitalize">{r.source}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{r.fetched}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{r.upserted}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{r.removed}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                          {durationMs(r.startedAt, r.finishedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
