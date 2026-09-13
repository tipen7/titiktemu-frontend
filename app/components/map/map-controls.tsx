"use client";

import { useMap } from "react-leaflet";

/**
 * Real (not decorative) zoom + expand controls, floated top-right of the map
 * per the Figma frame. Must be rendered as a child of `LeafletMap` (inside
 * react-leaflet's `MapContainer`) so `useMap()` resolves to the live map
 * instance -- see how `GeoJsonLayer`/`CurrentLocationMarker` are composed in
 * discovery-map.tsx.
 */
export function MapControls({
  expanded,
  onExpandToggle,
}: {
  expanded?: boolean;
  onExpandToggle?: () => void;
}) {
  const map = useMap();

  return (
    <nav
      aria-label="Map controls"
      className="absolute top-3 right-3 z-[900] flex flex-col items-end gap-2"
    >
      {onExpandToggle && (
        <button
          type="button"
          onClick={onExpandToggle}
          className="rounded-lg bg-neutral-100 px-3 py-1.5 text-b9 font-semibold text-neutral-900 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.04)] hover:bg-neutral-200"
        >
          {expanded ? "Kecilkan" : "Expand"}
        </button>
      )}
      <div className="flex flex-col overflow-hidden rounded-lg bg-neutral-100 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          aria-label="Perbesar peta"
          onClick={() => map.zoomIn()}
          className="flex size-9 items-center justify-center text-base font-semibold text-neutral-900 hover:bg-neutral-200"
        >
          +
        </button>
        <div className="h-px w-full bg-neutral-200" aria-hidden="true" />
        <button
          type="button"
          aria-label="Perkecil peta"
          onClick={() => map.zoomOut()}
          className="flex size-9 items-center justify-center text-base font-semibold text-neutral-900 hover:bg-neutral-200"
        >
          &minus;
        </button>
      </div>
    </nav>
  );
}
