import { useQuery } from "@tanstack/react-query";

export function useUmkm() {
  return useQuery({ queryKey: ["umkm"], queryFn: async () => [] as unknown[] });
}
