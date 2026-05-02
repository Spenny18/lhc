import "dotenv/config";
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
  const result = await client.search({
    resource: "Property",
    class: "Property",
    query: "(StandardStatus=|A),(PostalCode=T2*),(ListPrice=1000000+)",
    select:
      "ListingId,ListPrice,City,StandardStatus,UnparsedAddress,BedroomsTotal,BathroomsTotalInteger,LivingAreaSF,PropertyType,PropertySubType,Latitude,Longitude,PhotosCount,PublicRemarks,ModificationTimestamp,YearBuilt,PostalCode",
    limit: 3,
  });
  console.log(`Total available: ${result.total}`);
  console.log("Columns:", result.columns);
  console.log("\nFirst row:");
  console.log(JSON.stringify(result.rows[0], null, 2));
  console.log("\nSecond row:");
  console.log(JSON.stringify(result.rows[1], null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
