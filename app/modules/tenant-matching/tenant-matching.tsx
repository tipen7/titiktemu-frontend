"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ConfidenceBadge } from "@/app/components/ui/confidence-badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MapLegend } from "@/app/components/map/map-legend";
import { useReallocation } from "@/app/hooks/use-reallocation";
import { useZoneLookup } from "@/app/hooks/use-zone-lookup";
import { useUmkm } from "@/app/hooks/use-umkm";
import type { ReallocationCandidate } from "@/app/types/zones";

const LeafletMap = dynamic(
  () => import("@/app/components/map/leaflet-map").then((mod) => mod.LeafletMap),
  { ssr: false },
);
const ReallocationLayer = dynamic(
  () => import("@/app/components/map/reallocation-layer").then((mod) => mod.ReallocationLayer),
  { ssr: false },
);

type Decision = "diterima" | "ditolak";

export default function TenantMatching() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramLat = searchParams.get("lat");
  const paramLng = searchParams.get("lng");
  const hasParamLocation = paramLat !== null && paramLng !== null;

  // Real at-risk UMKM (bahaya), not MOCK_UMKM -- lets an operator pick a
  // real business that actually needs reallocation.
  const { data: atRiskResult, isLoading: isAtRiskLoading } = useUmkm({ ews_code: 2, limit: 20 });
  const atRiskList = atRiskResult?.rows ?? [];
  const [selectedUmkmId, setSelectedUmkmId] = useState<string | null>(null);
  const selectedUmkm = atRiskList.find((u) => u.id === selectedUmkmId) ?? null;

  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const location = useMemo(() => {
    if (hasParamLocation) return { lat: Number(paramLat), lng: Number(paramLng) };
    return selectedUmkm ? { lat: selectedUmkm.latitude, lng: selectedUmkm.longitude } : null;
  }, [hasParamLocation, paramLat, paramLng, selectedUmkm]);

  const { data: zone, isLoading: isZoneLoading } = useZoneLookup(location);
  const isEligibleForLookup = !!zone && zone.ews_code > 0;
  const { data: reallocation, isLoading: isReallocationLoading } = useReallocation(location, isEligibleForLookup);

  const selectedCandidate: ReallocationCandidate | null =
    reallocation?.candidates.find((c) => c.recommended_grid_id === selectedCandidateId) ??
    reallocation?.candidates[0] ??
    null;

  function selectUmkm(id: string) {
    setSelectedUmkmId(id);
    setSelectedCandidateId(null);
    // Clear any lat/lng deep-link so the real business selection takes over.
    if (hasParamLocation) router.replace(pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-h6 font-semibold">Smart Tenant Matching</h1>
        <p className="text-b8 text-neutral-600">
          Pilih UMKM di zona berisiko untuk melihat rekomendasi realokasi ke zona aman terdekat.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {!hasParamLocation && (
          <aside className="flex w-full shrink-0 flex-col gap-2 lg:w-64">
            <h2 className="text-s6 font-semibold text-neutral-900">
              UMKM Berisiko Tinggi ({atRiskResult?.total ?? 0})
            </h2>
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
              {isAtRiskLoading &&
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              {!isAtRiskLoading && atRiskList.length === 0 && (
                <p className="text-b9 text-neutral-500">Tidak ada UMKM di zona bahaya saat ini.</p>
              )}
              {!isAtRiskLoading &&
                atRiskList.map((umkm) => (
                  <button
                    key={umkm.id}
                    type="button"
                    onClick={() => selectUmkm(umkm.id)}
                    aria-pressed={selectedUmkmId === umkm.id}
                    className={`rounded-xl border p-3 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                      selectedUmkmId === umkm.id ? "border-primary-500 bg-primary-50" : "border-border"
                    }`}
                  >
                    <p className="text-b9 font-semibold text-neutral-900">{umkm.name ?? "-"}</p>
                    <p className="text-b9 text-neutral-500">
                      {umkm.category} &middot; {umkm.district_name}
                    </p>
                  </button>
                ))}
            </div>
          </aside>
        )}

        <div className="flex flex-1 flex-col gap-4">
          {isZoneLoading && <Skeleton className="h-10 w-full" />}

          {zone && (
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{zone.zone_label.toUpperCase()}</Badge>
              <ConfidenceBadge modelAccuracy={zone.model_accuracy} />
              <span className="text-b8 text-neutral-600">
                {selectedUmkm?.name ?? "Lokasi ini"} berada di {zone.grid_id} ({zone.district_name})
              </span>
            </div>
          )}

          {zone && zone.ews_code === 0 && (
            <p className="text-b8 text-neutral-600">UMKM ini berada di zona aman -- realokasi tidak diperlukan.</p>
          )}

          {isReallocationLoading && <Skeleton className="h-10 w-full" />}
          {reallocation && !reallocation.eligible && reallocation.message && (
            <p className="text-b8 text-neutral-600">{reallocation.message}</p>
          )}

          {location && (
            <div className="relative">
              <LeafletMap center={[location.lat, location.lng]} zoom={13}>
                <ReallocationLayer
                  origin={location}
                  candidates={reallocation?.candidates ?? []}
                  modelAccuracy={reallocation?.zone?.model_accuracy}
                />
              </LeafletMap>
              <MapLegend />
            </div>
          )}

          {reallocation && reallocation.eligible && (
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1">
                <h2 className="text-s6 font-semibold">Daftar Kandidat Zona</h2>
                <ol className="mt-2 flex flex-col gap-2">
                  {reallocation.candidates.map((candidate) => (
                    <li key={candidate.recommended_grid_id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCandidateId(candidate.recommended_grid_id)}
                        aria-pressed={selectedCandidate?.recommended_grid_id === candidate.recommended_grid_id}
                        className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-b8 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                          selectedCandidate?.recommended_grid_id === candidate.recommended_grid_id
                            ? "border-primary-500 bg-primary-50"
                            : "border-border"
                        }`}
                      >
                        <span>
                          #{candidate.rank} {candidate.recommended_grid_id} ({candidate.recommended_district})
                          {candidate.crossed_district && " -- beda kawasan"}
                        </span>
                        <span className="text-neutral-600">
                          {candidate.distance_m.toFixed(0)}m &middot; skor {candidate.matching_score.toFixed(1)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedCandidate && (
                <aside className="w-full shrink-0 rounded-xl border border-border p-4 lg:w-80">
                  <h2 className="text-s6 font-semibold">Detail Kandidat Terpilih</h2>
                  <dl className="mt-2 flex flex-col gap-1 text-b8">
                    <div>
                      <dt className="inline font-semibold">Grid: </dt>
                      <dd className="inline">{selectedCandidate.recommended_grid_id}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold">Kawasan: </dt>
                      <dd className="inline">{selectedCandidate.recommended_district ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold">Jarak: </dt>
                      <dd className="inline">{selectedCandidate.distance_m.toFixed(0)}m</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold">Matching score: </dt>
                      <dd className="inline">{selectedCandidate.matching_score.toFixed(1)}</dd>
                    </div>
                  </dl>

                  {decisions[selectedCandidate.recommended_grid_id] ? (
                    <p className="mt-3 text-b8 font-semibold text-neutral-700">
                      Keputusan (belum tersimpan ke sistem):{" "}
                      {decisions[selectedCandidate.recommended_grid_id] === "diterima" ? "Diterima" : "Ditolak"}
                    </p>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="red-ghost"
                        size="sm"
                        onClick={() =>
                          setDecisions((d) => ({ ...d, [selectedCandidate.recommended_grid_id]: "ditolak" }))
                        }
                      >
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setDecisions((d) => ({ ...d, [selectedCandidate.recommended_grid_id]: "diterima" }))
                        }
                      >
                        Terima
                      </Button>
                    </div>
                  )}
                  <p className="mt-2 text-b9 text-neutral-500">
                    Keputusan ini hanya tersimpan di sesi browser Anda -- belum ada alur persetujuan tersimpan
                    di backend.
                  </p>
                </aside>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
