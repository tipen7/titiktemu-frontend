import { useQuery } from "@tanstack/react-query";
import { fetchPolicyRecommendations } from "@/app/lib/api";

export function usePolicy(recommendationType?: string) {
  return useQuery({
    queryKey: ["policy", recommendationType],
    queryFn: () => fetchPolicyRecommendations(recommendationType),
  });
}
