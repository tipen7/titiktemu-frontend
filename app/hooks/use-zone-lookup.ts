import { useQuery } from "@tanstack/react-query";
import { fetchZoneLookup } from "@/app/lib/api";

export function useZoneLookup(location: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: ["zone-lookup", location?.lat, location?.lng],
    queryFn: () => fetchZoneLookup(location?.lat as number, location?.lng as number),
    enabled: location !== null,
  });
}
