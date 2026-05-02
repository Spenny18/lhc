// Minimal Resend REST wrapper — calls the public API directly so we don't
// add a runtime dependency. Returns true on success, false on send failure.
//
// Required env vars:
//   RESEND_API_KEY        — from resend.com -> API Keys
//   RESEND_FROM_EMAIL     — verified sender (e.g. spencer@riversrealestate.ca
//                           if domain is verified, else onboarding@resend.dev)
//   SPENCER_NOTIFY_EMAIL  — optional CC for every outbound (default = from address)

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    return { ok: false, error: "RESEND_FROM_EMAIL not set" };
  }
  const cc = input.cc ?? process.env.SPENCER_NOTIFY_EMAIL;
  const body: any = {
    from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
  };
  if (input.text) body.text = input.text;
  if (cc && cc !== input.to) body.cc = [cc];
  if (input.replyTo) body.reply_to = input.replyTo;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const errText = await r.text();
      return { ok: false, error: `Resend ${r.status}: ${errText}` };
    }
    const data: any = await r.json();
    return { ok: true, id: data?.id };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "fetch failed" };
  }
}

// HTML helpers ---------------------------------------------------------------

const BRAND = {
  black: "#0a0a0a",
  forest: "#23412d",
  gold: "#D4AF37",
  paper: "#fafafa",
  mute: "#6b7280",
  border: "#e5e7eb",
};

function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

interface ListingRow {
  id: string;
  fullAddress: string;
  listPrice: number;
  beds: number;
  baths: number;
  sqft: number | null;
  neighbourhood: string | null;
  heroImage: string | null;
  previousPrice?: number | null;
}

interface SnapshotData {
  newListings: number;
  sold: number;
  terminated: number;
  priceReductions: number;
}

export function buildLeadAlertHtml(opts: {
  leadName: string;
  alertLabel: string;
  origin: string;
  newListings: ListingRow[];
  priceReductions: ListingRow[];
  snapshot: SnapshotData;
  daysBack: number;
}): string {
  const { leadName, alertLabel, origin, newListings, priceReductions, snapshot, daysBack } = opts;
  const listingCard = (l: ListingRow, kind: "new" | "reduced") => {
    const url = `${origin}/#/mls/${l.id}`;
    const photo = l.heroImage
      ? l.heroImage.startsWith("http")
        ? l.heroImage
        : `${origin}${l.heroImage}`
      : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop";
    return `
      <a href="${url}" style="text-decoration:none;color:${BRAND.black};display:block;border:1px solid ${BRAND.border};border-radius:2px;overflow:hidden;margin-bottom:14px;">
        <img src="${photo}" alt="" width="100%" style="display:block;width:100%;max-width:100%;height:auto;" />
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;">
          <tr>
            <td style="padding:14px 16px;">
              <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:600;color:${BRAND.black};letter-spacing:-0.01em;">
                ${
                  kind === "reduced" && l.previousPrice
                    ? `<span style="text-decoration:line-through;color:${BRAND.mute};font-size:16px;font-weight:400;margin-right:8px;">${fmtPrice(l.previousPrice)}</span>${fmtPrice(l.listPrice)}`
                    : fmtPrice(l.listPrice)
                }
              </div>
              <div style="font-family:'Manrope',Arial,sans-serif;font-size:14px;color:${BRAND.black};margin-top:4px;">${l.fullAddress}</div>
              <div style="font-family:'Manrope',Arial,sans-serif;font-size:12px;color:${BRAND.mute};margin-top:6px;letter-spacing:0.05em;">
                ${l.beds} BD · ${l.baths} BA${l.sqft ? ` · ${l.sqft.toLocaleString("en-CA")} SQFT` : ""}${l.neighbourhood ? ` · ${l.neighbourhood.toUpperCase()}` : ""}
              </div>
            </td>
          </tr>
        </table>
      </a>
    `;
  };

  const newSection = newListings.length
    ? `
      <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:600;color:${BRAND.black};margin:32px 0 16px;letter-spacing:-0.01em;">
        New listings · ${newListings.length}
      </h2>
      ${newListings.map((l) => listingCard(l, "new")).join("")}
    `
    : "";

  const reducedSection = priceReductions.length
    ? `
      <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:600;color:${BRAND.black};margin:32px 0 16px;letter-spacing:-0.01em;">
        Price reductions · ${priceReductions.length}
      </h2>
      ${priceReductions.map((l) => listingCard(l, "reduced")).join("")}
    `
    : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.paper};font-family:'Manrope',Arial,sans-serif;color:${BRAND.black};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid ${BRAND.border};">
        <tr>
          <td style="padding:32px 36px 16px;text-align:center;">
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:14px;font-weight:600;letter-spacing:0.18em;color:${BRAND.gold};text-transform:uppercase;">
              RIVERS REAL ESTATE
            </div>
            <div style="font-family:'Manrope',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;color:${BRAND.mute};margin-top:4px;">
              LUXURY HOMES CALGARY
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 36px 8px;">
            <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:600;color:${BRAND.black};margin:8px 0;letter-spacing:-0.01em;">
              Your ${alertLabel} update.
            </h1>
            <p style="font-family:'Manrope',Arial,sans-serif;font-size:15px;color:${BRAND.mute};line-height:1.5;margin:8px 0 0;">
              Hi ${leadName.split(" ")[0]} — here's what's moved in your saved search over the last ${daysBack} days.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};">
              <tr>
                ${stat("New", snapshot.newListings)}
                ${stat("Sold", snapshot.sold)}
                ${stat("Terminated", snapshot.terminated)}
                ${stat("Reduced", snapshot.priceReductions)}
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 36px 24px;">
            ${newSection}
            ${reducedSection}
            ${
              !newSection && !reducedSection
                ? `<p style="font-family:'Manrope',Arial,sans-serif;font-size:14px;color:${BRAND.mute};margin:32px 0;text-align:center;font-style:italic;">No new matches in the last ${daysBack} days. I'll keep watching.</p>`
                : ""
            }
          </td>
        </tr>
        <tr>
          <td style="padding:24px 36px 32px;border-top:1px solid ${BRAND.border};text-align:center;">
            <p style="font-family:'Manrope',Arial,sans-serif;font-size:14px;color:${BRAND.black};line-height:1.5;margin:0 0 6px;">
              Contact Spencer 🤵
            </p>
            <p style="font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:600;color:${BRAND.black};margin:0;letter-spacing:-0.005em;">
              Spencer Rivers
            </p>
            <p style="font-family:'Manrope',Arial,sans-serif;font-size:11px;color:${BRAND.mute};letter-spacing:0.12em;margin:4px 0 0;">
              REALTOR® · RIVERS REAL ESTATE · (403) 966-9237
            </p>
          </td>
        </tr>
      </table>
      <p style="font-family:'Manrope',Arial,sans-serif;font-size:11px;color:${BRAND.mute};margin:16px 0 0;max-width:600px;text-align:center;">
        You're receiving this because Spencer set up an MLS alert for you. Reply to unsubscribe.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function stat(label: string, value: number): string {
  return `
    <td width="25%" style="padding:14px 8px;text-align:center;border-right:1px solid ${BRAND.border};">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:600;color:${BRAND.black};letter-spacing:-0.01em;">${value}</div>
      <div style="font-family:'Manrope',Arial,sans-serif;font-size:10px;letter-spacing:0.16em;color:${BRAND.mute};text-transform:uppercase;margin-top:2px;">${label}</div>
    </td>
  `;
}

