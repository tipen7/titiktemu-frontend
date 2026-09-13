import { createBrowserClient } from "@supabase/ssr";

// Client-component Supabase instance -- session lives in cookies (via
// @supabase/ssr) so it's readable by middleware.ts and server components too.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
  );
}
