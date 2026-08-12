// Renders children only after the component has mounted in a real browser.
// Server render and the client's hydration pass both produce the fallback,
// so the two trees match; the real children appear on the next paint.
// Wrap anything browser-bound (Leaflet maps) that lives on an SSR'd page.
import { useEffect, useState, type ReactNode } from "react";

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
}
