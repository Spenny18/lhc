import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Home, Building, CheckCircle2, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { SeoHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Loaded-once tracking for the Google Maps Places script so navigating away
// and back to this page doesn't add a second <script> tag.
let mapsLoaderPromise: Promise<void> | null = null;
function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (mapsLoaderPromise) return mapsLoaderPromise;
  mapsLoaderPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      mapsLoaderPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(s);
  });
  return mapsLoaderPromise;
}

export interface AddressDetails {
  formatted: string;
  coords: { lat: number; lng: number } | null;
  postalCode: string;
  city: string;
}

/** Address autocomplete via the new google.maps.places.PlaceAutocompleteElement
 *  web component. The legacy `Autocomplete` constructor is disabled for any
 *  Google Cloud project created on/after 2025-03-01.
 *
 *  Lifecycle: mount a <gmp-place-autocomplete> element inside a container div,
 *  listen for "gmp-select" events, fetch place fields, hand back the full
 *  address details (formatted string + coords + postal + city) so the server
 *  can rebuild a Gnowise-friendly query string. */
function PlaceAutocompleteField({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (details: AddressDetails) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let element: any = null;
    let onSelectHandler: ((e: any) => void) | null = null;
    (async () => {
      try {
        const r = await fetch("/api/public/config");
        const cfg = await r.json();
        if (!cfg?.googleMapsKey) {
          if (!cancelled) setFallback(true);
          return;
        }
        await loadGoogleMaps(cfg.googleMapsKey);
        if (cancelled || !containerRef.current) return;
        const g = (window as any).google;
        const Place = g?.maps?.places?.PlaceAutocompleteElement;
        if (!Place) {
          if (!cancelled) setFallback(true);
          return;
        }
        element = new Place({
          includedRegionCodes: ["ca"],
        });
        // Style hooks — match the rest of the form. The web component exposes
        // `::part(input)` for the inner text field; we set sizing here.
        (element as HTMLElement).style.width = "100%";
        containerRef.current.appendChild(element);
        elementRef.current = element;
        onSelectHandler = async (event: any) => {
          console.debug("[home-eval] place event:", event?.type, event);
          try {
            // The new API emits "gmp-select" with { placePrediction }.
            // Some older Google docs show "gmp-placeselect" / event.detail
            // shapes — try every known shape so we work across API versions.
            const prediction =
              event?.placePrediction ??
              event?.detail?.placePrediction ??
              event?.place ??
              event?.detail?.place;
            if (!prediction) {
              console.warn("[home-eval] no placePrediction in event");
              return;
            }
            const place =
              typeof prediction.toPlace === "function"
                ? prediction.toPlace()
                : prediction;
            if (typeof place.fetchFields === "function") {
              await place.fetchFields({
                fields: [
                  "formattedAddress",
                  "location",
                  "displayName",
                  "addressComponents",
                ],
              });
            }
            const formatted =
              place.formattedAddress ??
              place.formatted_address ??
              place.displayName ??
              prediction.text?.text ??
              "";
            // Location can be LatLng (methods) or LatLngLiteral (props).
            const loc = place.location;
            let coords: { lat: number; lng: number } | null = null;
            if (loc) {
              if (typeof loc.lat === "function" && typeof loc.lng === "function") {
                coords = { lat: loc.lat(), lng: loc.lng() };
              } else if (typeof loc.lat === "number" && typeof loc.lng === "number") {
                coords = { lat: loc.lat, lng: loc.lng };
              }
            }
            // Extract postal code + city from addressComponents. The new API
            // uses `types` arrays per component; the legacy used `componentType`.
            let postalCode = "";
            let city = "";
            const comps = place.addressComponents ?? place.address_components ?? [];
            for (const c of comps) {
              const types: string[] = c.types ?? (c.componentType ? [c.componentType] : []);
              const value =
                c.shortText ?? c.short_name ?? c.longText ?? c.long_name ?? "";
              if (types.includes("postal_code")) postalCode = value;
              else if (types.includes("locality")) city = value;
            }
            const details: AddressDetails = { formatted, coords, postalCode, city };
            console.debug("[home-eval] resolved:", details);
            if (formatted) onSelect(details);
          } catch (e) {
            console.error("[home-eval] place select handler failed:", e);
          }
        };
        element.addEventListener("gmp-select", onSelectHandler);
        element.addEventListener("gmp-placeselect", onSelectHandler);
        if (!cancelled) setReady(true);
      } catch (e) {
        console.warn("[home-evaluation] places autocomplete unavailable:", e);
        if (!cancelled) setFallback(true);
      }
    })();
    return () => {
      cancelled = true;
      if (element && onSelectHandler) {
        element.removeEventListener("gmp-select", onSelectHandler);
        element.removeEventListener("gmp-placeselect", onSelectHandler);
      }
      if (element && containerRef.current?.contains(element)) {
        containerRef.current.removeChild(element);
      }
      elementRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Graceful fallback when Maps script isn't available — render a plain text
  // input so the form is still usable.
  if (fallback) {
    return (
      <Input
        value={value}
        onChange={(e) =>
          onSelect({ formatted: e.target.value, coords: null, postalCode: "", city: "" })
        }
        placeholder="135 26 Avenue SW, Calgary, AB T2S 0M2"
        required
        autoComplete="off"
        className="h-11"
        data-testid="input-address"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-sm border border-input bg-background h-11 [&>gmp-place-autocomplete]:block [&>gmp-place-autocomplete]:w-full [&>gmp-place-autocomplete]:h-full"
      data-testid="input-address-container"
      aria-busy={!ready}
    />
  );
}

/** Keyless Google Maps embed via iframe — mirrors how the WP plugin does
 *  it. Prefers the raw address string so it works even when the user typed
 *  without clicking an autocomplete suggestion (which means coords would be
 *  null). Falls back to lat/lng if address is empty. Renders nothing if
 *  neither is available. */
function ResultMap({
  address,
  lat,
  lng,
}: {
  address: string;
  lat: number | null;
  lng: number | null;
}) {
  let src = "";
  if (address?.trim()) {
    src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  } else if (lat != null && lng != null) {
    src = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
  } else {
    return null;
  }
  return (
    <div
      className="mt-6 w-full aspect-[16/9] rounded-sm overflow-hidden border border-border bg-secondary"
      data-testid="result-map"
    >
      <iframe
        src={src}
        title="Property location"
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}

/** Keyless Street View embed via iframe — same approach as the WP plugin.
 *  `cbp=11,0,0,0,0` is zoom-11, heading-0, pitch-0 (camera facing north).
 *  Hidden when no coords are available. */
function ResultStreetView({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  if (lat == null || lng == null) return null;
  const src = `https://www.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0&output=svembed`;
  return (
    <div
      className="mt-4 w-full aspect-[16/9] rounded-sm overflow-hidden border border-border bg-secondary"
      data-testid="result-street-view"
    >
      <iframe
        src={src}
        title="Property street view"
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}

interface ValuationReport {
  estimate: number;
  estimateFormatted: string;
  valueLow: number;
  valueLowFormatted: string;
  valueHigh: number;
  valueHighFormatted: string;
  riskOfDecline: number | null;
}

interface ValuationResponse {
  ok: boolean;
  report: ValuationReport | null;
  message?: string;
}

export default function HomeEvaluationPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [aptUnit, setAptUnit] = useState("");
  const [isCondo, setIsCondo] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState<ValuationResponse | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/home-value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          aptUnit: aptUnit.trim(),
          isCondo,
          condition: 3,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          postalCode,
          city,
        }),
      });
      if (!r.ok && r.status !== 502) {
        const err = (await r.json().catch(() => ({}))) as any;
        throw new Error(err.message || err.error || "Request failed");
      }
      return (await r.json()) as ValuationResponse;
    },
    onSuccess: (data) => setResult(data),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !address.trim()) return;
    submit.mutate();
  }

  return (
    <PublicLayout>
      <SeoHead
        title="What's your Calgary home worth? | Rivers Real Estate"
        description="Free AI-powered home valuation for Calgary properties. Get an instant estimate based on recent sales, then a private call with Spencer Rivers to refine the number."
        canonical="https://riversrealestate.ca/home-evaluation"
      />

      <section className="max-w-[1300px] mx-auto px-6 lg:px-10 pt-16 pb-12">
        <div className="font-display text-[11px] tracking-[0.32em] text-muted-foreground">
          HOME VALUATION
        </div>
        <h1 className="mt-5 font-serif text-[44px] lg:text-[64px] leading-[1.05] max-w-3xl">
          What's your Calgary home worth right now?
        </h1>
        <p className="mt-6 text-muted-foreground text-[16px] leading-relaxed max-w-2xl">
          Get an instant AI-powered estimate based on recent comparable sales, plus
          a follow-up from Spencer to refine the number with what data alone
          can't see — finishes, layout, view, and timing.
        </p>
      </section>

      <section className="max-w-[1300px] mx-auto px-6 lg:px-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
          {/* Form */}
          <div>
            {result ? (
              // Show the result panel for BOTH the success path
              // (result.report has an estimate) AND the fallback path
              // (result.report is null because Gnowise 403'd or had no
              // data). The ResultPanel internally branches on report
              // presence to render the right copy + map + Street View.
              <ResultPanel
                result={result}
                coords={coords}
                address={address}
                onReset={() => {
                  setResult(null);
                  setCoords(null);
                }}
              />
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Property type toggle */}
                <div>
                  <Label className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
                    PROPERTY TYPE
                  </Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCondo(false)}
                      className={`flex items-center justify-center gap-2 h-11 rounded-sm border text-sm transition-colors ${
                        !isCondo
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-muted/50"
                      }`}
                      data-testid="btn-prop-house"
                    >
                      <Home className="w-4 h-4" strokeWidth={1.6} />
                      House
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCondo(true)}
                      className={`flex items-center justify-center gap-2 h-11 rounded-sm border text-sm transition-colors ${
                        isCondo
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-muted/50"
                      }`}
                      data-testid="btn-prop-condo"
                    >
                      <Building className="w-4 h-4" strokeWidth={1.6} />
                      Condo / Apartment
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <Label className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
                    PROPERTY ADDRESS
                  </Label>
                  <div className="mt-2">
                    <PlaceAutocompleteField
                      value={address}
                      onSelect={(d) => {
                        setAddress(d.formatted);
                        setCoords(d.coords);
                        setPostalCode(d.postalCode);
                        setCity(d.city);
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Include the full street address with postal code for the most
                    accurate estimate.
                  </p>
                </div>

                {/* Apt unit (only for condos) */}
                {isCondo && (
                  <div>
                    <Label className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
                      UNIT NUMBER
                    </Label>
                    <Input
                      value={aptUnit}
                      onChange={(e) => setAptUnit(e.target.value)}
                      placeholder="510"
                      className="mt-2 h-11"
                      data-testid="input-apt-unit"
                    />
                  </div>
                )}

                {/* Contact */}
                <div className="pt-6 border-t border-border">
                  <Label className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
                    HOW SHOULD SPENCER REACH YOU?
                  </Label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                      autoComplete="given-name"
                      className="h-11"
                      data-testid="input-first-name"
                    />
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      autoComplete="family-name"
                      className="h-11"
                      data-testid="input-last-name"
                    />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    autoComplete="email"
                    className="mt-3 h-11"
                    data-testid="input-email"
                  />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    autoComplete="tel"
                    className="mt-3 h-11"
                    data-testid="input-phone"
                  />
                </div>

                {submit.isError && (
                  <div className="text-sm text-destructive">
                    {(submit.error as Error)?.message ||
                      "Something went wrong. Please try again."}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 font-display tracking-[0.18em] text-[11px]"
                  disabled={submit.isPending}
                  data-testid="btn-submit-valuation"
                >
                  {submit.isPending ? "CALCULATING…" : "GET MY ESTIMATE"}
                  {!submit.isPending && <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.8} />}
                </Button>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Your information stays private — Spencer is the only person who
                  sees it. Unsubscribe from follow-ups anytime.
                </p>
              </form>
            )}
          </div>

          {/* Side panel — what to expect */}
          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            <div className="rounded-sm border border-border p-6">
              <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
                WHAT YOU'LL GET
              </div>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.6} />
                  <span>
                    <strong>An instant estimate</strong> with high / low range based
                    on recent comparable sales in the area.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.6} />
                  <span>
                    <strong>A market context email</strong> — what your
                    neighbourhood is doing, days on market, sale-to-list ratios.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.6} />
                  <span>
                    <strong>A 15-minute call with Spencer</strong> (only if you
                    want it) to refine the number with what the algorithm
                    can't see — finishes, view, layout, timing strategy.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-sm border border-border p-6">
              <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
                HOW IT WORKS
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                The estimate is powered by an automated valuation model that
                analyzes recent sales of similar homes in your area. It's a
                great starting point — but a real listing price needs an
                experienced agent's eye on your property's specifics.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}

