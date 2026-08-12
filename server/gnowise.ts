// Gnowise Unified Valuation API v2 proxy (api.gnowise.com).
//
// Single endpoint that returns current value + rent AVM + cap rate +
// liquidity score from just an address (plus optional attributes to narrow
// the confidence interval).
//
// We send Calgary/AB as municipality/province defaults so the model doesn't
// have to disambiguate against Toronto or other markets where ambiguous
// street names exist.
//
// API key lives in Fly secret GNOWISE_API_KEY; never shipped to the
// browser.
import { randomUUID } from "node:crypto";

const ENDPOINT = "https://api.gnowise.com/";

export interface ValuationInput {
  address: string;
  aptNum?: string;
  /** Retained for backward compat with the previous schema; the new API
   *  infers condo vs freehold from PropertyType. We don't forward it. */
  isCondo?: boolean;
  condition?: number;
  postalCode?: string;
  /** Optional explicit municipality (e.g. "Calgary"). Defaults to Calgary
   *  when not provided. */
  municipality?: string;
  /** Optional province code (e.g. "AB"). Defaults to AB when not provided. */
  province?: string;
  // ---- Optional refinement attributes (Gnowise §4) -----------------------
  // Per §11 of the v2 docs: "More attributes typically narrow the confidence
  // interval." Per Gnowise support (Amir, 2026-06): when these come back null
  // in property_attributes the model is effectively valuing an empty record,
  // which is why an address-only request for a $1.8M Calgary luxury home was
  // returning $288K. Forwarding any of these the visitor knows tightens the
  // estimate dramatically. Values are passed straight through to Gnowise as
  // their documented PascalCase fields — enums are validated client-side
  // against the dropdowns in the widget (see §5.1–5.8 of the PDF).
  propertyType?: string;
  style?: string;
  bedrooms?: number;
  den?: number;
  washrooms?: number;
  kitchens?: number;
  parkingSpaces?: number;
  pool?: string;
  basement?: string;
  roomsArea?: number;
  lotArea?: number;
  age?: string;
  ac?: string;
  garageType?: string;
  garageSpaces?: number;
  buildingArea?: number;
  maintenanceFee?: number;
  maintenanceFeeYear?: number;
  /** PDF §9.1 — anchoring the AVM against a known historical purchase
   *  value + date. When the visitor knows what they paid, this dramatically
   *  tightens the estimate (the response then comes back source="HA"). */
  histValue?: number;
  histValueDate?: string;
  histPropertyType?: string;
}

export interface ValuationResponse {
  ok: boolean;
  message?: string;
  estimate?: number;
  valueLow?: number;
  valueHigh?: number;
  /** 0..1 — replaces the old riskOfDecline (semantics inverted: higher is
   *  better). Surfaced in the widget as "High / Moderate / Lower". */
  confidence?: number;
  /** "A" = full AVM model, "H" = House Price Index, "HA" = HPI adjusted with
   *  user-provided historical data. */
  valuationSource?: "A" | "H" | "HA";
  estimatedLease?: number;
  leaseLow?: number;
  leaseHigh?: number;
  capRate?: number;
  liquidityScore?: number;
  parameters?: Record<string, unknown>;
}

