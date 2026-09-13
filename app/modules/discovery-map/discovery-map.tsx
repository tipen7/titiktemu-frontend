"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ConfidenceBadge } from "@/app/components/ui/confidence-badge";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MapLegend } from "@/app/components/map/map-legend";
import { AiPanel } from "@/app/components/modules/ai-panel";
import { useCurrentLocation } from "@/app/hooks/use-current-location";
import { useGrid } from "@/app/hooks/use-grid";
import { useModelAccuracy } from "@/app/hooks/use-model-accuracy";
import { useZoneLookup } from "@/app/hooks/use-zone-lookup";
import { useUmkm } from "@/app/hooks/use-umkm";
import { downloadCsv } from "@/app/lib/csv";
import type { ZoneLabel } from "@/app/types/zones";

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
const CurrentLocationMarker = dynamic(
  () => import("@/app/components/map/current-location-marker").then((mod) => mod.CurrentLocationMarker),
  { ssr: false },
);

const ZONE_BADGE_VARIANT: Record<ZoneLabel, "secondary" | "default" | "primary"> = {
  aman: "secondary",
  waspada: "default",
  bahaya: "primary",
};

const FILTERS = [
  { label: "Semua Titik", ews: undefined },
  { label: "Bahaya", ews: 2 },
  { label: "Waspada", ews: 1 },
  { label: "Aman", ews: 0 },
] as const;

export default function DiscoveryMap() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: grid, isLoading: isGridLoading, isError: isGridError } = useGrid();
  const { data: modelAccuracy } = useModelAccuracy();
  const { location: currentLocation } = useCurrentLocation();

  const [ewsFilter, setEwsFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data: candidates, isLoading: isCandidatesLoading } = useUmkm({
    search: search || undefined,
    ews_code: ewsFilter,
    limit: 50,
  });

  const selectedId = searchParams.get("umkm");
  const selected = candidates?.rows.find((row) => row.id === selectedId) ?? null;
  const clickedLocationFromParams = (() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  })();
  const activeLocation = selected
    ? { lat: selected.latitude, lng: selected.longitude }
    : clickedLocationFromParams;

  const { data: zone, isLoading: isZoneLoading } = useZoneLookup(activeLocation);

  // Selection is reflected in the URL (deep-linkable/shareable) rather than
  // only in component state -- per UX guidance on reflecting dynamic view
  // state in the URL.
  function selectUmkm(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("umkm", id);
    params.delete("lat");
    params.delete("lng");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function selectMapPoint(lat: number, lng: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("umkm");
    params.set("lat", String(lat));
    params.set("lng", String(lng));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function exportCsv() {
    if (!candidates?.rows.length) return;
    downloadCsv(
      `discovery-map-${ewsFilter ?? "semua"}.csv`,
      candidates.rows.map((row) => ({
        nama: row.name,
        kategori: row.category,
        kawasan: row.district_name,
        grid_id: row.grid_id,
        status: row.zone_label,
        indeks_kerentanan: row.vulnerability_index,
        jarak_ke_stasiun_m: row.dist_to_station_m,
      })),
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-h6 font-semibold">Discovery Map</h1>
          <p className="text-b8 text-neutral-600">Peta sebaran risiko gentrifikasi seluruh UMKM di kawasan.</p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari Kandidat"
            aria-label="Cari kandidat UMKM"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setEwsFilter(filter.ews)}
            aria-pressed={ewsFilter === filter.ews}
            className={`h-10 rounded-full border-2 px-4 text-b9 font-semibold transition-colors ${
              ewsFilter === filter.ews
                ? "border-primary-500 bg-primary-500 text-neutral-0"
                : "border-primary-500 text-primary-600 hover:bg-primary-100"
            }`}
          >
            {filter.label}
            {candidates && filter.ews !== undefined && (
              <span className={`ml-1 ${ewsFilter === filter.ews ? "text-neutral-0" : "text-neutral-400"}`}>
                ({candidates.rows.filter((r) => r.ews_code === filter.ews).length})
              </span>
            )}
          </button>
        ))}
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
            <LeafletMap
              onClick={selectMapPoint}
              flyTo={selected ? { lat: selected.latitude, lng: selected.longitude, zoom: 16 } : null}
            >
              <GeoJsonLayer data={grid} modelAccuracy={modelAccuracy} />
              {currentLocation && (
                <CurrentLocationMarker lat={currentLocation.lat} lng={currentLocation.lng} />
              )}
            </LeafletMap>
          )}
          <MapLegend caption="Grid resolution: 250m x 250m" />
          <AiPanel role="operator" />
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
          <div className="flex items-center justify-between">
            <h2 className="text-s6 font-semibold">
              {FILTERS.find((f) => f.ews === ewsFilter)?.label} ({candidates?.total ?? 0})
            </h2>
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={!candidates?.rows.length}>
              Export .csv
            </Button>
          </div>

          <div className="flex max-h-[520px] flex-col gap-2 overflow-y-auto">
            {isCandidatesLoading &&
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            {!isCandidatesLoading && candidates?.rows.length === 0 && (
              <p className="text-b9 text-neutral-500">Tidak ada UMKM yang cocok dengan filter ini.</p>
            )}
            {!isCandidatesLoading &&
              candidates?.rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => selectUmkm(row.id)}
                  aria-pressed={selectedId === row.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    selectedId === row.id ? "border-primary-500 bg-primary-50" : "border-border"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-b9 font-semibold text-neutral-900">{row.name ?? "-"}</p>
                    <p className="text-b9 text-neutral-500">
                      {row.dist_to_station_m !== null ? `${Math.round(row.dist_to_station_m)}m` : "-"} &middot;{" "}
                      {row.district_name}
                    </p>
                  </div>
                  {row.zone_label && (
                    <Badge variant={ZONE_BADGE_VARIANT[row.zone_label]}>{row.zone_label.toUpperCase()}</Badge>
                  )}
                </button>
              ))}
          </div>

          {(selected || clickedLocationFromParams) && (
            <div className="rounded-xl border border-border p-4">
              <h2 className="text-s6 font-semibold">Zone Detail</h2>
              {isZoneLoading && <Skeleton className="mt-2 h-24 w-full" />}
              {!isZoneLoading && !zone && (
                <p className="mt-2 text-b8 text-neutral-500">Lokasi ini di luar area studi.</p>
              )}
              {!isZoneLoading && zone && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={ZONE_BADGE_VARIANT[zone.zone_label]}>{zone.zone_label.toUpperCase()}</Badge>
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
                  {zone.narrative && <p className="text-b9 mt-1 text-neutral-600">{zone.narrative}</p>}
                  {zone.ews_code > 0 && (
                    <Button
                      size="sm"
                      render={<Link href={`/tenant-matching/?lat=${activeLocation?.lat}&lng=${activeLocation?.lng}`} />}
                    >
                      View Reallocation
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