function ResultPanel({
  result,
  coords,
  address,
  onReset,
}: {
  result: ValuationResponse;
  coords: { lat: number; lng: number } | null;
  address: string;
  onReset: () => void;
}) {
  const r = result.report;
  if (!r) {
    // No automated estimate available — render the no-report path as a
    // premium hand-prepared service rather than a failure. Spencer hand-
    // prepares each valuation, follows up within 24h, and the lead still
    // hits /admin/leads + FUB the moment the form is submitted.
    return (
      <div className="rounded-sm border border-border p-8">
        <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
          YOUR VALUATION
        </div>
        <h2 className="mt-3 font-serif text-3xl lg:text-4xl leading-tight">
          Custom valuation incoming within 24 hours.
        </h2>
        <p className="mt-5 text-muted-foreground leading-relaxed">
          Thanks — your request has been received. Rather than send a generic
          auto-estimate, Spencer hand-prepares each valuation based on what's
          actually specific to your home — finishes, view, layout, the exact
          block you're on, and the most recent comparable sales on your street.
          A detailed report will land in your inbox within one business day.
        </p>

        {address && (
          <div className="mt-6 text-sm text-muted-foreground">{address}</div>
        )}

        {/* Show the map + Street View even without a numeric estimate —
            gives the lead visual confirmation we got the right house. */}
        <ResultMap address={address} lat={coords?.lat ?? null} lng={coords?.lng ?? null} />
        <ResultStreetView lat={coords?.lat ?? null} lng={coords?.lng ?? null} />

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Want to skip the wait? Reply to the confirmation email or call/text
            Spencer directly at{" "}
            <a href="tel:+14039669237" className="underline hover:text-foreground">
              (403) 966-9237
            </a>{" "}
            for a 15-minute call. No pressure, no obligation.
          </p>
          <button
            onClick={onReset}
            className="mt-6 inline-flex items-center gap-2 px-5 h-11 bg-foreground text-background font-display text-[11px] tracking-[0.22em]"
            data-testid="btn-try-another-noreport"
          >
            ← TRY ANOTHER ADDRESS
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-sm border border-border p-8">
      <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
        ESTIMATED MARKET VALUE
      </div>
      <div
        className="mt-4 font-serif text-[56px] lg:text-[72px] leading-none tabular-nums"
        data-testid="text-estimate"
      >
        {r.estimateFormatted}
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <span>Range</span>
        <span className="tabular-nums">{r.valueLowFormatted}</span>
        <span>—</span>
        <span className="tabular-nums">{r.valueHighFormatted}</span>
      </div>

      {address && (
        <div className="mt-6 text-sm text-muted-foreground">{address}</div>
      )}

      {/* Google Map + Street View — only render when we have coords from
          the Places autocomplete selection. */}
      <ResultMap address={address} lat={coords?.lat ?? null} lng={coords?.lng ?? null} />
      <ResultStreetView lat={coords?.lat ?? null} lng={coords?.lng ?? null} />

      <div className="mt-8 pt-8 border-t border-border">
        <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
          WHAT NOW?
        </div>
        <p className="mt-3 text-sm leading-relaxed">
          The number above is a starting point. Spencer just got your details
          and will follow up within one business day to refine it based on
          your home's specifics — finishes, view, timing. No pressure, no
          obligation.
        </p>

        <button
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 px-5 h-11 bg-foreground text-background font-display text-[11px] tracking-[0.22em]"
          data-testid="btn-try-another-success"
        >
          ← TRY ANOTHER ADDRESS
        </button>

        <div className="mt-6 flex items-center gap-4 flex-wrap">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] underline-offset-4 underline"
          >
            ASK A QUESTION
          </a>
          <span className="text-muted-foreground">·</span>
          <a
            href="/mls"
            className="inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] underline-offset-4 underline"
          >
            BROWSE COMPS
          </a>
          <span className="text-muted-foreground">·</span>
          <button
            onClick={onReset}
            className="font-display text-[11px] tracking-[0.22em] underline-offset-4 underline text-muted-foreground"
          >
            ANOTHER ADDRESS
          </button>
        </div>
      </div>
    </div>
  );
}
