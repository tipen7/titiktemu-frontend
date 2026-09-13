"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/app/(auth)/_components/auth-shell";
import { Button } from "@/app/components/ui/button";
import { FieldLabel, Input } from "@/app/components/ui/input";
import { createClient } from "@/app/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: resetError } = await createClient().auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` },
    );

    setIsSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <AuthShell>
        <h1 className="mb-3 font-sans text-[36px] font-bold leading-[40px] text-neutral-900">
          Cek Email Anda
        </h1>
        <p className="font-sans text-[20px] leading-[28px] text-neutral-700">
          Jika {email} terdaftar, kami telah mengirim tautan reset password
          ke email tersebut.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block font-sans text-b7 font-semibold text-primary-600 hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8 flex flex-col gap-3">
        <h1 className="font-sans text-[36px] font-bold leading-[40px] text-neutral-900">
          Lupa Password
        </h1>
        <p className="font-sans text-[20px] leading-[28px] text-neutral-700">
          Masukkan email Anda untuk menerima tautan reset password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
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

        {error && (
          <p className="font-sans text-b8 text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Mengirim..." : "Kirim Tautan Reset Password"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 block text-center font-sans text-b7 font-semibold text-primary-600 hover:underline"
      >
        Kembali ke halaman masuk
      </Link>
    </AuthShell>
  );
}
