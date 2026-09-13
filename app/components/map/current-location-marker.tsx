"use client";

import { CircleMarker, Popup, Tooltip } from "react-leaflet";

/**
 * The real "you are here" dot -- distinct blue (never reused for EWS
 * red/yellow/green) so it never gets mistaken for a zone marker. Only
 * rendered when a real browser-geolocated coordinate exists (see
 * app/hooks/use-current-location.ts) -- no default/fabricated position.
 */
export function CurrentLocationMarker({ lat, lng }: { lat: number; lng: number }) {
  return (
    <>
      <CircleMarker
        center={[lat, lng]}
        radius={14}
        pathOptions={{ color: "#2563eb", weight: 0, fillColor: "#2563eb", fillOpacity: 0.15 }}
        interactive={false}
      />
      <CircleMarker
        center={[lat, lng]}
        radius={7}
        pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#2563eb", fillOpacity: 1 }}
      >
        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
          Lokasi Anda
        </Tooltip>
        <Popup>Lokasi Anda saat ini</Popup>
      </CircleMarker>
    </>
  );
}
