import { useQuery } from "@tanstack/react-query";
import { fetchZones } from "@/app/lib/api";

export function useGrid() {
  return useQuery({ queryKey: ["grid"], queryFn: fetchZones });
}
