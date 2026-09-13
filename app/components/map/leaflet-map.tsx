"use client";

import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, useMapEvent } from "react-leaflet";

const STUDY_AREA_CENTER: LatLngExpression = [-6.216, 106.811];

export function LeafletMap({
  center = STUDY_AREA_CENTER,
  zoom = 14,
  className,
  children,
  onClick,
}: {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className ?? "h-[600px] w-full rounded-xl"}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onClick && <MapClickHandler onClick={onClick} />}
      {children}
    </MapContainer>
  );
}

function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvent("click", (event) => {
    onClick(event.latlng.lat, event.latlng.lng);
  });
  return null;
}
