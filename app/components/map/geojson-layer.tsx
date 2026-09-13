"use client";

import type { Layer, Path, PathOptions } from "leaflet";
import { GeoJSON } from "react-leaflet";
import { CONFIDENCE_COLOR, CONFIDENCE_LABEL } from "@/app/lib/confidence";
import type { ModelAccuracy, ZoneFeature, ZoneFeatureCollection } from "@/app/types/zones";

const EWS_TO_HEX: Record<number, string> = {
  0: "#39b332", // aman / green
  1: "#eab308", // waspada / yellow
  2: "#d90e10", // bahaya / red
};

// Uniform weight:1/fillOpacity:0.45 on every one of 3000+ cells painted
// the whole map as a solid colored checkerboard, drowning out the base map
// underneath and making it hard to spot streets/landmarks or one's own
// position -- real UX complaint, see DEPLOY.md. Fix: only cells that
// actually need attention (waspada/bahaya) get real visual weight; the
// large "aman" majority (1073/3105 cells last run) recedes to a faint tint
// with no border at all, so the grid reads as a light risk overlay instead
// of a hard-edged grid covering the whole map.
const EWS_FILL_OPACITY: Record<number, number> = { 0: 0.08, 1: 0.3, 2: 0.5 };
const EWS_BORDER_WEIGHT: Record<number, number> = { 0: 0, 1: 0.5, 2: 1 };

function styleForFeature(feature?: ZoneFeature): PathOptions {
  const ewsCode = feature?.properties.ews_code ?? undefined;
  const color = ewsCode !== undefined ? EWS_TO_HEX[ewsCode] : "#939d9f";
  return {
    color,
    weight: ewsCode !== undefined ? EWS_BORDER_WEIGHT[ewsCode] : 0,
    fillColor: color,
    fillOpacity: ewsCode !== undefined ? EWS_FILL_OPACITY[ewsCode] : 0.08,
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
        // A near-invisible "aman" cell (fillOpacity 0.08, no border, see
        // styleForFeature) still needs a legible hover state -- otherwise
        // it's unclickable-feeling even though it IS interactive.
        const path = layer as Path;
        layer.on("mouseover", () => path.setStyle({ weight: 1.5, fillOpacity: 0.5 }));
        layer.on("mouseout", () => path.setStyle(styleForFeature(zoneFeature)));
        if (onFeatureClick) {
          layer.on("click", () => onFeatureClick(zoneFeature));
        }
      }}
    />
  );
}
