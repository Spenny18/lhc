// Discover Pillar 9 metadata: resources, classes, fields. Run once.
import "dotenv/config";
import fs from "node:fs";
import { RetsClient } from "../server/rets-client";

async function main() {
  const client = new RetsClient({
    loginUrl: process.env.RETS_LOGIN_URL!,
    username: process.env.RETS_USERNAME!,
    password: process.env.RETS_PASSWORD!,
    userAgent: process.env.RETS_USER_AGENT ?? "RiversRealEstate/1.0",
    uaPassword: process.env.RETS_UA_PASSWORD || undefined,
  });
  await client.login();

  console.log("=== METADATA-LOOKUP_TYPE for Property:City ===");
  const cityLk = await client.getMetadata({
    type: "METADATA-LOOKUP_TYPE",
    id: "Property:City",
    format: "STANDARD-XML",
  });
  fs.writeFileSync("/tmp/rets-city-lookup.json", JSON.stringify(cityLk, null, 2));
  console.log("Wrote /tmp/rets-city-lookup.json (", JSON.stringify(cityLk).length, "bytes )");

  console.log("\n=== METADATA-LOOKUP_TYPE for Property:StandardStatus ===");
  const ssLk = await client.getMetadata({
    type: "METADATA-LOOKUP_TYPE",
    id: "Property:StandardStatus",
    format: "STANDARD-XML",
  });
  fs.writeFileSync("/tmp/rets-status-lookup.json", JSON.stringify(ssLk, null, 2));

  console.log("\n=== METADATA-LOOKUP_TYPE for Property:MlsStatus ===");
  const mlsLk = await client.getMetadata({
    type: "METADATA-LOOKUP_TYPE",
    id: "Property:MlsStatus",
    format: "STANDARD-XML",
  });
  fs.writeFileSync("/tmp/rets-mlsstatus-lookup.json", JSON.stringify(mlsLk, null, 2));

  // Print first lookup values from each
  function dumpLookups(name: string, meta: any) {
    const lk =
      meta?.RETS?.METADATA?.["METADATA-LOOKUP_TYPE"]?.Lookup ??
      meta?.RETS?.["METADATA-LOOKUP_TYPE"]?.Lookup ??
      meta?.METADATA?.["METADATA-LOOKUP_TYPE"]?.Lookup ??
      [];
    const arr = Array.isArray(lk) ? lk : [lk];
    console.log(`\n${name}: ${arr.length} entries. First 15:`);
    for (const l of arr.slice(0, 15)) {
      console.log(`  Value=${(l.Value||"").toString().padEnd(20)} LongValue=${(l.LongValue||"").toString().padEnd(40)} ShortValue=${l.ShortValue || ""}`);
    }
    // Look for Calgary specifically
    const cal = arr.filter((l: any) => /calgary|active/i.test(`${l.Value} ${l.LongValue} ${l.ShortValue}`));
    if (cal.length && cal.length < arr.length) {
      console.log("  Matches for calgary/active:");
      for (const l of cal.slice(0, 10)) {
        console.log(`    Value=${l.Value} LongValue=${l.LongValue} ShortValue=${l.ShortValue}`);
      }
    }
  }
  dumpLookups("City", cityLk);
  dumpLookups("StandardStatus", ssLk);
  dumpLookups("MlsStatus", mlsLk);

  await client.logout();
}
main().catch((e) => { console.error(e); process.exit(1); });
