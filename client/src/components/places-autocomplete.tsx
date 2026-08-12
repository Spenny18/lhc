// Address-only autocomplete input powered by Google Places.
//
// Biases results to Calgary (sw_lat,lng / ne_lat,lng bounding box covering
// the city + surrounding bedroom communities) and restricts to Canada so
// stray US matches don't appear in the dropdown.

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/lib/use-google-maps";

export interface PlaceSelection {
  formattedAddress: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  /** Street-only address (e.g. "38 Elmont Cove SW") with full street-type
   *  spelled out, no city/province/country. Gnowise prefers this. */
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  province?: string;
}

// Google Maps abbreviates street types in formatted_address ("Cove" -> "Cv",
// "Avenue" -> "Ave"); Gnowise's address matcher does worse with the
// abbreviated forms. Expand back to full words when we can.
const STREET_TYPE_EXPANSIONS: Record<string, string> = {
  Av: "Avenue",
  Ave: "Avenue",
  Blvd: "Boulevard",
  Cir: "Circle",
  Cl: "Close",
  Cres: "Crescent",
  Crt: "Court",
  Ct: "Court",
  Cv: "Cove",
  Dr: "Drive",
  Gdns: "Gardens",
  Gr: "Grove",
  Grn: "Green",
  Hts: "Heights",
  Hwy: "Highway",
  Lndg: "Landing",
  Mews: "Mews",
  Mt: "Mount",
  Pkwy: "Parkway",
  Pl: "Place",
  Pt: "Point",
  Rd: "Road",
  Rdg: "Ridge",
  Rise: "Rise",
  Sq: "Square",
  St: "Street",
  Terr: "Terrace",
  Tr: "Trail",
  Vw: "View",
  Way: "Way",
};
function expandStreetType(streetAddress: string): string {
  return streetAddress.replace(/\b([A-Z][a-z]*)\b/g, (m) => {
    return STREET_TYPE_EXPANSIONS[m] ?? m;
  });
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (place: PlaceSelection) => void;
  placeholder?: string;
  id?: string;
  "data-testid"?: string;
  className?: string;
}

// Calgary bounding box used to bias autocomplete results. ne ≈ Cochrane /
// Airdrie corner; sw ≈ Springbank / De Winton corner. Wide enough to cover
// all CREB markets without bleeding into other Alberta cities.
const CALGARY_BIAS = {
  ne: { lat: 51.25, lng: -113.85 },
  sw: { lat: 50.85, lng: -114.35 },
};

export function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  id,
  className,
  "data-testid": dataTestId,
}: Props) {
  const { ready } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const ac = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!ready || !inputRef.current) return;
    const g = (window as any).google as typeof google;
    if (!g?.maps?.places) return;

    const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "ca" },
      bounds: new g.maps.LatLngBounds(
        new g.maps.LatLng(CALGARY_BIAS.sw.lat, CALGARY_BIAS.sw.lng),
        new g.maps.LatLng(CALGARY_BIAS.ne.lat, CALGARY_BIAS.ne.lng),
      ),
      // Bias = soft preference (still lets users pick out-of-bounds);
      // a strict bounds restriction would frustrate anyone evaluating a
      // home in Canmore, Okotoks, etc.
      strictBounds: false,
      fields: [
        "formatted_address",
        "address_components",
        "geometry",
        "place_id",
        "name",
      ],
    });
    ac.current = autocomplete;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const formatted =
        place.formatted_address ?? place.name ?? inputRef.current?.value ?? "";
      onChange(formatted);

      // Parse address_components into structured fields. Gnowise's matcher
      // does much better with separate street / postal / city / province
      // than the full formatted_address string (which Google abbreviates
      // and suffixes with ", Canada").
      const comps = place.address_components ?? [];
      const get = (type: string, short = false): string | undefined => {
        const c = comps.find((c) => c.types.includes(type));
        return c ? (short ? c.short_name : c.long_name) : undefined;
      };
      const streetNumber = get("street_number");
      const route = get("route");
      const streetAddressRaw =
        streetNumber && route
          ? `${streetNumber} ${route}`
          : route
            ? route
            : undefined;
      const streetAddress = streetAddressRaw
        ? expandStreetType(streetAddressRaw)
        : undefined;

      onSelect?.({
        formattedAddress: formatted,
        placeId: place.place_id,
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
        streetAddress,
        postalCode: get("postal_code"),
        city: get("locality") ?? get("sublocality") ?? get("postal_town"),
        province: get("administrative_area_level_1", true),
      });
    });

    return () => {
      listener.remove();
      ac.current = null;
    };
  }, [ready, onChange, onSelect]);

  return (
    <Input
      ref={inputRef}
      id={id}
      className={className}
      data-testid={dataTestId}
      placeholder={
        placeholder ?? (ready ? "Start typing an address…" : "Loading…")
      }
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
    />
  );
}
