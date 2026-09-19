"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, LogOut, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import type { WaitlistEntry } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [facit, setFacit] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/entries")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) setEntries(data.entries as WaitlistEntry[]);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Kunde inte hämta anmälningar. Ladda om sidan.");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const facitNumber = facit.trim() === "" ? null : Number(facit);
  const hasFacit = facitNumber !== null && Number.isFinite(facitNumber);

  const rows = useMemo(() => {
    if (!entries) return [];
    const filtered = search.trim()
      ? entries.filter((e) => e.email.toLowerCase().includes(search.trim().toLowerCase()))
      : entries;
    if (!hasFacit) return filtered;
    return [...filtered].sort(
      (a, b) => Math.abs(a.busGuess - facitNumber!) - Math.abs(b.busGuess - facitNumber!)
    );
  }, [entries, search, hasFacit, facitNumber]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function exportCsv() {
    if (!entries) return;
    const header = ["E-post", "Gissning", "Rabatt", "Lokalt företag", "Skickat"];
    const lines = entries.map((e) => [
      e.email,
      String(e.busGuess),
      e.rabattAnswer,
      e.localBusinessAnswer ?? "",
      new Date(e.createdAt).toLocaleString("sv-SE"),
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vantelista.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[var(--color-brand-border)] py-5">
        <Container className="flex items-center justify-between gap-3">
          <Logo showIcon={false} textClassName="text-xl sm:text-2xl" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut className="h-4 w-4" />}
            iconPosition="left"
          >
            Logga ut
          </Button>
        </Container>
      </header>

      <Container className="max-w-4xl py-8 sm:py-10">
        <h1 className="text-xl font-extrabold text-[var(--color-brand-ink)] sm:text-2xl">
          Anmälningar{entries ? ` (${entries.length})` : ""}
        </h1>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Facit – rätt antal bussbiljetter"
            hint="Fyll i när ni vet svaret så sorteras listan efter vem som gissat närmast."
          >
            <Input
              type="number"
              inputMode="numeric"
              placeholder="T.ex. 4200"
              value={facit}
              onChange={(e) => setFacit(e.target.value)}
            />
          </Field>
          <Field label="Sök på e-post">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-muted)]" />
              <Input
                className="pl-9"
                placeholder="Sök..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </Field>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={!entries || entries.length === 0}
            icon={<Download className="h-4 w-4" />}
            iconPosition="left"
          >
            Exportera CSV
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {loadError && (
            <p className="text-sm font-bold text-red-600">{loadError}</p>
          )}

          {!entries && !loadError && (
            <p className="text-sm font-medium text-[var(--color-brand-muted)]">
              Hämtar anmälningar...
            </p>
          )}

          {entries && rows.length === 0 && (
            <p className="text-sm font-medium text-[var(--color-brand-muted)]">
              Inga anmälningar hittades.
            </p>
          )}

          {rows.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.02 }}
              className="rounded-2xl border border-[var(--color-brand-primary)] bg-[#F2FAF7] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {hasFacit && index === 0 && <span title="Närmast gissning">🥇</span>}
                  {hasFacit && index === 1 && <span title="Näst närmast gissning">🥈</span>}
                  <span className="font-extrabold text-[var(--color-brand-ink)]">
                    {entry.email}
                  </span>
                </div>
                <span className="text-xs font-bold text-[var(--color-brand-muted)]">
                  {new Date(entry.createdAt).toLocaleString("sv-SE")}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                    Gissning
                  </dt>
                  <dd className="font-bold text-[var(--color-brand-ink)]">
                    {entry.busGuess}
                    {hasFacit && (
                      <span className="ml-1 font-medium text-[var(--color-brand-muted)]">
                        (±{Math.abs(entry.busGuess - facitNumber!)})
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                    Rabatt
                  </dt>
                  <dd className="font-bold text-[var(--color-brand-ink)]">{entry.rabattAnswer}</dd>
                </div>
              </dl>

              {entry.localBusinessAnswer && (
                <p className="mt-3 text-sm font-medium italic text-[var(--color-brand-muted)]">
                  &ldquo;{entry.localBusinessAnswer}&rdquo;
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </div>
  );
}
