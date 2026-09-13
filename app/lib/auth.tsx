"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/app/lib/supabase/client";

// Mirrors the backend's `user_role` enum (supabase/migrations/001_init.sql).
export type UserRole = "pemda_admin" | "operator_tod" | "umkm" | "public_user";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// A user's role is chosen at signup (supabase.auth.signUp's options.data.role)
// and copied into public.users by the handle_new_user trigger; Supabase also
// mirrors it back onto the session's own user_metadata, so it's readable
// here without a round trip to the backend's /auth/me.
function readRole(user: User | null): UserRole | null {
  const role = user?.user_metadata?.role;
  return role === "pemda_admin" ||
    role === "operator_tod" ||
    role === "umkm" ||
    role === "public_user"
    ? role
    : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      role: readRole(session?.user ?? null),
      isLoading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, isLoading, supabase],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
