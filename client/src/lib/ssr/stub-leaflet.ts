// SSR stand-in for the `leaflet` package. Leaflet touches `window` at module
// scope, so importing the real thing server-side crashes the render. Pages
// never draw maps on the server (map blocks are <ClientOnly>), but prop
// expressions like `icon={buildPricePill(...)}` still execute L.divIcon()
// while React evaluates JSX — so every property access and call on this stub
// must succeed and return something equally callable.
const noop: any = new Proxy(function () {}, {
  get: (_t, prop) => (prop === Symbol.toPrimitive ? () => "" : noop),
  apply: () => noop,
  construct: () => noop,
});

export default noop;
