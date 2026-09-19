"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Fel e-post eller lösenord.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Kunde inte logga in just nu. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo showIcon={false} textClassName="text-3xl" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.75rem] border border-[var(--color-brand-primary)] bg-[#F2FAF7] p-7 sm:p-8"
        >
          <h1 className="text-center text-lg font-extrabold text-[var(--color-brand-ink)]">
            Logga in som admin
          </h1>

          <div className="mt-6 flex flex-col gap-4">
            <Field label="E-post">
              <Input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Lösenord">
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </div>

          {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-6 w-full">
            {submitting ? "Loggar in..." : "Logga in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
