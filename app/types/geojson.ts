export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type GeoJsonFeature<TProperties = Record<string, unknown>> = {
  type: "Feature";
  geometry: GeoJsonPoint;
  properties: TProperties;
};

export type GeoJsonFeatureCollection<TProperties = Record<string, unknown>> = {
  type: "FeatureCollection";
  features: GeoJsonFeature<TProperties>[];
};
