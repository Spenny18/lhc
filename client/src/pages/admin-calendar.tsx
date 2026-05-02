import * as React from "react";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tour, Lead } from "@shared/schema";
import type { PublicListing } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-900",
  completed: "bg-secondary text-secondary-foreground border-border",
  cancelled: "bg-secondary/40 text-muted-foreground border-border line-through",
};

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarGrid(monthAnchor: Date): Date[] {
  const start = startOfMonth(monthAnchor);
  const startDayOfWeek = start.getDay(); // 0 = Sunday
  const grid: Date[] = [];
  // Pad with previous month's days so the first row starts on Sunday.
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(start.getDate() - 1 - i);
    grid.push(d);
  }
  // Fill out 6 full weeks (42 cells) to keep grid stable.
  while (grid.length < 42) {
    const d = new Date(start);
    d.setDate(start.getDate() + (grid.length - startDayOfWeek));
    grid.push(d);
  }
  return grid;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
}

function formatLongDate(d: Date) {
  return d.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function AdminCalendarPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());

  const { data: tours = [], isLoading } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const { data: listings = [] } = useQuery<PublicListing[]>({ queryKey: ["/api/listings"] });

  const grid = useMemo(() => buildCalendarGrid(monthAnchor), [monthAnchor]);
  const today = new Date();

  const toursByDay = useMemo(() => {
    const map = new Map<string, Tour[]>();
    for (const t of tours) {
      const key = new Date(t.scheduledFor).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    Array.from(map.values()).forEach((arr: Tour[]) => {
      arr.sort(
        (a: Tour, b: Tour) =>
          new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
      );
    });
    return map;
  }, [tours]);

  const selectedDayTours = toursByDay.get(selectedDay.toDateString()) ?? [];

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/tours/${id}`, { status });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/tours"] }),
    onError: (e: any) =>
      toast({ title: "Couldn't update tour", description: e?.message ?? "Try again.", variant: "destructive" }),
  });

  const upcoming = useMemo(() => {
    const now = Date.now();
    return tours
      .filter((t) => new Date(t.scheduledFor).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .slice(0, 8);
  }, [tours]);

  return (
    <AppShell pageTitle="Calendar">
      <div className="p-6 max-w-[1400px] mx-auto">
        <GoogleCalendarConnect />
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground" style={{ letterSpacing: "-0.01em" }}>
              Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Showings, tours, and confirmed appointments. Tied to your listings and leads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm h-9"
              onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="font-display text-[12px] tracking-[0.18em] text-foreground min-w-[160px] text-center">
              {monthAnchor.toLocaleDateString("en-CA", { month: "long", year: "numeric" }).toUpperCase()}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm h-9"
              onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-sm h-9 font-display tracking-[0.14em] text-[11px] ml-2"
              onClick={() => {
                const t = new Date();
                setMonthAnchor(startOfMonth(t));
                setSelectedDay(t);
              }}
            >
              TODAY
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Month grid */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b border-border">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                  <div
                    key={d}
                    className="px-3 py-2 font-display text-[10px] tracking-[0.2em] text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 grid-rows-6 min-h-[640px]">
                {grid.map((day, i) => {
                  const dayTours = toursByDay.get(day.toDateString()) ?? [];
                  const isCurrentMonth = day.getMonth() === monthAnchor.getMonth();
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDay);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(day)}
                      className={`text-left border-b border-r border-border last-of-row:border-r-0 px-2 py-1.5 flex flex-col gap-1 transition-colors ${
                        isCurrentMonth ? "bg-background" : "bg-secondary/30"
                      } ${isSelected ? "ring-2 ring-foreground ring-inset" : "hover:bg-secondary/50"}`}
                    >
                      <div
                        className={`font-display text-[11px] tracking-[0.1em] inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          isToday
                            ? "bg-foreground text-background"
                            : isCurrentMonth
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="flex flex-col gap-1">
                        {dayTours.slice(0, 3).map((t) => (
                          <div
                            key={t.id}
                            className={`text-[10px] truncate px-1.5 py-0.5 rounded-sm border ${
                              STATUS_STYLES[t.status] ?? STATUS_STYLES.requested
                            }`}
                          >
                            {formatTime(t.scheduledFor)} ·{" "}
                            {listings.find((l) => l.id === t.listingId)?.address?.split(",")[0] ?? t.listingId}
                          </div>
                        ))}
                        {dayTours.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1.5">
                            +{dayTours.length - 3} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right rail: selected day + upcoming */}
          <div className="space-y-6">
            <div>
              <div className="eyebrow text-muted-foreground mb-2">Selected day</div>
              <div className="font-serif text-xl mb-3" style={{ letterSpacing: "-0.01em" }}>
                {formatLongDate(selectedDay)}
              </div>
              {selectedDayTours.length === 0 ? (
                <Card>
                  <CardContent className="p-5 text-sm text-muted-foreground">
                    No tours scheduled for this day.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {selectedDayTours.map((t) => (
                    <TourRow
                      key={t.id}
                      tour={t}
                      listing={listings.find((l) => l.id === t.listingId)}
                      lead={leads.find((l) => l.id === t.leadId)}
                      onStatusChange={(status) => updateStatus.mutate({ id: t.id, status })}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="eyebrow text-muted-foreground mb-2">Upcoming · next 8</div>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : upcoming.length === 0 ? (
                <Card>
                  <CardContent className="p-5 text-sm text-muted-foreground">
                    Calendar is clear.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-1.5">
                  {upcoming.map((t) => {
                    const listing = listings.find((l) => l.id === t.listingId);
                    const lead = leads.find((l) => l.id === t.leadId);
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          const d = new Date(t.scheduledFor);
                          setMonthAnchor(startOfMonth(d));
                          setSelectedDay(d);
                        }}
                        className="w-full text-left p-3 border border-border rounded-sm hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" strokeWidth={1.6} />
                          {new Date(t.scheduledFor).toLocaleDateString("en-CA", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {formatTime(t.scheduledFor)}
                        </div>
                        <div className="text-sm font-medium truncate mt-1">
                          {listing?.title ?? t.listingId}
                        </div>
                        {lead && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            with {lead.name}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TourRow({
  tour,
  listing,
  lead,
  onStatusChange,
}: {
  tour: Tour;
  listing?: PublicListing;
  lead?: Lead;
  onStatusChange: (status: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" strokeWidth={1.6} />
              {formatTime(tour.scheduledFor)}
              <Badge
                variant="outline"
                className={`rounded-sm font-display tracking-[0.1em] text-[9px] uppercase border ${
                  STATUS_STYLES[tour.status] ?? STATUS_STYLES.requested
                }`}
              >
                {tour.status}
              </Badge>
            </div>
            <div className="font-serif text-base truncate" style={{ letterSpacing: "-0.01em" }}>
              {listing?.title ?? tour.listingId}
            </div>
            {listing?.address && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                <MapPin className="w-3 h-3" strokeWidth={1.6} />
                {listing.address}
              </div>
            )}
            {lead && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                <User className="w-3 h-3" strokeWidth={1.6} />
                {lead.name}
              </div>
            )}
            {tour.notes && (
              <div className="text-xs text-foreground/80 mt-2 bg-secondary/40 rounded-sm px-2 py-1.5 italic">
                "{tour.notes}"
              </div>
            )}
          </div>
          <Select value={tour.status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 w-[120px] rounded-sm text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Google Calendar connect / status row.
// =============================================================================

interface GoogleStatus {
  connected: boolean;
  configured: boolean;
  accountEmail: string | null;
  expiresAt: string | null;
}

function GoogleCalendarConnect() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: status } = useQuery<GoogleStatus>({
    queryKey: ["/api/admin/google/status"],
  });

  // Surface success/error from the OAuth callback redirect (URL hash params).
  React.useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf("?");
    if (qIdx < 0) return;
    const qs = new URLSearchParams(hash.slice(qIdx + 1));
    if (qs.get("google_connected") === "1") {
      toast({ title: "Google Calendar connected", description: "Tours will now sync." });
      qc.invalidateQueries({ queryKey: ["/api/admin/google/status"] });
      // Strip query params from URL.
      window.history.replaceState(null, "", hash.slice(0, qIdx));
    }
    const err = qs.get("google_error");
    if (err) {
      toast({
        title: "Google connect failed",
        description: err,
        variant: "destructive",
      });
      window.history.replaceState(null, "", hash.slice(0, qIdx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("GET", "/api/admin/google/connect");
      return r.json();
    },
    onSuccess: (data: any) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Couldn't start Google connect", description: data?.message ?? "" });
      }
    },
    onError: (e: any) => {
      toast({
        title: "Couldn't start Google connect",
        description: e?.message ?? "Server may be missing GOOGLE_OAUTH_CLIENT_ID secrets.",
        variant: "destructive",
      });
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/google/disconnect");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/google/status"] });
      toast({ title: "Google Calendar disconnected" });
    },
  });

  if (!status) return null;

  return (
    <Card className="mb-5 bg-secondary/30">
      <CardContent className="p-4 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="eyebrow text-muted-foreground">Google Calendar sync</div>
          {status.connected ? (
            <div className="font-serif text-base mt-0.5 truncate" style={{ letterSpacing: "-0.005em" }}>
              Connected as {status.accountEmail ?? "Google account"}
            </div>
          ) : status.configured ? (
            <div className="font-serif text-base mt-0.5" style={{ letterSpacing: "-0.005em" }}>
              Not connected. Tours will only live in this app until you connect.
            </div>
          ) : (
            <div className="font-serif text-base mt-0.5 text-muted-foreground" style={{ letterSpacing: "-0.005em" }}>
              Server not configured. Set GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET on Fly.
            </div>
          )}
        </div>
        {status.configured && (
          <div className="flex items-center gap-2">
            {status.connected ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm font-display tracking-[0.14em] text-[11px] h-9"
                onClick={() => disconnect.mutate()}
                disabled={disconnect.isPending}
              >
                DISCONNECT
              </Button>
            ) : (
              <Button
                size="sm"
                className="rounded-sm font-display tracking-[0.14em] text-[11px] h-9"
                onClick={() => connect.mutate()}
                disabled={connect.isPending}
              >
                CONNECT GOOGLE CALENDAR
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
