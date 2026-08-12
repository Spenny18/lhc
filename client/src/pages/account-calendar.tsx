import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { useAccount, useTours, type TourRequest } from "@/lib/account";

const STATUS_DOT: Record<string, string> = {
  requested: "bg-amber-500",
  confirmed: "bg-emerald-600",
  cancelled: "bg-muted-foreground",
  completed: "bg-blue-500",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function fmtMonthYear(d: Date): string {
  return d.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildGrid(monthAnchor: Date): Date[] {
  // Sunday-first 6×7 grid covering the month + leading/trailing days.
  const first = startOfMonth(monthAnchor);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function AccountCalendarPage() {
  const { data: me, isLoading: meLoading } = useAccount();
  const { data: tours, isLoading } = useTours();
  const [monthAnchor, setMonthAnchor] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const toursByDay = useMemo(() => {
    const map = new Map<string, TourRequest[]>();
    for (const t of tours ?? []) {
      const d = new Date(t.scheduledFor);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tours]);

  const grid = useMemo(() => buildGrid(monthAnchor), [monthAnchor]);
  const today = new Date();

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

  const selectedTours = selectedDate
    ? toursByDay.get(`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`) ?? []
    : [];

  return (
    <PublicLayout>
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-12 pb-24">
        <Link href="/account/dashboard" className="inline-flex items-center gap-1 text-xs font-display tracking-[0.22em] text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-3 h-3" /> BACK TO DASHBOARD
          
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="font-display text-[11px] tracking-[0.32em] text-muted-foreground">
              YOUR PORTAL
            </div>
            <h1 className="mt-3 font-serif text-[40px] lg:text-[52px] leading-[1.05]">
              Calendar
            </h1>
            <p className="mt-3 text-muted-foreground text-[15px] max-w-xl leading-relaxed">
              Your tour requests and confirmed showings, month by month.
            </p>
          </div>
          <Link href="/account/tours" className="text-sm underline">View as list
          </Link>
        </div>

        {/* Month nav */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))}
            className="h-9 w-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted/50"
            aria-label="Previous month"
            data-testid="btn-prev-month"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div className="font-serif text-2xl">{fmtMonthYear(monthAnchor)}</div>
          <button
            onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))}
            className="h-9 w-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted/50"
            aria-label="Next month"
            data-testid="btn-next-month"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Grid */}
        <div className="mt-6 border border-border rounded-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/40 border-b border-border">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-3 py-2 font-display text-[10px] tracking-[0.22em] text-muted-foreground"
              >
                {d.toUpperCase()}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((d, idx) => {
              const inMonth = d.getMonth() === monthAnchor.getMonth();
              const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
              const dayTours = toursByDay.get(key) ?? [];
              const isToday = isSameDay(d, today);
              const isSelected = selectedDate && isSameDay(d, selectedDate);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(d)}
                  className={`relative aspect-square text-left p-2 border-r border-b border-border last-in-row:border-r-0 transition-colors ${
                    inMonth ? "" : "bg-muted/20 text-muted-foreground"
                  } ${isSelected ? "bg-foreground/5 ring-1 ring-inset ring-foreground" : "hover:bg-muted/30"}`}
                >
                  <div className={`text-xs ${isToday ? "font-display tracking-wider" : ""}`}>
                    {d.getDate()}
                    {isToday && <span className="ml-1 text-[9px] text-muted-foreground">TODAY</span>}
                  </div>
                  {dayTours.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                      {dayTours.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[t.status] ?? "bg-foreground"}`}
                          title={`${t.status} — ${t.listingId}`}
                        />
                      ))}
                      {dayTours.length > 3 && (
                        <span className="text-[9px] text-muted-foreground">+{dayTours.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected-day panel */}
        {selectedDate && (
          <div className="mt-6 border border-border rounded-sm p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                  {selectedDate
                    .toLocaleDateString("en-CA", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                    .toUpperCase()}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedTours.length} tour{selectedTours.length === 1 ? "" : "s"}
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs underline text-muted-foreground"
              >
                Close
              </button>
            </div>
            {selectedTours.length === 0 ? (
              <div className="mt-4 text-sm text-muted-foreground">
                Nothing scheduled this day. Request a tour from any{" "}
                <Link href="/mls" className="underline">MLS listing
                </Link>
                .
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {selectedTours.map((t) => (
                  <Link key={t.id} href={`/mls/${t.listingId}`} className="block rounded-sm border border-border p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-2 h-2 rounded-full ${STATUS_DOT[t.status] ?? "bg-foreground"}`}
                        />
                        <span className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                          {t.status.toUpperCase()}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span>
                          {new Date(t.scheduledFor).toLocaleTimeString("en-CA", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="mt-1 font-serif text-lg">{t.listingId}</div>
                      {t.notes && (
                        <div className="mt-1 text-sm text-muted-foreground">{t.notes}</div>
                      )}
                    
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center gap-5 flex-wrap text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Requested
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> Confirmed
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Completed
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" /> Cancelled
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
