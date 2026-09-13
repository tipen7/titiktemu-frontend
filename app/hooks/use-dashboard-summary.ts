import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "@/app/lib/api";

export function useDashboardSummary() {
  return useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary });
}
