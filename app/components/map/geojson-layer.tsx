import type { GeoJsonFeatureCollection } from "@/app/types/geojson";

export function GeoJsonLayer({ data }: { data?: GeoJsonFeatureCollection }) {
  return <div data-feature-count={data?.features.length ?? 0} />;
}
