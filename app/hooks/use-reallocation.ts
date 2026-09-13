import { useQuery } from "@tanstack/react-query";
import { fetchReallocation } from "@/app/lib/api";

export function useReallocation(
  location: { lat: number; lng: number } | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["reallocation", location?.lat, location?.lng],
    queryFn: () => fetchReallocation(location?.lat as number, location?.lng as number),
    enabled: enabled && location !== null,
  });
}
