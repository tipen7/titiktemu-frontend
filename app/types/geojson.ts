export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type GeoJsonGeometry = GeoJsonPoint | GeoJsonPolygon;

export type GeoJsonFeature<
  TProperties = Record<string, unknown>,
  TGeometry extends GeoJsonGeometry = GeoJsonGeometry,
> = {
  type: "Feature";
  geometry: TGeometry;
  properties: TProperties;
};

export type GeoJsonFeatureCollection<
  TProperties = Record<string, unknown>,
  TGeometry extends GeoJsonGeometry = GeoJsonGeometry,
> = {
  type: "FeatureCollection";
  features: GeoJsonFeature<TProperties, TGeometry>[];
};
