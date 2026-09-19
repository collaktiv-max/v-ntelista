"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [configured, setConfigured] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/status")
      .then((res) => res.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(true)) // anta inloggning vid osäkerhet
      .finally(() => setCheckingStatus(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
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

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Lösenordet måste vara minst 8 tecken.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Kunde inte skapa kontot.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Kunde inte skapa kontot just nu. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingStatus) {
    return <div className="flex min-h-screen items-center justify-center bg-white" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo showIcon={false} textClassName="text-3xl" />
        </div>

        <form
          onSubmit={configured ? handleLogin : handleSetup}
          className="rounded-[1.75rem] border border-[var(--color-brand-primary)] bg-[#F2FAF7] p-7 sm:p-8"
        >
          <h1 className="text-center text-lg font-extrabold text-[var(--color-brand-ink)]">
            {configured ? "Logga in som admin" : "Skapa admin-konto"}
          </h1>
          {!configured && (
            <p className="mt-2 text-center text-xs font-medium text-[var(--color-brand-muted)]">
              Inget konto finns ännu. Välj en e-post och ett lösenord – det
              blir uppgifterna ni loggar in med hädanefter.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <Field label="E-post">
              <Input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Lösenord" hint={!configured ? "Minst 8 tecken" : undefined}>
              <Input
                type="password"
                autoComplete={configured ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {!configured && (
              <Field label="Bekräfta lösenord">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
            )}
          </div>

          {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-6 w-full">
            {submitting
              ? configured
                ? "Loggar in..."
                : "Skapar konto..."
              : configured
                ? "Logga in"
                : "Skapa konto och logga in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
