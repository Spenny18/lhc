import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Leaflet reads `window` at module scope, which crashes server rendering the
// moment a page that imports it is loaded. During SSR (dev ssrLoadModule and
// the entry-server build) redirect `leaflet`/`react-leaflet` to no-op stubs.
// Map UI is wrapped in <ClientOnly> so nothing visual is lost server-side.
// The CSS import ("leaflet/dist/leaflet.css") is left alone — Vite already
// handles CSS safely in SSR.
function ssrLeafletStubs(): Plugin {
  const stubs: Record<string, string> = {
    leaflet: path.resolve(
      import.meta.dirname,
      "client/src/lib/ssr/stub-leaflet.ts",
    ),
    "react-leaflet": path.resolve(
      import.meta.dirname,
      "client/src/lib/ssr/stub-react-leaflet.ts",
    ),
  };
  return {
    name: "rre:ssr-leaflet-stubs",
    enforce: "pre",
    resolveId(source, _importer, options) {
      // options.ssr is the classic flag; environment.name covers Vite 7's
      // environments API where dev-server ssrLoadModule may not set it.
      const isSsr =
        options?.ssr === true ||
        (this as any)?.environment?.name === "ssr";
      if (isSsr && stubs[source]) return stubs[source];
      return null;
    },
  };
}

export default defineConfig({
  plugins: [ssrLeafletStubs(), react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  // Keep leaflet/react-leaflet inside the SSR module pipeline (dev would
  // otherwise externalize them to native Node imports, bypassing the stub
  // plugin above and crashing on leaflet's module-scope `window` access).
  ssr: {
    noExternal: ["leaflet", "react-leaflet", "@react-leaflet/core"],
  },
  root: path.resolve(import.meta.dirname, "client"),
  // Absolute base ("/") so deep routes under BrowserRouter resolve assets
  // from the site root. Was "./" — that produced relative URLs that worked
  // under the old HashRouter (URL bar stayed at /) but 404'd on any deep
  // path like /condos/the-river, leaving the page blank.
  base: "/",
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
