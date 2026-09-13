import { useQuery } from "@tanstack/react-query";
import { fetchModelAccuracy } from "@/app/lib/api";

export function useModelAccuracy() {
  return useQuery({ queryKey: ["model-accuracy"], queryFn: fetchModelAccuracy });
}
