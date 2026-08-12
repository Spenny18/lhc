import { createRoot, hydrateRoot } from "react-dom/client";
import { hydrate } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import "./index.css";

// Migration safety net: anyone arriving with an old hash-style URL
// (e.g. /#/mls/A2305467 from a bookmark or stale Google index entry)
// gets transparently rewritten to the clean path (/mls/A2305467) before
// React Router boots. No flash, no extra navigation.
if (window.location.hash.startsWith("#/")) {
  const cleanPath = window.location.hash.slice(1); // strips the leading "#"
  window.history.replaceState(null, "", cleanPath || "/");
}

const root = document.getElementById("root")!;

// Server-rendered pages ship their React Query cache in __RRE_STATE__ and
// mark the root with data-ssr. Hydrate those; everything else (admin,
// /mls search, any SSR fallback) client-renders as before.
const ssrState = (window as any).__RRE_STATE__;
if (ssrState) {
  hydrate(queryClient, ssrState);
}

if (root.hasAttribute("data-ssr")) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
