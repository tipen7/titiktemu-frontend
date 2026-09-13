"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { ConfidenceBadge } from "@/app/components/ui/confidence-badge";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useReallocation } from "@/app/hooks/use-reallocation";
import { useUmkm } from "@/app/hooks/use-umkm";
import { useZoneLookup } from "@/app/hooks/use-zone-lookup";
import type { ReallocationCandidate } from "@/app/types/zones";

// GeoJSON polygon coordinates are [lng, lat] rings -- a simple average of
// the exterior ring's vertices is precise enough to center a map link on,
// without pulling in a full geometry library for one centroid.
function polygonCentroid(candidate: ReallocationCandidate): { lat: number; lng: number } {
  const ring = candidate.recommended_feature.geometry.coordinates[0] ?? [];
  const sum = ring.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
    { lng: 0, lat: 0 },
  );
  return { lat: sum.lat / (ring.length || 1), lng: sum.lng / (ring.length || 1) };
}

export default function TenantMatching() {
  const searchParams = useSearchParams();
  const paramLat = searchParams.get("lat");
  const paramLng = searchParams.get("lng");
  const hasParamLocation = paramLat !== null && paramLng !== null;

  const [search, setSearch] = useState("");
  const [selectedUmkmId, setSelectedUmkmId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ReallocationCandidate | null>(null);

  // Only zone_label !== "aman" businesses are actually eligible for
  // reallocation (see reallocation.eligible below) -- filtering the picker
  // to those up front avoids letting someone pick a business that can never
  // produce candidates.
  const { data: umkmResult, isLoading: isUmkmListLoading } = useUmkm({
    search: search || undefined,
    limit: 20,
  });
  const eligibleUmkm = useMemo(
    () => (umkmResult?.rows ?? []).filter((u) => u.zone_label !== "aman"),
    [umkmResult],
  );
  const selectedUmkm = useMemo(
    () => eligibleUmkm.find((u) => u.id === selectedUmkmId) ?? null,
    [eligibleUmkm, selectedUmkmId],
  );

  const location = useMemo(() => {
    if (hasParamLocation) return { lat: Number(paramLat), lng: Number(paramLng) };
    return selectedUmkm ? { lat: selectedUmkm.latitude, lng: selectedUmkm.longitude } : null;
  }, [hasParamLocation, paramLat, paramLng, selectedUmkm]);

  const { data: zone, isLoading: isZoneLoading } = useZoneLookup(location);
  const isEligibleForLookup = !!zone && zone.ews_code > 0;
  const { data: reallocation, isLoading: isReallocationLoading } = useReallocation(
    location,
    isEligibleForLookup,
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h1 className="text-h6 font-semibold text-secondary-800">Smart Tenant Matching</h1>
        <p className="text-b8 text-neutral-600">
          Kandidat lokasi realokasi yang direkomendasikan AI untuk UMKM di zona berisiko.
        </p>
      </header>

      {!hasParamLocation && (
        <div className="flex flex-col gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari UMKM di zona berisiko"
            aria-label="Cari UMKM"
          />
          <div className="flex flex-wrap gap-2">
            {isUmkmListLoading && <Skeleton className="h-8 w-48" />}
            {!isUmkmListLoading && eligibleUmkm.length === 0 && (
              <p className="text-b9 text-neutral-500">Tidak ada UMKM berisiko yang cocok.</p>
            )}
            {eligibleUmkm.slice(0, 10).map((umkm) => (
              <button
                key={umkm.id}
                type="button"
                onClick={() => setSelectedUmkmId(umkm.id)}
                className={`h-9 rounded-full border px-3 text-b9 font-medium transition-colors ${
                  umkm.id === selectedUmkmId
                    ? "border-primary-500 bg-primary-500 text-neutral-0"
                    : "border-border text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {umkm.name ?? umkm.grid_id} &middot; {umkm.zone_label?.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {isZoneLoading && <p className="text-b8 text-neutral-500">Memuat zona...</p>}

      {zone && (
        <div className="flex flex-wrap items-center gap-3">
          <Badge selectable={false}>{zone.zone_label.toUpperCase()}</Badge>
          <ConfidenceBadge modelAccuracy={zone.model_accuracy} />
          <span className="text-b8 text-neutral-600">
            Berada di {zone.grid_id} ({zone.district_name ?? "-"})
          </span>
        </div>
      )}

      {zone && zone.ews_code === 0 && (
        <p className="text-b8 text-neutral-600">
          UMKM ini berada di zona aman -- tidak memerlukan realokasi.
        </p>
      )}

      {isReallocationLoading && <p className="text-b8 text-neutral-500">Mencari rekomendasi...</p>}

      {reallocation && !reallocation.eligible && reallocation.message && (
        <p className="text-b8 text-neutral-600">{reallocation.message}</p>
      )}

      {reallocation && reallocation.eligible && (
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex w-full flex-col gap-2 lg:w-96">
            <div className="flex items-center justify-between">
              <h2 className="text-s6 font-semibold text-neutral-900">Daftar Kandidat</h2>
              <ConfidenceBadge modelAccuracy={reallocation.zone?.model_accuracy ?? null} />
            </div>
            <ul className="flex flex-col gap-2">
              {reallocation.candidates.map((candidate) => (
                <li key={candidate.recommended_grid_id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                      selectedCandidate?.recommended_grid_id === candidate.recommended_grid_id
                        ? "border-primary-500 bg-primary-50"
                        : "border-border hover:bg-neutral-50"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-b9 font-semibold text-neutral-900">
                        {candidate.recommended_district ?? candidate.recommended_grid_id}
                      </span>
                      <span className="block text-b9 text-neutral-500">
                        Blok {candidate.recommended_grid_id}
                        {candidate.crossed_district && " · lintas kawasan"}
                      </span>
                    </span>
                    <span className="shrink-0 text-b8 font-semibold text-primary-600">
                      {candidate.matching_score.toFixed(0)}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 rounded-xl border border-border p-4">
            <h2 className="mb-3 text-s6 font-semibold text-neutral-900">Detail Kandidat</h2>
            {!selectedCandidate ? (
              <p className="text-b9 text-neutral-500">Pilih kandidat di daftar untuk melihat detail.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-s7 font-semibold text-neutral-900">
                    {selectedCandidate.recommended_district ?? selectedCandidate.recommended_grid_id}
                  </p>
                  <p className="text-b9 text-neutral-500">Blok {selectedCandidate.recommended_grid_id}</p>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-b9">
                  <dt className="text-neutral-500">Peringkat</dt>
                  <dd className="text-neutral-800">#{selectedCandidate.rank}</dd>
                  <dt className="text-neutral-500">Matching Score</dt>
                  <dd className="text-neutral-800">{selectedCandidate.matching_score.toFixed(1)}%</dd>
                  <dt className="text-neutral-500">Jarak dari Lokasi Asal</dt>
                  <dd className="text-neutral-800">{selectedCandidate.distance_m.toFixed(0)} m</dd>
                  <dt className="text-neutral-500">Lintas Kawasan</dt>
                  <dd className="text-neutral-800">{selectedCandidate.crossed_district ? "Ya" : "Tidak"}</dd>
                </dl>
                <Link
                  href={(() => {
                    const centroid = polygonCentroid(selectedCandidate);
                    return `/discovery-map/?lat=${centroid.lat}&lng=${centroid.lng}`;
                  })()}
                  className="mt-1 w-fit text-b9 font-semibold text-primary-600 hover:underline"
                >
                  Lihat di Discovery Map
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