export async function fetchValuation(
  input: ValuationInput,
): Promise<ValuationResponse> {
  const key = process.env.GNOWISE_API_KEY;
  if (!key) {
    return {
      ok: false,
      message:
        "Instant valuation isn't configured on this deployment (missing API key).",
    };
  }

  // The v2 docs' Quick Start example sends Address with the city included
  // ("301 Chaplin Cres Toronto") AND Municipality/Province/PostalCode as
  // separate refining fields. We follow the same pattern: if the client
  // sent a structured municipality and the Address string doesn't already
  // contain it, append it so Gnowise's matcher has multiple signals to lock
  // onto. Defaults to Calgary/AB when the client didn't supply municipality.
  const municipality = input.municipality || "Calgary";
  const province = input.province || "AB";
  let addressString = input.address.trim();
  if (
    municipality &&
    !addressString.toLowerCase().includes(municipality.toLowerCase())
  ) {
    addressString = `${addressString} ${municipality}`;
  }
  const body: Record<string, unknown> = {
    Address: addressString,
    AptNum: input.aptNum ?? null,
    Condition: input.condition ?? 3,
    Province: province,
    Municipality: municipality,
  };
  if (input.postalCode) body.PostalCode = input.postalCode;

  // Forward any refinement attributes the caller supplied. We only add a key
  // when it's actually set — sending null/undefined would shadow whatever
  // Gnowise might otherwise infer. Field names match §4 of the v2 docs
  // exactly (PascalCase, enum values as documented in §5).
  const maybeSet = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    body[key] = value;
  };
  maybeSet("PropertyType", input.propertyType);
  maybeSet("Style", input.style);
  maybeSet("Bedrooms", input.bedrooms);
  maybeSet("Den", input.den);
  maybeSet("Washrooms", input.washrooms);
  maybeSet("Kitchens", input.kitchens);
  maybeSet("ParkingSpaces", input.parkingSpaces);
  maybeSet("Pool", input.pool);
  maybeSet("Basement", input.basement);
  maybeSet("RoomsArea", input.roomsArea);
  maybeSet("LotArea", input.lotArea);
  maybeSet("Age", input.age);
  maybeSet("AC", input.ac);
  maybeSet("GarageType", input.garageType);
  maybeSet("GarageSpaces", input.garageSpaces);
  maybeSet("BuildingArea", input.buildingArea);
  maybeSet("MaintenanceFee", input.maintenanceFee);
  maybeSet("MaintenanceFeeYear", input.maintenanceFeeYear);
  maybeSet("HistValue", input.histValue);
  maybeSet("HistValueDate", input.histValueDate);
  maybeSet("HistPropertyType", input.histPropertyType);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        // Optional but recommended for safe retries on 429.
        "Idempotency-Key": randomUUID(),
        "User-Agent":
          "RiversRealEstate/1.0 (+https://riversrealestate.ca)",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Status codes from §10 of the v2 docs. Map each to a user-friendly
      // message that matches what actually went wrong.
      let message: string;
      switch (res.status) {
        case 400:
          message =
            "We couldn't parse that address. Try including city and postal code.";
          break;
        case 401:
          message =
            "The valuation service rejected our credentials. Spencer is fixing this — use the manual form below in the meantime.";
          break;
        case 404:
          message =
            "We couldn't find that address in the valuation index. Try the manual form below for a hand-prepared analysis.";
          break;
        case 429:
          message =
            "The valuation service is rate-limiting requests. Wait a moment and try again.";
          break;
        default:
          message =
            "The instant valuation service is temporarily unavailable. Use the manual form below.";
      }
      const text = await res.text().catch(() => "");
      console.warn(
        `[gnowise] ${res.status} ${res.statusText} for "${input.address}": ${text.slice(0, 300)}`,
      );
      return { ok: false, message };
    }

    const data = await res.json();
    const report = data?.Report ?? {};
    if (typeof report.gnowise_value !== "number") {
      return {
        ok: false,
        message:
          "We couldn't generate an estimate for that address. Try the manual form below for a hand-prepared analysis.",
      };
    }
    // Log the matched value + source so we can tell at a glance whether
    // Gnowise found an AVM record (source "A" — usually accurate) or fell
    // back to the area HPI ("H" / "HA" — generic neighbourhood estimate).
    // attrs= shows how many refinement fields we passed in this call so we
    // can compare bare-address requests vs. refined ones in the logs.
    const attrsForwarded = Object.keys(body).length - 5; // minus Address/AptNum/Condition/Province/Municipality
    console.log(
      `[gnowise] ${addressString} -> $${Math.round(report.gnowise_value).toLocaleString("en-CA")} (source=${report.valuation_source}, confidence=${report.valuation_confidence}, attrs=${Math.max(0, attrsForwarded)})`,
    );
    return {
      ok: true,
      estimate: report.gnowise_value,
      valueLow:
        typeof report.value_low === "number" ? report.value_low : undefined,
      valueHigh:
        typeof report.value_high === "number" ? report.value_high : undefined,
      confidence:
        typeof report.valuation_confidence === "number"
          ? report.valuation_confidence
          : undefined,
      valuationSource: report.valuation_source,
      estimatedLease:
        typeof report.gnowise_lease === "number"
          ? report.gnowise_lease
          : undefined,
      leaseLow:
        typeof report.lease_low === "number" ? report.lease_low : undefined,
      leaseHigh:
        typeof report.lease_high === "number" ? report.lease_high : undefined,
      capRate:
        typeof report.gnowise_cap_rate === "number"
          ? report.gnowise_cap_rate
          : undefined,
      liquidityScore:
        typeof report.liquidity_score === "number"
          ? report.liquidity_score
          : undefined,
      parameters: report.property_attributes ?? null,
    };
  } catch (err: any) {
    const reason =
      err?.name === "AbortError"
        ? "The instant valuation service didn't respond in time. Use the manual form below."
        : "The instant valuation service hit an unexpected error. Use the manual form below.";
    console.error("[gnowise] fetch failed:", err?.message ?? err);
    return { ok: false, message: reason };
  } finally {
    clearTimeout(timer);
  }
}
