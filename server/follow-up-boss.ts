// Push new inquiries into Follow Up Boss.
//
// FUB's public REST API: https://docs.followupboss.com/reference/events-post
// The /v1/events endpoint is the right call — it creates or merges a Person,
// records the inquiry as an event, and routes the lead through whatever
// action plans / round-robin rules Spencer has configured in FUB.
//
// Auth is HTTP Basic with the API key as the username and an empty password
// — that's FUB's published convention, NOT a typo.
//
// Required env:
//   FUB_API_KEY               — from FUB > Admin > API
//   FUB_LEAD_SOURCE  (opt)    — value shown on the lead inside FUB
//                                (default: "Rivers Real Estate Website")
//   FUB_SYSTEM        (opt)   — required as X-System header by some FUB
//                                tenants. Default: "RiversRealEstate".
//   FUB_SYSTEM_KEY    (opt)   — paired X-System-Key header. Required if
//                                your FUB account enforces system identity.

interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  listingTitle?: string;
  listingAddress?: string;
  source?: string;
}

interface FubResult {
  ok: boolean;
  skipped?: boolean;
  status?: number;
  error?: string;
}

function splitName(full: string): { first: string; last?: string } {
  const trimmed = full.trim();
  if (!trimmed) return { first: "Lead" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export async function pushLeadToFollowUpBoss(
  opts: InquiryPayload,
): Promise<FubResult> {
  const apiKey = process.env.FUB_API_KEY;
  if (!apiKey) {
    // Soft-skip — FUB integration is opt-in. Logged once at module level
    // would be noisier than just letting it be invisible until configured.
    return { ok: true, skipped: true };
  }

  const { first, last } = splitName(opts.name);
  const source = opts.source ?? process.env.FUB_LEAD_SOURCE ?? "Rivers Real Estate Website";

  // The /events endpoint takes the lead as a nested `person` plus event
  // metadata. FUB de-dupes on email so re-submitting the same person just
  // appends a new event.
  const body = {
    source,
    type: "Inquiry",
    message:
      opts.message +
      (opts.listingTitle
        ? `\n\n— About: ${opts.listingTitle}${opts.listingAddress ? ` (${opts.listingAddress})` : ""}`
        : ""),
    person: {
      firstName: first,
      lastName: last,
      emails: [{ value: opts.email, type: "home" }],
      phones: opts.phone ? [{ value: opts.phone, type: "mobile" }] : undefined,
      tags: opts.listingTitle ? ["website-listing"] : ["website-general"],
    },
  };

  const headers: Record<string, string> = {
    Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const sysName = process.env.FUB_SYSTEM ?? "RiversRealEstate";
  if (sysName) headers["X-System"] = sysName;
  if (process.env.FUB_SYSTEM_KEY) headers["X-System-Key"] = process.env.FUB_SYSTEM_KEY;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch("https://api.followupboss.com/v1/events", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[fub] ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
      return { ok: false, status: res.status, error: text };
    }
    return { ok: true, status: res.status };
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "timeout" : err?.message ?? "unknown";
    console.error(`[fub] request failed: ${msg}`);
    return { ok: false, error: msg };
  } finally {
    clearTimeout(timeout);
  }
}
