import { useQuery } from "@tanstack/react-query";

export function useGrid() {
  return useQuery({ queryKey: ["grid"], queryFn: async () => [] as unknown[] });
}
