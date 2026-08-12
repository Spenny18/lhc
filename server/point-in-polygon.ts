// Ray-cast point-in-polygon test. Handles GeoJSON Polygon and MultiPolygon
// geometries (Polygon = exterior ring + optional interior holes,
// MultiPolygon = list of Polygons). Coordinates are GeoJSON-order:
// [lng, lat].
//
// Used to geofence MLS listings into their actual neighbourhood when CREB's
// `neighbourhood` field lists a parent district that's wider than what
// Spencer expects (e.g. listings on Bessborough Drive in Currie Barracks
// tagged "Upper Mount Royal" because of how CREB groups Mount Royal-area
// districts).

type Point = [number, number]; // [lng, lat]
type Ring = number[][];

export type PolygonGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

function pointInRing(point: Point, ring: Ring): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point: Point, polygon: number[][][]): boolean {
  if (polygon.length === 0) return false;
  // First ring is the exterior; subsequent rings are holes.
  if (!pointInRing(point, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false; // inside a hole
  }
  return true;
}

export function pointInGeometry(
  lng: number,
  lat: number,
  geom: PolygonGeometry,
): boolean {
  const point: Point = [lng, lat];
  if (geom.type === "Polygon") return pointInPolygon(point, geom.coordinates);
  return geom.coordinates.some((poly) => pointInPolygon(point, poly));
}
