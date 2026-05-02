import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Home,
  Users,
  Eye,
  CalendarClock,
  TrendingUp,
  Building2,
  Wallet,
  Target,
} from "lucide-react";
import { formatPriceCompact } from "@/lib/format";

interface AnalyticsSummary {
  kpis: {
    activeMls: number;
    totalMls: number;
    managedListings: number;
    totalLeads: number;
    upcomingTours: number;
    totalViews: number;
    portfolioValue: number;
    conversionRate: number;
  };
  weeklyLeads: { weekStart: string; leads: number }[];
  sources: { source: string; count: number }[];
  pipeline: { status: string; count: number }[];
  neighbourhoods: { name: string; leads: number }[];
}

const SOURCE_PALETTE = ["#23412d", "#D4AF37", "#1F2937", "#6B7280", "#9CA3AF", "#374151"];

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  "tour-booked": "Tour booked",
  closed: "Closed",
  lost: "Lost",
};

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsSummary>({ queryKey: ["/api/analytics/summary"] });

  if (isLoading || !data) {
    return (
      <AppShell pageTitle="Analytics">
        <div className="p-6 max-w-[1400px] mx-auto">
          <div className="text-sm text-muted-foreground py-12 text-center">Loading analytics…</div>
        </div>
      </AppShell>
    );
  }

  const { kpis, weeklyLeads, sources, pipeline, neighbourhoods } = data;

  return (
    <AppShell pageTitle="Analytics">
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-foreground" style={{ letterSpacing: "-0.01em" }}>
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Where attention is going across your portfolio. Refreshes with every MLS sync and lead capture.
          </p>
        </div>

        {/* KPI grid — 6 cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard
            icon={Home}
            label="Active MLS"
            value={kpis.activeMls.toLocaleString("en-CA")}
            sub={`of ${kpis.totalMls.toLocaleString("en-CA")} total`}
          />
          <KpiCard
            icon={Building2}
            label="Managed listings"
            value={kpis.managedListings.toString()}
            sub="on luxuryhomescalgary.ca"
          />
          <KpiCard
            icon={Users}
            label="Leads (lifetime)"
            value={kpis.totalLeads.toString()}
            sub={`${pipeline.find((p) => p.status === "new")?.count ?? 0} new`}
          />
          <KpiCard
            icon={CalendarClock}
            label="Upcoming tours"
            value={kpis.upcomingTours.toString()}
            sub="confirmed + requested"
          />
          <KpiCard
            icon={Eye}
            label="Total views"
            value={kpis.totalViews.toLocaleString("en-CA")}
            sub="across all listings"
          />
          <KpiCard
            icon={Target}
            label="Conversion"
            value={`${kpis.conversionRate}%`}
            sub="qualified + closed"
          />
        </div>

        {/* Portfolio value strip */}
        <Card className="mb-6">
          <CardContent className="p-5 flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-foreground text-background flex items-center justify-center">
                <Wallet className="w-4 h-4" strokeWidth={1.6} />
              </div>
              <div>
                <div className="eyebrow text-muted-foreground">Portfolio value (managed)</div>
                <div className="font-serif text-3xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
                  {formatPriceCompact(kpis.portfolioValue)}
                </div>
              </div>
            </div>
            <div className="flex-1 text-xs text-muted-foreground max-w-md">
              Sum of list price across the {kpis.managedListings} listings managed under your account.
              MLS-feed inventory is not counted here.
            </div>
          </CardContent>
        </Card>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Leads per week */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="eyebrow text-muted-foreground">Leads per week</div>
                  <div className="font-serif text-xl mt-0.5" style={{ letterSpacing: "-0.01em" }}>
                    Last 12 weeks
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyLeads}>
                    <defs>
                      <linearGradient id="leadsArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#23412d" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#23412d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="weekStart"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) =>
                        new Date(v).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 2,
                        fontSize: 12,
                      }}
                      labelFormatter={(v) =>
                        new Date(v).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      stroke="#23412d"
                      strokeWidth={2}
                      fill="url(#leadsArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Lead sources pie */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="eyebrow text-muted-foreground">Lead sources</div>
                  <div className="font-serif text-xl mt-0.5" style={{ letterSpacing: "-0.01em" }}>
                    Where they come from
                  </div>
                </div>
              </div>
              {sources.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  No leads yet
                </div>
              ) : (
                <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sources}
                          dataKey="count"
                          nameKey="source"
                          innerRadius={48}
                          outerRadius={80}
                          paddingAngle={2}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        >
                          {sources.map((_, i) => (
                            <Cell key={i} fill={SOURCE_PALETTE[i % SOURCE_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 2,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {sources.map((s, i) => (
                      <li key={s.source} className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-sm"
                          style={{ background: SOURCE_PALETTE[i % SOURCE_PALETTE.length] }}
                        />
                        <span className="capitalize">{s.source.replace("-", " ")}</span>
                        <span className="ml-auto font-display tracking-[0.1em] text-xs text-muted-foreground">
                          {s.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="eyebrow text-muted-foreground">Pipeline</div>
                  <div className="font-serif text-xl mt-0.5" style={{ letterSpacing: "-0.01em" }}>
                    Leads by status
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {pipeline.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No leads to show.</div>
                ) : (
                  pipeline
                    .sort((a, b) => b.count - a.count)
                    .map((p) => {
                      const max = Math.max(...pipeline.map((x) => x.count));
                      const pct = max > 0 ? (p.count / max) * 100 : 0;
                      return (
                        <div key={p.status}>
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="font-medium">{STATUS_LABELS[p.status] ?? p.status}</span>
                            <span className="font-display tracking-[0.1em] text-muted-foreground">
                              {p.count}
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-foreground transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Neighbourhoods */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="eyebrow text-muted-foreground">Top neighbourhoods</div>
                  <div className="font-serif text-xl mt-0.5" style={{ letterSpacing: "-0.01em" }}>
                    By lead volume
                  </div>
                </div>
              </div>
              {neighbourhoods.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                  No neighbourhood data yet
                </div>
              ) : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={neighbourhoods} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 2,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="leads" fill="#D4AF37" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Home;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />
          <div className="eyebrow text-muted-foreground truncate">{label}</div>
        </div>
        <div className="font-serif text-2xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
          {value}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>
      </CardContent>
    </Card>
  );
}
