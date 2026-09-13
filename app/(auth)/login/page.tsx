"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/app/(auth)/_components/auth-shell";
import { Button } from "@/app/components/ui/button";
import { FieldLabel, Input } from "@/app/components/ui/input";
import { createClient } from "@/app/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await createClient().auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);
    if (signInError) {
      setError("Email atau password salah. Silakan coba lagi.");
      return;
    }

    router.push(searchParams.get("redirectTo") || "/beranda/");
    router.refresh();
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-3">
        <h1 className="font-sans text-[36px] font-bold leading-[40px] text-neutral-900">
          Selamat Datang!
        </h1>
        <p className="font-sans text-[20px] leading-[28px] text-neutral-700">
          Ruang Tepat untuk Usaha Tumbuh, Kawasan Tepat untuk Masa Depan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="email" required>
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <FieldLabel htmlFor="password" required>
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
            />
          </div>
          <Link
            href="/forgot-password"
            className="self-end font-sans text-b7 text-neutral-800 hover:text-primary-600"
          >
            Lupa Password?
          </Link>
        </div>

        {error && (
          <p className="font-sans text-b8 text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center font-sans text-b7 text-neutral-800">
        Belum Punya Akun?{" "}
        <Link href="/signup" className="font-semibold text-primary-600 hover:underline">
          Daftar
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
