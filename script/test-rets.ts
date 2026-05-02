// Manual test harness: connect to Pillar 9, log in, run a small search, dump
// the first row so we can see the actual field names. Run with:
//
//   npx tsx script/test-rets.ts
//
import "dotenv/config";
import { RetsClient } from "../server/rets-client";

async function main() {
  const cfg = {
    loginUrl: process.env.RETS_LOGIN_URL!,
    username: process.env.RETS_USERNAME!,
    password: process.env.RETS_PASSWORD!,
    userAgent: process.env.RETS_USER_AGENT ?? "RiversRealEstate/1.0",
    uaPassword: process.env.RETS_UA_PASSWORD || undefined,
  };
  if (!cfg.loginUrl || !cfg.username || !cfg.password) {
    console.error("Missing RETS_* env vars");
    process.exit(1);
  }
  const client = new RetsClient(cfg);
  console.log("Logging in to", cfg.loginUrl);
  const caps = await client.login();
  console.log("Capabilities:");
  for (const [k, v] of Object.entries(caps)) {
    console.log(` ${k}: ${String(v).slice(0, 100)}`);
  }
  console.log("\nSearching: Property / Property — verified field names from METADATA-TABLE");
  const sel = 'ListingId,ListPrice,City,StandardStatus,MlsStatus,BedroomsTotal,BathroomsTotalInteger,LivingAreaSF,PropertyType,PropertySubType,UnparsedAddress,Latitude,Longitude,PhotosCount,ModificationTimestamp,PublicRemarks';
  const queries: Array<[string, string, string?]> = [
    ['Property', '(City=|46)', sel],
    ['Property', '(StandardStatus=|A)', sel],
    ['Property', '(City=|46),(StandardStatus=|A)', sel],
  ];
  for (const [klass, q, sel] of queries) {
    try {
      console.log(`\nTrying class=${klass} query=${q}`);
      const result = await client.search({
        resource: "Property",
        class: klass,
        query: q,
        select: sel,
        limit: 3,
      });
      console.log(` columns (${result.columns.length}):`, result.columns.slice(0, 30).join(", "));
      console.log(` rows: ${result.rows.length}`);
      if (result.rows.length) {
        console.log("\n First row:");
        for (const [k, v] of Object.entries(result.rows[0])) {
          if (v && String(v).length < 200) console.log(`  ${k} = ${v}`);
        }
        break;
      }
    } catch (err: any) {
      console.log(" ❌", err.message);
    }
  }
  await client.logout();
}

main().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
