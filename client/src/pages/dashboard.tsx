import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Users,
  Home,
  TrendingUp,
  Plus,
  ExternalLink,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { formatPriceCompact, timeAgo, getViewsSeries, getLeadsByDay } from "@/lib/mock-data";
import type { PublicListing } from "@/lib/types";
import type { Lead } from "@shared/schema";

function firstName(full?: string | null) {
  if (!full) return "Spencer";
  return full.split(" ")[0];
}

export default function DashboardPage() {
  const { user } = useAuth();

  const listingsQuery = useQuery<PublicListing[]>({ queryKey: ["/api/listings"] });
  const leadsQuery = useQuery<Lead[]>({ queryKey: ["/api/leads"] });

  const listings = listingsQuery.data ?? [];
  const leads = leadsQuery.data ?? [];
  const activeListings = listings.filter((l) => l.status === "active");
  const newLeadCount = leads.filter((l) => l.status === "new").length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views ?? 0), 0);
  const conversionRate = totalViews > 0 ? ((leads.length / totalViews) * 100).toFixed(1) : "0";

  const viewsSeries = getViewsSeries();
  const leadsSeries = getLeadsByDay();

  const recentLeads = [...leads].slice(0, 4);
  const topListings = [...activeListings].sort((a, b) => b.views - a.views).slice(0, 3);

  const kpis = [
    { label: "Active Listings", value: activeListings.length.toString(), delta: 33, hint: "vs last month", icon: Home },
    { label: "Total Views", value: totalViews.toLocaleString(), delta: 18.2, hint: "vs last 30d", icon: Eye },
    { label: "New Leads", value: newLeadCount.toString(), delta: 27.8, hint: "vs last 30d", icon: Users },
    { label: "Conversion", value: `${conversionRate}%`, delta: -0.6, hint: "vs last 30d", icon: TrendingUp },
  ];

  const greetingTime = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <AppShell
      pageTitle="Dashboard"
      newLeadCount={newLeadCount}
      pageActions={
        <Link href="/admin/listings/new">
          <Button className="rounded-sm font-display tracking-[0.16em] text-[11px]" data-testid="button-new-listing">
            <Plus className="w-4 h-4 mr-1.5" /> NEW LISTING
          </Button>
        </Link>
      }
    >
      <div className="px-8 py-7 space-y-7">
        {/* Greeting */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="eyebrow text-muted-foreground">
              {new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })} · Calgary
            </div>
            <h2 className="font-serif text-3xl text-foreground mt-2" style={{ letterSpacing: "-0.015em" }}>
              {greetingTime}, {firstName(user?.name)}.
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {activeListings.length} listings live across {new Set(activeListings.map(l => l.neighbourhood)).size} neighbourhoods · {newLeadCount} {newLeadCount === 1 ? "enquiry" : "enquiries"} waiting on you
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const positive = kpi.delta >= 0;
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s/g, "-")}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-muted-foreground">{kpi.label}</span>
                    <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-serif text-3xl tabular-nums text-foreground" style={{ letterSpacing: "-0.02em" }}>
                      {listingsQuery.isLoading ? <Skeleton className="h-8 w-16 inline-block" /> : kpi.value}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span
                      className={`inline-flex items-center gap-0.5 font-medium ${
                        positive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(kpi.delta)}%
                    </span>
                    <span className="text-muted-foreground">{kpi.hint}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg" style={{ letterSpacing: "-0.01em" }}>Views, last 7 days</h3>
                  <p className="eyebrow text-muted-foreground mt-1">Across active listings</p>
                </div>
                <Badge variant="outline" className="text-xs rounded-sm">+18.2%</Badge>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewsSeries} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--foreground))" strokeWidth={1.5} fill="url(#viewsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg" style={{ letterSpacing: "-0.01em" }}>New enquiries</h3>
                  <p className="eyebrow text-muted-foreground mt-1">Captured per day</p>
                </div>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="leads" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top listings + recent leads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg" style={{ letterSpacing: "-0.01em" }}>Top performing listings</h3>
                <Link href="/admin/listings" className="eyebrow text-foreground hover:opacity-70">VIEW ALL →</Link>
              </div>
              <div className="space-y-1">
                {listingsQuery.isLoading
                  ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)
                  : topListings.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/admin/listings/${listing.id}`}
                        data-testid={`listing-row-${listing.id}`}
                      >
                        <a className="flex items-center gap-4 p-3 -mx-3 rounded-sm hover:bg-secondary/60 transition-colors">
                          <img
                            src={listing.heroImage}
                            alt={listing.title}
                            className="w-20 h-14 rounded-sm object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-serif text-[15px] truncate text-foreground">{listing.title}</div>
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {listing.address} · {listing.neighbourhood}
                            </div>
                          </div>
                          <div className="hidden md:grid grid-cols-2 gap-6 text-right">
                            <div>
                              <div className="eyebrow text-muted-foreground">Price</div>
                              <div className="font-serif text-sm tabular-nums">{formatPriceCompact(listing.price)}</div>
                            </div>
                            <div>
                              <div className="eyebrow text-muted-foreground">Views</div>
                              <div className="text-sm font-medium tabular-nums">{listing.views.toLocaleString()}</div>
                            </div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0 hidden md:block" />
                        </a>
                      </Link>
                    ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg" style={{ letterSpacing: "-0.01em" }}>Recent enquiries</h3>
                <Link href="/admin/leads" className="eyebrow text-foreground hover:opacity-70">VIEW ALL →</Link>
              </div>
              <div className="space-y-3">
                {leadsQuery.isLoading
                  ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)
                  : recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-start gap-3" data-testid={`lead-recent-${lead.id}`}>
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                            {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate text-foreground">{lead.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize shrink-0 rounded-sm font-display tracking-[0.1em]">
                              {lead.status.replace("-", " ")}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">{lead.message}</div>
                          <div className="text-[11px] text-muted-foreground/70 mt-1 font-display tracking-[0.08em]">
                            {lead.source.toUpperCase()} · {timeAgo(lead.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom strip — brand line */}
        <Card className="bg-foreground text-background border-0 overflow-hidden relative">
          <CardContent className="p-7">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="max-w-xl">
                <div className="eyebrow text-background/60 mb-2">FROM THE FIELD</div>
                <h3 className="font-serif text-2xl text-background" style={{ letterSpacing: "-0.01em" }}>
                  No one pays full price for a stale donut.
                </h3>
                <p className="text-sm text-background/75 mt-2 leading-relaxed">
                  Pricing is the whole game. If a listing has been live more than 30 days
                  without an offer, the market is telling you something — let's review the
                  comps and reset.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/listings">
                  <Button variant="secondary" className="rounded-sm font-display tracking-[0.16em] text-[11px]" data-testid="button-review-listings">
                    REVIEW LISTINGS <ExternalLink className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
