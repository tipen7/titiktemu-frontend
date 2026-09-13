"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { ConfidenceBadge } from "@/app/components/ui/confidence-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useReallocation } from "@/app/hooks/use-reallocation";
import { useZoneLookup } from "@/app/hooks/use-zone-lookup";
import { MOCK_UMKM } from "@/app/lib/mock-umkm";

const LeafletMap = dynamic(
  () => import("@/app/components/map/leaflet-map").then((mod) => mod.LeafletMap),
  { ssr: false },
);
const ReallocationLayer = dynamic(
  () =>
    import("@/app/components/map/reallocation-layer").then(
      (mod) => mod.ReallocationLayer,
    ),
  { ssr: false },
);

export default function TenantMatching() {
  const searchParams = useSearchParams();
  const paramLat = searchParams.get("lat");
  const paramLng = searchParams.get("lng");
  const hasParamLocation = paramLat !== null && paramLng !== null;

  const [selectedUmkmId, setSelectedUmkmId] = useState<string>(MOCK_UMKM[0]?.id ?? "");
  const selectedUmkm = MOCK_UMKM.find((umkm) => umkm.id === selectedUmkmId) ?? null;

  const location = useMemo(() => {
    if (hasParamLocation) {
      return { lat: Number(paramLat), lng: Number(paramLng) };
    }
    return selectedUmkm ? { lat: selectedUmkm.lat, lng: selectedUmkm.lng } : null;
  }, [hasParamLocation, paramLat, paramLng, selectedUmkm]);

  const { data: zone, isLoading: isZoneLoading } = useZoneLookup(location);
  const isEligibleForLookup = !!zone && zone.ews_code > 0;
  const {
    data: reallocation,
    isLoading: isReallocationLoading,
  } = useReallocation(location, isEligibleForLookup);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-h6 font-semibold">Smart Tenant Matching Engine</h1>
        <p className="text-b8 text-neutral-600">
          Pick a UMKM in a medium/high-risk zone to see where it&apos;s recommended to
          relocate.
        </p>
      </div>

      {!hasParamLocation && (
        <Select
          value={selectedUmkmId}
          onValueChange={(value) => setSelectedUmkmId(value as string)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a UMKM" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_UMKM.map((umkm) => (
              <SelectItem key={umkm.id} value={umkm.id}>
                {umkm.name} ({umkm.district})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {isZoneLoading && <p className="text-b8 text-neutral-500">Loading zone...</p>}

      {zone && (
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{zone.zone_label.toUpperCase()}</Badge>
          <ConfidenceBadge modelAccuracy={zone.model_accuracy} />
          <span className="text-b8 text-neutral-600">
            Currently in {zone.grid_id} ({zone.district_name})
          </span>
        </div>
      )}

      {zone && zone.ews_code === 0 && (
        <p className="text-b8 text-neutral-600">
          This UMKM is in an aman (safe) zone -- no reallocation needed.
        </p>
      )}

      {isReallocationLoading && <p className="text-b8 text-neutral-500">Finding recommendations...</p>}

      {reallocation && !reallocation.eligible && reallocation.message && (
        <p className="text-b8 text-neutral-600">{reallocation.message}</p>
      )}

      {location && (
        <LeafletMap center={[location.lat, location.lng]} zoom={13}>
          <ReallocationLayer
            origin={location}
            candidates={reallocation?.candidates ?? []}
            modelAccuracy={reallocation?.zone?.model_accuracy}
          />
        </LeafletMap>
      )}

      {reallocation && reallocation.eligible && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-s6 font-semibold">Recommended zones</h2>
            <ConfidenceBadge modelAccuracy={reallocation.zone?.model_accuracy ?? null} />
          </div>
          <ol className="flex flex-col gap-2">
            {reallocation.candidates.map((candidate) => (
              <li
                key={candidate.recommended_grid_id}
                className="text-b8 flex items-center justify-between rounded-lg border border-border p-3"
              >
                <span>
                  #{candidate.rank} {candidate.recommended_grid_id} (
                  {candidate.recommended_district})
                  {candidate.crossed_district && " -- different district"}
                </span>
                <span className="text-neutral-600">
                  {candidate.distance_m.toFixed(0)}m, score{" "}
                  {candidate.matching_score.toFixed(1)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
