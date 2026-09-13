// Test UMKM roster for the Tenant Matching / Discovery Map pages.
//
// Locations are REAL grid cell centroids from titiktemu-analytics' last
// batch run against the real UMKM survey (data/umkm_survey_v3.geojson) --
// verified via direct query against spatial_grids/gentrification_risk_scores
// before writing this file, not invented. Business names are illustrative
// placeholders (the real survey doesn't identify businesses by these
// specific names); everything else -- district, expected zone -- is real.
export type MockUmkm = {
  id: string;
  name: string;
  district: "Blok M" | "Dukuh Atas";
  lat: number;
  lng: number;
  expectedZoneLabel: "aman" | "waspada" | "bahaya";
};

export const MOCK_UMKM: MockUmkm[] = [
  {
    id: "umkm-1",
    name: "Warung Sejahtera",
    district: "Blok M",
    lat: -6.24397624167159,
    lng: 106.799125961985,
    expectedZoneLabel: "bahaya",
  },
  {
    id: "umkm-2",
    name: "Kedai Jaya",
    district: "Blok M",
    lat: -6.23040590226035,
    lng: 106.801338534287,
    expectedZoneLabel: "waspada",
  },
  {
    id: "umkm-3",
    name: "Toko Barokah",
    district: "Blok M",
    lat: -6.22137185591368,
    lng: 106.79904893291,
    expectedZoneLabel: "aman",
  },
  {
    id: "umkm-4",
    name: "Kios Makmur",
    district: "Dukuh Atas",
    lat: -6.2032498536976,
    lng: 106.810281027809,
    expectedZoneLabel: "bahaya",
  },
  {
    id: "umkm-5",
    name: "Gerai Mandiri",
    district: "Dukuh Atas",
    lat: -6.2055334054401,
    lng: 106.803512615062,
    expectedZoneLabel: "waspada",
  },
  {
    id: "umkm-6",
    name: "Warung Berkah",
    district: "Dukuh Atas",
    lat: -6.21459053623569,
    lng: 106.799025879732,
    expectedZoneLabel: "aman",
  },
];
