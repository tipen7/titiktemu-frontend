"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { AiPanel } from "@/app/components/modules/ai-panel";
import { MapLegend } from "@/app/components/map/map-legend";
import { useCurrentLocation } from "@/app/hooks/use-current-location";
import { useGrid } from "@/app/hooks/use-grid";
import { useModelAccuracy } from "@/app/hooks/use-model-accuracy";
import { useZoneLookup } from "@/app/hooks/use-zone-lookup";
import { useUmkm } from "@/app/hooks/use-umkm";
import { useDashboardSummary } from "@/app/hooks/use-dashboard-summary";
import { usePolicy } from "@/app/hooks/use-policy";
import type { ZoneLabel } from "@/app/types/zones";

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

type Mode = "umkm" | "operator";

export default function Home() {
  const [mode, setMode] = useState<Mode>("umkm");
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedUmkmId, setSelectedUmkmId] = useState<string | null>(null);
  const [priceSortAsc, setPriceSortAsc] = useState(false);
  const [safeOnly, setSafeOnly] = useState(false);
  const [search, setSearch] = useState("");

  const { data: grid, isLoading: isGridLoading } = useGrid();
  const { data: modelAccuracy } = useModelAccuracy();
  const { location: currentLocation } = useCurrentLocation();

  const { data: umkmResult, isLoading: isUmkmLoading } = useUmkm({
    search: search || undefined,
    ews_code: safeOnly ? 0 : undefined,
    limit: 8,
  });
  const umkmList = [...(umkmResult?.rows ?? [])].sort((a, b) => {
    if (!priceSortAsc) return 0;
    return (a.reference_price_per_txn_idr ?? Infinity) - (b.reference_price_per_txn_idr ?? Infinity);
  });
  const selectedUmkm = umkmList.find((u) => u.id === selectedUmkmId) ?? null;

  const activeLocation = selectedUmkm
    ? { lat: selectedUmkm.latitude, lng: selectedUmkm.longitude }
    : clickedLocation;
  const { data: zone, isLoading: isZoneLoading } = useZoneLookup(activeLocation);

  const { data: summary } = useDashboardSummary();
  const { data: recommendations } = usePolicy();

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h6 font-semibold">Beranda</h1>
          <p className="text-b8 text-neutral-600">
            {mode === "umkm"
              ? "Temukan zona risiko dan UMKM di sekitar Anda."
              : "Ringkasan kondisi kawasan dan rekomendasi alokasi terkini."}
          </p>
        </div>
        <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="umkm">Mode UMKM</SelectItem>
            <SelectItem value="operator">Mode Operator</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          {!isGridLoading && (
            <LeafletMap
              onClick={(lat, lng) => {
                setSelectedUmkmId(null);
                setClickedLocation({ lat, lng });
              }}
              flyTo={selectedUmkm ? { lat: selectedUmkm.latitude, lng: selectedUmkm.longitude, zoom: 16 } : null}
            >
              <GeoJsonLayer data={grid} modelAccuracy={modelAccuracy} />
              {currentLocation && (
                <CurrentLocationMarker lat={currentLocation.lat} lng={currentLocation.lng} />
              )}
            </LeafletMap>
          )}
          <MapLegend />
          <AiPanel role={mode === "operator" ? "operator" : "umkm"} />
        </div>

        {mode === "umkm" ? (
          <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
            <h2 className="text-s6 font-semibold text-neutral-900">Temukan UMKM Favoritmu!</h2>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari Jasa/Barang"
              aria-label="Cari UMKM"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSafeOnly((v) => !v)}
                aria-pressed={safeOnly}
                className={`h-8 rounded-full border-2 px-3 text-b9 font-semibold ${
                  safeOnly ? "border-secondary-500 bg-secondary-500 text-neutral-0" : "border-secondary-600 text-secondary-700"
                }`}
              >
                Zona Aman
              </button>
              <button
                type="button"
                onClick={() => setPriceSortAsc((v) => !v)}
                aria-pressed={priceSortAsc}
                className={`h-8 rounded-full border-2 px-3 text-b9 font-semibold ${
                  priceSortAsc ? "border-primary-500 bg-primary-500 text-neutral-0" : "border-primary-500 text-primary-600"
                }`}
              >
                Harga Terjangkau
              </button>
            </div>

            {activeLocation && (
              <div className="rounded-xl border border-border p-3">
                {selectedUmkm && (
                  <p className="mb-2 text-b9 font-semibold text-neutral-900">{selectedUmkm.name}</p>
                )}
                {isZoneLoading && <Skeleton className="h-16 w-full" />}
                {!isZoneLoading && zone && (
                  <div className="flex flex-col gap-1">
                    <Badge variant={ZONE_BADGE_VARIANT[zone.zone_label]}>{zone.zone_label.toUpperCase()}</Badge>
                    <p className="text-b9 text-neutral-600">
                      Grid {zone.grid_id} &middot; {zone.district_name ?? "-"}
                    </p>
                    <p className="text-b9 text-neutral-600">
                      Indeks kerentanan: {zone.vulnerability_index.toFixed(3)}
                    </p>
                  </div>
                )}
                {!isZoneLoading && !zone && (
                  <p className="text-b9 text-neutral-500">Lokasi ini di luar area studi.</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {isUmkmLoading &&
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              {!isUmkmLoading && umkmList.length === 0 && (
                <p className="text-b9 text-neutral-500">Tidak ada UMKM yang cocok.</p>
              )}
              {!isUmkmLoading &&
                umkmList.map((umkm) => (
                  <button
                    key={umkm.id}
                    type="button"
                    onClick={() => {
                      setClickedLocation(null);
                      setSelectedUmkmId(umkm.id);
                    }}
                    aria-pressed={selectedUmkmId === umkm.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                      selectedUmkmId === umkm.id ? "border-primary-500 bg-primary-50" : "border-border"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-b9 font-semibold text-neutral-900">{umkm.name ?? "-"}</p>
                      <p className="text-b9 text-neutral-500">
                        {umkm.dist_to_station_m !== null
                          ? `${Math.round(umkm.dist_to_station_m)}m dari stasiun`
                          : umkm.district_name}
                      </p>
                    </div>
                    {umkm.zone_label && (
                      <Badge variant={ZONE_BADGE_VARIANT[umkm.zone_label]}>{umkm.zone_label.toUpperCase()}</Badge>
                    )}
                  </button>
                ))}
            </div>
          </aside>
        ) : (
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
            <h2 className="text-s6 font-semibold text-neutral-900">Panel Informasi</h2>

            {summary && (
              <div className="rounded-xl border border-border p-4">
                <p className="text-b9 text-neutral-500">Status Tiap Zona</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-s6 font-semibold text-primary-700">{summary.danger_zone_pct}%</p>
                    <p className="text-b9 text-neutral-500">Bahaya</p>
                  </div>
                  <div>
                    <p className="text-s6 font-semibold text-neutral-900">
                      {Math.round((summary.moderate_zone_count / summary.total_grid_cells) * 100)}%
                    </p>
                    <p className="text-b9 text-neutral-500">Waspada</p>
                  </div>
                  <div>
                    <p className="text-s6 font-semibold text-secondary-700">
                      {Math.round((summary.safe_zone_count / summary.total_grid_cells) * 100)}%
                    </p>
                    <p className="text-b9 text-neutral-500">Aman</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-b9 font-semibold text-neutral-500">Rekomendasi Alokasi Terkini</p>
              {!recommendations?.length && (
                <p className="text-b9 text-neutral-500">Belum ada rekomendasi tersedia.</p>
              )}
              {recommendations?.slice(0, 3).map((item) => (
                <div key={item.grid_id} className="rounded-xl border border-border p-3">
                  <p className="text-b9 font-semibold text-neutral-900">
                    {item.district_name ?? item.grid_id}
                  </p>
                  <p className="mt-1 line-clamp-3 text-b9 text-neutral-600">{item.narrative}</p>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
