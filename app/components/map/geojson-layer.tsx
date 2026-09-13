"use client";

import type { Layer, PathOptions } from "leaflet";
import { GeoJSON } from "react-leaflet";
import { CONFIDENCE_COLOR, CONFIDENCE_LABEL } from "@/app/lib/confidence";
import type { ModelAccuracy, ZoneFeature, ZoneFeatureCollection } from "@/app/types/zones";

const EWS_TO_HEX: Record<number, string> = {
  0: "#39b332", // aman / green
  1: "#eab308", // waspada / yellow
  2: "#d90e10", // bahaya / red
};

function styleForFeature(feature?: ZoneFeature): PathOptions {
  const ewsCode = feature?.properties.ews_code ?? undefined;
  const color = ewsCode !== undefined ? EWS_TO_HEX[ewsCode] : "#939d9f";
  return {
    color,
    weight: 1,
    fillColor: color,
    fillOpacity: 0.45,
  };
}

function accuracyBadgeHtml(modelAccuracy?: ModelAccuracy | null): string {
  if (!modelAccuracy) return "";
  const color = CONFIDENCE_COLOR[modelAccuracy.confidence_level];
  const label = CONFIDENCE_LABEL[modelAccuracy.confidence_level];
  return `<br/><span style="display:inline-block;margin-top:4px;padding:1px 8px;border:1px solid ${color};border-radius:9999px;color:${color};font-size:12px;">${modelAccuracy.accuracy_pct.toFixed(1)}% -- ${label}</span>`;
}

export function GeoJsonLayer({
  data,
  modelAccuracy,
  onFeatureClick,
}: {
  data?: ZoneFeatureCollection;
  modelAccuracy?: ModelAccuracy | null;
  onFeatureClick?: (feature: ZoneFeature) => void;
}) {
  if (!data) return null;

  return (
    <GeoJSON
      key={data.features.length}
      data={data as unknown as GeoJSON.FeatureCollection}
      style={(feature) => styleForFeature(feature as unknown as ZoneFeature)}
      onEachFeature={(feature, layer: Layer) => {
        const zoneFeature = feature as unknown as ZoneFeature;
        const { grid_id, district_name, ews_code, matching_score } =
          zoneFeature.properties;
        layer.bindPopup(
          `<strong>${grid_id}</strong><br/>${district_name ?? "-"}<br/>EWS: ${ews_code}<br/>Matching score: ${matching_score?.toFixed(1) ?? "-"}${accuracyBadgeHtml(modelAccuracy)}`,
        );
        if (onFeatureClick) {
          layer.on("click", () => onFeatureClick(zoneFeature));
        }
      }}
    />
  );
}
