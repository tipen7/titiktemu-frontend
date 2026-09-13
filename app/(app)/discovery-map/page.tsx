import { Suspense } from "react";
import DiscoveryMap from "@/app/modules/discovery-map/discovery-map";

export default function DiscoveryMapPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <DiscoveryMap />
    </Suspense>
  );
}