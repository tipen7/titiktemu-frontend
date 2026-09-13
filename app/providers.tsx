"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/app/lib/auth";
import { queryClient } from "@/app/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
