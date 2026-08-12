// Loads the Google Maps JS API on demand and caches the load promise so
// multiple components calling the hook share a single <script> tag.
//
// Pulls the API key from /api/public/config the first time it's needed.
// The key is referrer-restricted in GCP Console, so exposing it to the
// browser is the standard pattern (and required for the Maps client lib).
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/queryClient";

let mapsPromise: Promise<typeof google> | null = null;
let configPromise: Promise<{ googleMapsApiKey: string }> | null = null;

function loadConfig(): Promise<{ googleMapsApiKey: string }> {
  if (configPromise) return configPromise;
  configPromise = fetch(apiUrl("/api/public/config"))
    .then((r) => r.json())
    .catch(() => ({ googleMapsApiKey: "" }));
  return configPromise;
}

function loadMaps(): Promise<typeof google> {
  if (mapsPromise) return mapsPromise;
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));

  mapsPromise = (async () => {
    const { googleMapsApiKey } = await loadConfig();
    if (!googleMapsApiKey) {
      throw new Error("Google Maps API key not configured.");
    }
    // If Maps was already loaded by another script, reuse it.
    if ((window as any).google?.maps?.places) {
      return (window as any).google;
    }
    return new Promise<typeof google>((resolve, reject) => {
      const cbName = `__gmapsReady_${Math.random().toString(36).slice(2)}`;
      (window as any)[cbName] = () => {
        delete (window as any)[cbName];
        resolve((window as any).google);
      };
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        googleMapsApiKey,
      )}&libraries=places&loading=async&callback=${cbName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error("Google Maps script failed to load."));
      document.head.appendChild(script);
    });
  })();
  return mapsPromise;
}

export function useGoogleMaps() {
  const [ready, setReady] = useState<boolean>(
    typeof window !== "undefined" && !!(window as any).google?.maps?.places,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Maps failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  return { ready, error };
}
