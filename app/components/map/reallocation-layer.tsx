"use client";

import { CircleMarker, Polyline, Popup } from "react-leaflet";
import { ConfidenceBadge } from "@/app/components/ui/confidence-badge";
import type { ModelAccuracy, ReallocationCandidate } from "@/app/types/zones";

export function centroidOf(coordinates: number[][]): [number, number] {
  const [lngSum, latSum] = coordinates.reduce<[number, number]>(
    (sum, [lng, lat]) => [sum[0] + (lng ?? 0), sum[1] + (lat ?? 0)],
    [0, 0],
  );
  return [latSum / coordinates.length, lngSum / coordinates.length];
}

export function ReallocationLayer({
  origin,
  candidates,
  modelAccuracy,
}: {
  origin: { lat: number; lng: number };
  candidates: ReallocationCandidate[];
  modelAccuracy?: ModelAccuracy | null;
}) {
  return (
    <>
      <CircleMarker
        center={[origin.lat, origin.lng]}
        radius={10}
        pathOptions={{ color: "#00a6a8", fillColor: "#00a6a8", fillOpacity: 0.8 }}
      >
        <Popup>Current location</Popup>
      </CircleMarker>

      {candidates.map((candidate) => {
        const ring = candidate.recommended_feature.geometry.coordinates[0];
        if (!ring) return null;
        const centroid = centroidOf(ring);

        return (
          <div key={candidate.recommended_grid_id}>
            <CircleMarker
              center={centroid}
              radius={8}
              pathOptions={{ color: "#39b332", fillColor: "#39b332", fillOpacity: 0.8 }}
            >
              <Popup>
                <div className="flex flex-col gap-1">
                  <span>
                    #{candidate.rank} {candidate.recommended_grid_id} (
                    {candidate.recommended_district}) -- {candidate.distance_m.toFixed(0)}m,
                    score {candidate.matching_score.toFixed(1)}
                  </span>
                  <ConfidenceBadge modelAccuracy={modelAccuracy ?? null} />
                </div>
              </Popup>
            </CircleMarker>
            <Polyline
              positions={[[origin.lat, origin.lng], centroid]}
              pathOptions={{ color: "#00a6a8", dashArray: "4 6" }}
            />
          </div>
        );
      })}
    </>
  );
}
