import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Redirects an already-logged-in visitor away (to Beranda) -- there's no
// reason to show a signed-in user the login form.
const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];

// Reachable without a normal session. /reset-password is special: clicking
// the email link gives Supabase a recovery-scoped session, so `user` is
// already truthy there -- it must NOT be redirected away like the other
// guest-only pages above, but it also isn't gated behind a full login.
const ALWAYS_ACCESSIBLE_PATHS = ["/reset-password"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isGuestOnlyPath = GUEST_ONLY_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  const isAlwaysAccessiblePath = ALWAYS_ACCESSIBLE_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && !isGuestOnlyPath && !isAlwaysAccessiblePath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isGuestOnlyPath) {
    return NextResponse.redirect(new URL("/beranda/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
