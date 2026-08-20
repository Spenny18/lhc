/**
 * CLI view of the SEO keyword report — same engine the /admin/seo console uses.
 *
 *   SEO_BASE=http://127.0.0.1:5000 npx tsx script/seo-report.ts
 *
 * Useful for spot-checking after a content import without opening the admin.
 */
import { buildSeoReport } from "../server/seo-keywords";

const base = process.env.SEO_BASE || "http://127.0.0.1:5000";
const r = await buildSeoReport({ baseUrl: base });

console.log(`${r.pageCount} pages · crawled in ${(r.crawlMs / 1000).toFixed(1)}s · avg score ${r.summary.avgScore}`);
console.log(`strong ${r.summary.strong} · fair ${r.summary.fair} · weak ${r.summary.weak}`);
console.log(`conflicts ${r.summary.conflicts} · orphans ${r.summary.orphans}`);
console.log(r.gsc.ok ? `Search Console: ${r.gsc.rows} page/query rows` : `Search Console: ${r.gsc.message}`);

console.log("\nCLUSTERS");
for (const c of r.clusters) {
  console.log(`  ${String(c.pages).padStart(3)} pages · avg ${String(c.avgScore).padStart(3)} · ${String(c.conflicts).padStart(2)} conflicts · ${c.label}`);
}

const seen = new Set<string>();
console.log("\nCANNIBALIZATION");
for (const p of r.pages) {
  for (const c of p.conflicts) {
    const key = [p.path, c.path].sort().join("::");
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  "${p.focusKeyword}"`);
    console.log(`     ${p.path}${p.isPillar ? "  (pillar)" : ""}`);
    console.log(`     ${c.path}`);
    if (p.suggestedKeyword) console.log(`     → re-target to "${p.suggestedKeyword}"`);
  }
}

console.log("\nWEAKEST 10");
for (const p of r.pages.slice(0, 10)) {
  console.log(`  ${String(p.score).padStart(3)}  ${p.path}  kw="${p.focusKeyword}"`);
  if (p.issues.length) console.log(`       ${p.issues.join(" · ")}`);
}
