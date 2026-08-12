// Server-side render entry. Built separately from the client bundle
// (see script/build.ts) and invoked from server/ssr.ts.
//
// The server decides which routes render and prefetches their API data
// (it knows the port and can hit the storage-backed endpoints directly);
// this module only turns (url, seed data) into HTML + a dehydrated
// React Query state the browser rehydrates from.
import { renderToString } from "react-dom/server";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import App from "./App";

export interface SeedEntry {
  // Must exactly match the queryKey the page's useQuery uses —
  // the client joins key segments with "/" to build the fetch URL.
  key: unknown[];
  data: unknown;
}

export interface RenderResult {
  html: string;
  // Serialized React Query cache for hydration in main.tsx.
  dehydratedState: unknown;
}

export async function render(
  path: string,
  search: string,
  seed: SeedEntry[],
): Promise<RenderResult> {
  // Fresh client per request — never share cache across requests.
  // staleTime Infinity mirrors the browser config so hydrated queries
  // don't refetch on mount.
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  for (const { key, data } of seed) {
    client.setQueryData(key, data);
  }

  const html = renderToString(
    <App ssrPath={path} ssrSearch={search} client={client} />,
  );
  const dehydratedState = dehydrate(client);
  client.clear();
  return { html, dehydratedState };
}
