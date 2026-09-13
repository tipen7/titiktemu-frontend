"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ConfidenceBadge } from "@/app/components/ui/confidence-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useGrid } from "@/app/hooks/use-grid";
import { useModelAccuracy } from "@/app/hooks/use-model-accuracy";
import { useZoneLookup } from "@/app/hooks/use-zone-lookup";
import { MOCK_UMKM } from "@/app/lib/mock-umkm";
import { AiPanel } from "@/app/components/modules/ai-panel";

// react-leaflet touches `window` at module-load time, which crashes Next's
// server-side prerender pass -- both of these must be dynamically imported
// with ssr:false, not just the outer <LeafletMap>.
const LeafletMap = dynamic(
  () => import("@/app/components/map/leaflet-map").then((mod) => mod.LeafletMap),
  { ssr: false },
);
const GeoJsonLayer = dynamic(
  () => import("@/app/components/map/geojson-layer").then((mod) => mod.GeoJsonLayer),
  { ssr: false },
);

const ZONE_BADGE_VARIANT = {
  aman: "secondary",
  waspada: "default",
  bahaya: "primary",
} as const;

export default function DiscoveryMap() {
  const { data: grid, isLoading: isGridLoading, isError: isGridError } = useGrid();
  const [selectedUmkmId, setSelectedUmkmId] = useState<string>(MOCK_UMKM[0]?.id ?? "");
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const selectedUmkm = MOCK_UMKM.find((umkm) => umkm.id === selectedUmkmId) ?? null;
  const activeLocation =
    clickedLocation ?? (selectedUmkm ? { lat: selectedUmkm.lat, lng: selectedUmkm.lng } : null);

  const { data: zone, isLoading: isZoneLoading } = useZoneLookup(activeLocation);
  const { data: modelAccuracy } = useModelAccuracy();

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-h6 font-semibold">UMKM Self Discovery Tracker</h1>
        <p className="text-b8 text-neutral-600">
          Click anywhere on the map, or pick a test UMKM below, to see its gentrification
          risk zone.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={selectedUmkmId}
          onValueChange={(value) => {
            setSelectedUmkmId(value as string);
            setClickedLocation(null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a test UMKM" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_UMKM.map((umkm) => (
              <SelectItem key={umkm.id} value={umkm.id}>
                {umkm.name} ({umkm.district})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {clickedLocation && (
          <span className="text-b9 text-neutral-500">
            Showing clicked location ({clickedLocation.lat.toFixed(4)},{" "}
            {clickedLocation.lng.toFixed(4)})
          </span>
        )}
      </div>

      {isGridError && (
        <p className="text-b8 text-destructive">
          Could not load the zone map -- is the backend running at{" "}
          {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}?
        </p>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          {!isGridLoading && (
            <LeafletMap onClick={(lat, lng) => setClickedLocation({ lat, lng })}>
              <GeoJsonLayer data={grid} modelAccuracy={modelAccuracy} />
            </LeafletMap>
          )}
          <AiPanel role="operator" />
        </div>

        <aside className="w-full shrink-0 rounded-xl border border-border p-4 lg:w-80">
          <h2 className="text-s6 font-semibold">Zone Detail</h2>
          {isZoneLoading && <p className="text-b8 text-neutral-500">Loading...</p>}
          {!isZoneLoading && !zone && (
            <p className="text-b8 text-neutral-500">
              No zone data for this location (outside the study area).
            </p>
          )}
          {zone && (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={ZONE_BADGE_VARIANT[zone.zone_label]}>
                  {zone.zone_label.toUpperCase()}
                </Badge>
                <ConfidenceBadge modelAccuracy={zone.model_accuracy} />
              </div>
              <dl className="text-b8 flex flex-col gap-1">
                <div>
                  <dt className="inline font-semibold">Grid: </dt>
                  <dd className="inline">{zone.grid_id}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">District: </dt>
                  <dd className="inline">{zone.district_name ?? "-"}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Vulnerability index: </dt>
                  <dd className="inline">{zone.vulnerability_index.toFixed(3)}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Matching score: </dt>
                  <dd className="inline">{zone.matching_score.toFixed(1)}</dd>
                </div>
              </dl>
              {zone.narrative && (
                <p className="text-b9 mt-1 text-neutral-600">{zone.narrative}</p>
              )}
              {zone.ews_code > 0 && (
                <Button
                  size="sm"
                  render={
                    <Link
                      href={`/tenant-matching/?lat=${activeLocation?.lat}&lng=${activeLocation?.lng}`}
                    />
                  }
                >
                  View Reallocation
                </Button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
