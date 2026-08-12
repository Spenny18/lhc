// SSR stand-in for `react-leaflet` (see stub-leaflet.ts). Components render
// nothing; hooks return the leaflet noop proxy. Covers every name imported
// anywhere in client/src — extend the list if a new react-leaflet import is
// added.
import stub from "./stub-leaflet";

const NullComponent = (_props: any) => null;

export const MapContainer = NullComponent;
export const TileLayer = NullComponent;
export const Marker = NullComponent;
export const Popup = NullComponent;
export const CircleMarker = NullComponent;
export const Circle = NullComponent;
export const Tooltip = NullComponent;
export const Polyline = NullComponent;
export const Polygon = NullComponent;
export const useMap = () => stub;
export const useMapEvents = () => stub;
export const useMapEvent = () => stub;
