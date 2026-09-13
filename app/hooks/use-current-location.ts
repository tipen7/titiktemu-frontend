"use client";

import { useEffect, useState } from "react";

type CurrentLocationState = {
  location: { lat: number; lng: number } | null;
  status: "idle" | "found" | "denied" | "unsupported" | "error";
};

function getInitialState(): CurrentLocationState {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { location: null, status: "unsupported" };
  }
  return { location: null, status: "idle" };
}

/**
 * Real, honest "where am I" signal from the browser's own Geolocation API --
 * NOT derived from any backend/auth user record (there is no auth yet, see
 * DEPLOY.md: tracking a signed-in user's stored location is explicitly out
 * of scope here, that's the partner's auth work). No fallback/fabricated
 * coordinate: permission denied or an unsupported browser both surface as
 * an honest "no location" state rather than defaulting to a guessed point.
 */
export function useCurrentLocation(): CurrentLocationState {
  const [state, setState] = useState<CurrentLocationState>(getInitialState);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    // setState below only ever runs inside the Geolocation API's own async
    // success/error callbacks (a real external-system subscription), never
    // synchronously in the effect body itself.
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          status: "found",
        });
      },
      (error) => {
        setState({ location: null, status: error.code === error.PERMISSION_DENIED ? "denied" : "error" });
      },
      { enableHighAccuracy: true, maximumAge: 30_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
