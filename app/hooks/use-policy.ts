import { useQuery } from "@tanstack/react-query";

export function usePolicy() {
  return useQuery({
    queryKey: ["policy"],
    queryFn: async () => [] as unknown[],
  });
}
