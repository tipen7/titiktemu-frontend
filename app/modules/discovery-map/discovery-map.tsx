"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AiPanel } from "@/app/components/modules/ai-panel";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ConfidenceBadge } from "@/app/components/ui/confidence-badge";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useGrid } from "@/app/hooks/use-grid";
import { useModelAccuracy } from "@/app/hooks/use-model-accuracy";
import { useUmkm } from "@/app/hooks/use-umkm";
import { useZoneLookup } from "@/app/hooks/use-zone-lookup";
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

const ZONE_BADGE_VARIANT: Record<ZoneLabel, "secondary" | "default" | "primary"> = {
  aman: "secondary",
  waspada: "default",
  bahaya: "primary",
};

const RISK_FILTERS = [
  { value: "all", label: "Semua Titik" },
  { value: "2", label: "Risiko Tinggi" },
  { value: "1", label: "Warning" },
] as const;

function downloadCsv(rows: { name: string | null; grid_id: string; district_name: string | null; vulnerability_index: number | null; dist_to_station_m: number | null }[]) {
  const header = "Nama Usaha,Blok/Grid ID,Kawasan,Indeks Kerentanan,Jarak ke Stasiun (m)";
  const lines = rows.map((r) =>
    [r.name ?? "-", r.grid_id, r.district_name ?? "-", r.vulnerability_index ?? "-", r.dist_to_station_m ?? "-"]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "discovery-map-risiko-tinggi.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function DiscoveryMap() {
  const searchParams = useSearchParams();
  const paramLat = searchParams.get("lat");
  const paramLng = searchParams.get("lng");

  const { data: grid, isLoading: isGridLoading, isError: isGridError } = useGrid();
  const { data: modelAccuracy } = useModelAccuracy();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<(typeof RISK_FILTERS)[number]["value"]>("all");
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(
    paramLat !== null && paramLng !== null ? { lat: Number(paramLat), lng: Number(paramLng) } : null,
  );

  const { data: zone, isLoading: isZoneLoading } = useZoneLookup(clickedLocation);

  const { data: umkmResult, isLoading: isUmkmLoading } = useUmkm({
    search: search || undefined,
    ews_code: riskFilter === "all" ? undefined : Number(riskFilter),
    limit: 50,
  });
  const riskList = useMemo(
    () =>
      [...(umkmResult?.rows ?? [])].sort(
        (a, b) => (b.vulnerability_index ?? 0) - (a.vulnerability_index ?? 0),
      ),
    [umkmResult],
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h1 className="text-h6 font-semibold text-secondary-800">Discovery Map</h1>
        <p className="text-b8 text-neutral-600">
          Peta sebaran risiko gentrifikasi seluruh UMKM di kawasan.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {RISK_FILTERS.map((filter) => (
            <Badge
              key={filter.value}
              variant={filter.value === "2" ? "primary" : filter.value === "1" ? "default" : "secondary"}
              selected={riskFilter === filter.value}
              onSelectedChange={() => setRiskFilter(filter.value)}
              className="h-9 min-w-0 px-4 text-b9"
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {isGridError && (
        <p className="text-b8 text-destructive">
          Tidak dapat memuat peta zona -- pastikan backend berjalan di{" "}
          {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}.
        </p>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          {!isGridLoading && (
            <LeafletMap
              center={clickedLocation ? [clickedLocation.lat, clickedLocation.lng] : undefined}
              onClick={(lat, lng) => setClickedLocation({ lat, lng })}
            >
              <GeoJsonLayer data={grid} modelAccuracy={modelAccuracy} />
            </LeafletMap>
          )}
          <AiPanel role="operator" />

          {clickedLocation && (
            <div className="absolute bottom-4 left-4 z-[1000] w-72 rounded-xl border border-border bg-neutral-0 p-3 shadow-lg">
              {isZoneLoading && <Skeleton className="h-20 w-full" />}
              {!isZoneLoading && !zone && (
                <p className="text-b9 text-neutral-500">Lokasi ini di luar area studi.</p>
              )}
              {!isZoneLoading && zone && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={ZONE_BADGE_VARIANT[zone.zone_label]} selectable={false}>
                      {zone.zone_label.toUpperCase()}
                    </Badge>
                    <ConfidenceBadge modelAccuracy={zone.model_accuracy} />
                  </div>
                  <dl className="text-b9">
                    <div>
                      <dt className="inline font-semibold text-neutral-700">Blok: </dt>
                      <dd className="inline text-neutral-600">{zone.grid_id}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-neutral-700">Kawasan: </dt>
                      <dd className="inline text-neutral-600">{zone.district_name ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-neutral-700">Indeks Kerentanan: </dt>
                      <dd className="inline text-neutral-600">{zone.vulnerability_index.toFixed(3)}</dd>
                    </div>
                  </dl>
                  {zone.narrative && <p className="text-b9 text-neutral-600">{zone.narrative}</p>}
                  {zone.ews_code > 0 && (
                    <Button
                      size="sm"
                      render={
                        <Link href={`/tenant-matching/?lat=${clickedLocation.lat}&lng=${clickedLocation.lng}`} />
                      }
                    >
                      Lihat Realokasi
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari Kandidat"
            aria-label="Cari UMKM"
          />
          <div className="flex items-center justify-between">
            <h2 className="text-s6 font-semibold text-neutral-900">
              {riskFilter === "all" ? "Semua Titik" : RISK_FILTERS.find((f) => f.value === riskFilter)?.label}{" "}
              ({riskList.length})
            </h2>
          </div>

          <div className="flex max-h-[480px] flex-col gap-2 overflow-y-auto">
            {isUmkmLoading &&
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            {!isUmkmLoading && riskList.length === 0 && (
              <p className="text-b9 text-neutral-500">Tidak ada UMKM yang cocok.</p>
            )}
            {!isUmkmLoading &&
              riskList.map((umkm) => (
                <button
                  key={umkm.id}
                  type="button"
                  onClick={() => setClickedLocation({ lat: umkm.latitude, lng: umkm.longitude })}
                  className="flex flex-col gap-1 rounded-xl border border-border p-3 text-left transition-colors hover:bg-neutral-50"
                >
                  <span className="text-b9 font-semibold text-neutral-900">{umkm.name ?? "-"}</span>
                  <span className="text-b9 text-neutral-500">
                    {umkm.dist_to_station_m !== null
                      ? `${Math.round(umkm.dist_to_station_m)}m dari stasiun`
                      : (umkm.district_name ?? "-")}
                    {umkm.vulnerability_index !== null &&
                      ` · Kerentanan ${umkm.vulnerability_index.toFixed(2)}`}
                  </span>
                </button>
              ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={riskList.length === 0}
            onClick={() => downloadCsv(riskList)}
          >
            Export list (.csv)
          </Button>
        </aside>
      </div>
    </div>
  );
}
