// Aerial map preview using Google Static Maps. Renders as a single <img>
// once the API key is fetched from /api/public/config — no JS runtime, no
// react-leaflet bundle, no flash of unstyled tiles. Drop-in for any
// component that has a lat/lng and wants a quick visual confirmation that
// the selected property is the right one.

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/queryClient";

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  width?: number;
  height?: number;
  /** "hybrid" shows satellite + labels — best for property identification. */
  mapType?: "roadmap" | "satellite" | "hybrid" | "terrain";
  alt?: string;
}

// Cached at module level so the second component instance on the same page
// (or the same render after a state update) reuses the in-flight promise
// instead of refetching.
let keyPromise: Promise<string> | null = null;
function loadKey(): Promise<string> {
  if (keyPromise) return keyPromise;
  keyPromise = fetch(apiUrl("/api/public/config"))
    .then((r) => r.json())
    .then((d) => d?.googleMapsApiKey ?? "")
    .catch(() => "");
  return keyPromise;
}

export function StaticMapPreview({
  lat,
  lng,
  zoom = 19,
  width = 600,
  height = 280,
  mapType = "hybrid",
  alt = "Property location preview",
}: Props) {
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadKey().then((k) => {
      if (!cancelled) setKey(k);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!key) {
    // Render a sized placeholder so the layout doesn't jump when the image
    // arrives. Same colour as the inputs around it.
    return (
      <div
        className="bg-secondary/40 rounded-sm border border-border w-full"
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-hidden
      />
    );
  }

  // Retina: 2x the displayed pixel count via `scale=2`; ask for the larger
  // dimensions and let CSS scale down.
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: String(zoom),
    size: `${width}x${height}`,
    scale: "2",
    maptype: mapType,
    markers: `color:0xD4AF37|${lat},${lng}`,
    key,
  });
  const src = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className="w-full h-auto rounded-sm border border-border"
      style={{ aspectRatio: `${width} / ${height}` }}
    />
  );
}
