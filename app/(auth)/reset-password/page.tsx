"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/app/(auth)/_components/auth-shell";
import { Button } from "@/app/components/ui/button";
import { FieldLabel, Input } from "@/app/components/ui/input";
import { createClient } from "@/app/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await createClient().auth.updateUser({
      password,
    });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/beranda/");
    router.refresh();
  }

  return (
    <AuthShell>
      <div className="mb-8 flex flex-col gap-3">
        <h1 className="font-sans text-[36px] font-bold leading-[40px] text-neutral-900">
          Buat Password Baru
        </h1>
        <p className="font-sans text-[20px] leading-[28px] text-neutral-700">
          Masukkan password baru Anda di bawah ini.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="password" required>
              Password Baru
            </FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div>
            <FieldLabel htmlFor="confirmPassword" required>
              Konfirmasi Password Baru
            </FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ulangi password baru"
            />
          </div>
        </div>

        {error && (
          <p className="font-sans text-b8 text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </form>
    </AuthShell>
  );
}
