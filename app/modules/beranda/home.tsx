"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { AiPanel } from "@/app/components/modules/ai-panel";
import { useAuth } from "@/app/lib/auth";
import { useGrid } from "@/app/hooks/use-grid";
import { useModelAccuracy } from "@/app/hooks/use-model-accuracy";
import { useZoneLookup } from "@/app/hooks/use-zone-lookup";
import { useUmkm } from "@/app/hooks/use-umkm";
import { useDashboardSummary } from "@/app/hooks/use-dashboard-summary";
import { usePolicy } from "@/app/hooks/use-policy";
import type { ZoneLabel } from "@/app/types/zones";
import type { UmkmBusiness } from "@/app/types/umkm";

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

const RECOMMENDATION_LABEL: Record<string, string> = {
  realokasi: "Risiko Tinggi",
  mitigasi: "Risiko Sedang",
  pemantauan: "Risiko Rendah",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function matchingTier(score: number): string {
  if (score >= 75) return "Tingkat Kesesuaian Tinggi";
  if (score >= 50) return "Tingkat Kesesuaian Sedang";
  return "Tingkat Kesesuaian Rendah";
}

export default function Home() {
  const { user, role } = useAuth();
  const mode: "umkm" | "operator" = role === "operator_tod" ? "operator" : "umkm";

  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [safeOnly, setSafeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUmkmId, setSelectedUmkmId] = useState<string | null>(null);

  const { data: grid, isLoading: isGridLoading } = useGrid();
  const { data: modelAccuracy } = useModelAccuracy();
  const { data: zone, isLoading: isZoneLoading } = useZoneLookup(clickedLocation);

  const { data: umkmResult, isLoading: isUmkmLoading } = useUmkm({
    search: search || undefined,
    ews_code: safeOnly ? 0 : undefined,
    limit: 8,
  });
  const umkmList = [...(umkmResult?.rows ?? [])].sort((a, b) => {
    if (!affordableOnly) return 0;
    return (a.reference_price_per_txn_idr ?? Infinity) - (b.reference_price_per_txn_idr ?? Infinity);
  });
  const selectedUmkm = umkmList.find((item) => item.id === selectedUmkmId) ?? null;

  const { data: summary } = useDashboardSummary();
  const { data: recommendations } = usePolicy();

  const zonaRawanPct = summary ? Math.round((summary.danger_zone_count / summary.total_grid_cells) * 100) : null;
  const zonaAmanPct = summary ? Math.round((summary.safe_zone_count / summary.total_grid_cells) * 100) : null;
  const zonaWaspadaPct = summary ? Math.round((summary.moderate_zone_count / summary.total_grid_cells) * 100) : null;

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h6 font-semibold text-secondary-800">Beranda</h1>
          <p className="text-b8 text-neutral-600">
            {mode === "umkm"
              ? "Temukan zona risiko dan UMKM di sekitar Anda."
              : "Ringkasan kondisi kawasan dan rekomendasi alokasi terkini."}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-neutral-0 px-3 py-2">
          <span className="size-8 shrink-0 rounded-full bg-secondary-100" aria-hidden="true" />
          <div className="flex flex-col leading-tight">
            <span className="text-b9 font-semibold text-neutral-900">
              {user?.user_metadata?.full_name ?? user?.email ?? "Pengguna"}
            </span>
            <span className="text-b9 text-neutral-500">
              {mode === "operator" ? "Mode Operator" : "Mode UMKM"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1 overflow-hidden rounded-xl">
          {!isGridLoading && (
            <LeafletMap
              onClick={(lat, lng) => {
                setClickedLocation({ lat, lng });
                setSelectedUmkmId(null);
              }}
            >
              <GeoJsonLayer data={grid} modelAccuracy={modelAccuracy} />
            </LeafletMap>
          )}
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
              <Badge
                variant="secondary"
                selected={safeOnly}
                onSelectedChange={setSafeOnly}
                className="h-8 min-w-0 px-4 text-b9"
              >
                Zona Aman
              </Badge>
              <Badge
                variant="primary"
                selected={affordableOnly}
                onSelectedChange={setAffordableOnly}
                className="h-8 min-w-0 px-4 text-b9"
              >
                Harga Terjangkau
              </Badge>
            </div>

            {selectedUmkm ? (
              <UmkmDetailCard umkm={selectedUmkm} onClose={() => setSelectedUmkmId(null)} />
            ) : (
              clickedLocation && (
                <div className="rounded-xl border border-border p-3">
                  {isZoneLoading && <Skeleton className="h-16 w-full" />}
                  {!isZoneLoading && zone && (
                    <div className="flex flex-col gap-1">
                      <Badge variant={ZONE_BADGE_VARIANT[zone.zone_label]} selectable={false}>
                        {zone.zone_label.toUpperCase()}
                      </Badge>
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
              )
            )}

            <div className="flex flex-col gap-2">
              <span className="text-b9 font-semibold text-neutral-500">Hasil Pencarian</span>
              {isUmkmLoading &&
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              {!isUmkmLoading && umkmList.length === 0 && (
                <p className="text-b9 text-neutral-500">Tidak ada UMKM yang cocok.</p>
              )}
              {!isUmkmLoading &&
                umkmList.map((umkm) => (
                  <button
                    key={umkm.id}
                    type="button"
                    onClick={() => setSelectedUmkmId(umkm.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-neutral-50 ${
                      umkm.id === selectedUmkmId ? "border-primary-500 bg-primary-50" : "border-border"
                    }`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-b9 font-semibold text-secondary-700">
                      {(umkm.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-b9 font-semibold text-neutral-900">{umkm.name ?? "-"}</p>
                      <p className="truncate text-b9 text-neutral-500">
                        {umkm.dist_to_station_m !== null
                          ? `${Math.round(umkm.dist_to_station_m)}m dari stasiun`
                          : (umkm.district_name ?? "-")}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </aside>
        ) : (
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
            <h2 className="text-s6 font-semibold text-neutral-900">Panel Informasi</h2>

            {summary && (
              <div className="rounded-xl border border-border p-4">
                <p className="text-b9 text-neutral-500">Matching Score</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-h5 font-bold text-primary-700">
                    {Math.round(summary.avg_matching_score)}% Match
                  </span>
                  <Badge variant="secondary" selectable={false} className="h-6 min-w-0 px-3 text-b9">
                    {matchingTier(summary.avg_matching_score)}
                  </Badge>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${Math.min(100, Math.max(0, summary.avg_matching_score))}%` }}
                  />
                </div>
              </div>
            )}

            {summary && (
              <div className="rounded-xl border border-border p-4">
                <p className="mb-2 text-b9 text-neutral-500">Status Tiap Zona</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-s6 font-semibold text-primary-700">{zonaRawanPct}% Area</p>
                    <p className="text-b9 text-neutral-500">Zona Rawan</p>
                  </div>
                  <div>
                    <p className="text-s6 font-semibold text-secondary-700">{zonaAmanPct}% Area</p>
                    <p className="text-b9 text-neutral-500">Zona Aman</p>
                  </div>
                  <div>
                    <p className="text-s6 font-semibold text-neutral-900">{zonaWaspadaPct}% Area</p>
                    <p className="text-b9 text-neutral-500">Zona Waspada</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-b9 font-semibold text-neutral-500">Rekomendasi Alokasi</p>
              {!recommendations?.length && (
                <p className="text-b9 text-neutral-500">Belum ada rekomendasi tersedia.</p>
              )}
              {recommendations?.slice(0, 3).map((item) => (
                <div key={item.grid_id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-b9 font-semibold text-neutral-900">
                      {item.district_name ?? item.grid_id}
                    </p>
                    <Badge
                      variant={item.recommendation_type === "realokasi" ? "primary" : "secondary"}
                      selectable={false}
                      className="h-6 min-w-0 shrink-0 px-3 text-b9"
                    >
                      {RECOMMENDATION_LABEL[item.recommendation_type] ?? item.recommendation_type}
                    </Badge>
                  </div>
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

function UmkmDetailCard({ umkm, onClose }: { umkm: UmkmBusiness; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-s7 font-semibold text-neutral-900">{umkm.name ?? "-"}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail usaha"
          className="text-b9 text-neutral-500 hover:text-neutral-700"
        >
          &times;
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-b9">
        <dt className="text-neutral-500">Kategori</dt>
        <dd className="text-neutral-800">{umkm.category ?? "-"}</dd>
        <dt className="text-neutral-500">Blok</dt>
        <dd className="text-neutral-800">{umkm.grid_id}</dd>
        {umkm.reference_price_per_txn_idr !== null && (
          <>
            <dt className="text-neutral-500">Referensi Harga</dt>
            <dd className="text-neutral-800">
              {currencyFormatter.format(umkm.reference_price_per_txn_idr)}
            </dd>
          </>
        )}
        {umkm.vulnerability_index !== null && (
          <>
            <dt className="text-neutral-500">Indeks Kerentanan</dt>
            <dd className="text-neutral-800">{umkm.vulnerability_index.toFixed(3)}</dd>
          </>
        )}
      </dl>
      {umkm.zone_label && (
        <Badge variant={ZONE_BADGE_VARIANT[umkm.zone_label]} selectable={false} className="w-fit">
          {umkm.zone_label.toUpperCase()}
        </Badge>
      )}
      <Link
        href={`/discovery-map/?lat=${umkm.latitude}&lng=${umkm.longitude}`}
        className="mt-1 text-center text-b9 font-semibold text-primary-600 hover:underline"
      >
        Lihat di Discovery Map
      </Link>
    </div>
  );
}