// Stat-focused snapshot email — no listing cards. Used for alertType=snapshot.
export function buildMarketSnapshotHtml(opts: {
  leadName: string;
  alertLabel: string;
  origin: string;
  snapshot: SnapshotData & { averageListPrice: number; averageSoldPrice: number };
  daysBack: number;
}): string {
  const { leadName, alertLabel, origin, snapshot, daysBack } = opts;
  const fmtPriceLong = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(2)}M`
      : n >= 1_000
        ? `$${Math.round(n / 1_000)}K`
        : `$${n}`;
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.paper};font-family:'Manrope',Arial,sans-serif;color:${BRAND.black};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid ${BRAND.border};">
        <tr>
          <td style="padding:32px 36px 16px;text-align:center;">
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:14px;font-weight:600;letter-spacing:0.18em;color:${BRAND.gold};text-transform:uppercase;">
              RIVERS REAL ESTATE
            </div>
            <div style="font-family:'Manrope',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;color:${BRAND.mute};margin-top:4px;">
              ${daysBack}-DAY MARKET SNAPSHOT
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 36px 8px;">
            <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:600;color:${BRAND.black};margin:8px 0;letter-spacing:-0.01em;">
              ${alertLabel} · last ${daysBack} days.
            </h1>
            <p style="font-family:'Manrope',Arial,sans-serif;font-size:15px;color:${BRAND.mute};line-height:1.5;margin:8px 0 0;">
              Hi ${leadName.split(" ")[0]} — here's how your slice of the Calgary market has moved.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};">
              <tr>
                ${stat("New", snapshot.newListings)}
                ${stat("Sold", snapshot.sold)}
                ${stat("Terminated", snapshot.terminated)}
                ${stat("Reduced", snapshot.priceReductions)}
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 36px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:8px;">
                  <div style="font-family:'Manrope',Arial,sans-serif;font-size:10px;letter-spacing:0.16em;color:${BRAND.mute};text-transform:uppercase;">AVERAGE LIST</div>
                  <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:600;color:${BRAND.black};margin-top:4px;letter-spacing:-0.01em;">${snapshot.averageListPrice ? fmtPriceLong(snapshot.averageListPrice) : "—"}</div>
                </td>
                <td width="50%" style="padding-left:8px;">
                  <div style="font-family:'Manrope',Arial,sans-serif;font-size:10px;letter-spacing:0.16em;color:${BRAND.mute};text-transform:uppercase;">AVERAGE SOLD</div>
                  <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:600;color:${BRAND.black};margin-top:4px;letter-spacing:-0.01em;">${snapshot.averageSoldPrice ? fmtPriceLong(snapshot.averageSoldPrice) : "—"}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 36px 32px;border-top:1px solid ${BRAND.border};text-align:center;">
            <a href="${origin}/#/contact" style="display:inline-block;padding:11px 22px;background:${BRAND.black};color:#fff;text-decoration:none;font-family:'Manrope',Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Get in touch</a>
            <p style="font-family:'Manrope',Arial,sans-serif;font-size:14px;color:${BRAND.black};line-height:1.5;margin:24px 0 6px;">
              Contact Spencer 🤵
            </p>
            <p style="font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:600;color:${BRAND.black};margin:0;letter-spacing:-0.005em;">
              Spencer Rivers
            </p>
            <p style="font-family:'Manrope',Arial,sans-serif;font-size:11px;color:${BRAND.mute};letter-spacing:0.12em;margin:4px 0 0;">
              REALTOR® · RIVERS REAL ESTATE · (403) 966-9237
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
