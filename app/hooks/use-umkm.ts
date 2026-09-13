import { useQuery } from "@tanstack/react-query";
import { fetchUmkmDetail, fetchUmkmList } from "@/app/lib/api";
import type { UmkmListFilters } from "@/app/types/umkm";

export function useUmkm(filters: UmkmListFilters = {}) {
  return useQuery({
    queryKey: ["umkm", filters],
    queryFn: () => fetchUmkmList(filters),
  });
}

export function useUmkmDetail(id: string | null) {
  return useQuery({
    queryKey: ["umkm-detail", id],
    queryFn: () => fetchUmkmDetail(id as string),
    enabled: id !== null,
  });
}
