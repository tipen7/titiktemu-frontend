import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-component/route-handler Supabase instance, reading/writing the
// same session cookie the browser client and middleware.ts use.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component -- a middleware refreshing the
            // session handles writing the cookie instead. Safe to ignore.
          }
        },
      },
    },
  );
}
