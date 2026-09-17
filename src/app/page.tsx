"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { OptionPill } from "@/components/waitlist/OptionPill";
import { QuestionCard } from "@/components/waitlist/QuestionCard";
import { MissingAnswersModal } from "@/components/waitlist/MissingAnswersModal";
import { ValueGrid } from "@/components/waitlist/ValueGrid";
import { FollowSection } from "@/components/waitlist/FollowSection";
import { Footer } from "@/components/waitlist/Footer";
import {
  MER_BUSS_OPTIONS,
  RABATT_OPTIONS,
  type MerBussOption,
  type RabattOption,
} from "@/lib/types";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function VantelistaPage() {
  const [busGuess, setBusGuess] = useState("");
  const [merBussAnswer, setMerBussAnswer] = useState<MerBussOption | null>(null);
  const [rabattAnswer, setRabattAnswer] = useState<RabattOption | null>(null);
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [missing, setMissing] = useState<string[] | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function getMissing(): string[] {
    const list: string[] = [];
    const guess = Number(busGuess);
    if (!busGuess.trim() || !Number.isFinite(guess) || guess < 0) {
      list.push("Din gissning på antalet bussbiljetter");
    }
    if (!merBussAnswer && !rabattAnswer) {
      list.push("Ett svar på minst en av de två frågorna");
    }
    if (!EMAIL_RE.test(email.trim())) {
      list.push("En giltig e-postadress");
    }
    return list;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missingItems = getMissing();
    if (missingItems.length > 0) {
      setMissing(missingItems);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/vantelista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busGuess: Number(busGuess),
          merBussAnswer,
          rabattAnswer,
          email,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setServerError(data?.error ?? "Något gick fel. Försök igen.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError(
        "Kunde inte skicka in just nu. Kontrollera din internetanslutning och försök igen."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="py-8 sm:py-10">
        <Container className="flex justify-center">
          <Logo textClassName="text-2xl sm:text-3xl" className="gap-3" />
        </Container>
      </header>

      <main className="flex-1">
        <Container className="max-w-2xl pb-6 text-center sm:pb-10">
          <p className="text-[16px] font-semibold leading-relaxed text-[var(--color-brand-muted)] sm:text-lg">
            Res kollektivt, samla resepoäng och växla in dem mot rabatter hos
            lokala företag.
          </p>
        </Container>

        <Container className="max-w-2xl pb-14 sm:pb-20">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <SuccessCard email={email} />
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <QuestionCard
                  step={1}
                  done={busGuess.trim().length > 0}
                  title="Gissa antalet bussbiljetter"
                  subtitle="Hur många bussbiljetter tror du säljs i Gävleborg under en dag? Den som gissar närmast rätt vinner ett pris."
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Ange ditt svar"
                    value={busGuess}
                    onChange={(e) => setBusGuess(e.target.value)}
                  />
                </QuestionCard>

                <QuestionCard
                  step={2}
                  done={!!merBussAnswer || !!rabattAnswer}
                  title="Hjälp oss bli bättre"
                  subtitle="Svara på minst en av frågorna nedan för att gå vidare."
                >
                  <div className="flex flex-col gap-6">
                    <div role="radiogroup" aria-label="Vad hade fått dig att åka mer buss?">
                      <p className="mb-3 text-[14.5px] font-bold text-[var(--color-brand-ink)]">
                        Vad hade fått dig att åka mer buss?
                      </p>
                      <div className="flex flex-col gap-2">
                        {MER_BUSS_OPTIONS.map((option) => (
                          <OptionPill
                            key={option}
                            label={option}
                            selected={merBussAnswer === option}
                            onSelect={() =>
                              setMerBussAnswer(merBussAnswer === option ? null : option)
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <div role="radiogroup" aria-label="Vad för rabatter skulle du vilja att Collaktiv erbjuder?">
                      <p className="mb-3 text-[14.5px] font-bold text-[var(--color-brand-ink)]">
                        Vad för rabatter skulle du vilja att Collaktiv erbjuder?
                      </p>
                      <div className="flex flex-col gap-2">
                        {RABATT_OPTIONS.map((option) => (
                          <OptionPill
                            key={option}
                            label={option}
                            selected={rabattAnswer === option}
                            onSelect={() =>
                              setRabattAnswer(rabattAnswer === option ? null : option)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </QuestionCard>

                <QuestionCard
                  step={3}
                  done={EMAIL_RE.test(email.trim())}
                  title="Skriv in din mailadress för att vara med i tävlingen."
                >
                  <Field
                    label="Din e-postadress"
                    hint="Genom att skriva upp dig godkänner du att Collaktiv hanterar dina svar och skickar e-post till dig om nyheter gällande en eventuell lansering."
                  >
                    <Input
                      type="email"
                      placeholder="din@email.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  {serverError && (
                    <p className="mt-3 text-sm font-bold text-red-600">{serverError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="mt-5 w-full"
                    icon={
                      submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )
                    }
                  >
                    {submitting ? "Skickar in..." : "Registrera dig"}
                  </Button>
                </QuestionCard>
              </motion.form>
            )}
          </AnimatePresence>
        </Container>

        <ValueGrid />
      </main>

      <FollowSection />
      <Footer />

      {missing && (
        <MissingAnswersModal missing={missing} onClose={() => setMissing(null)} />
      )}
    </div>
  );
}

function SuccessCard({ email }: { email: string }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--color-brand-border)] bg-white p-8 text-center shadow-sm sm:p-10">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
        <CheckCircle2 className="h-9 w-9" />
      </span>
      <h2 className="mt-5 text-2xl font-extrabold text-[var(--color-brand-ink)]">
        Tack – du är med i tävlingen!
      </h2>
      <p className="mt-3 text-[15px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
        Vi har sparat dina svar. Du får ett mejl till {email || "din adress"}{" "}
        om du vinner, och håller du utkik i inkorgen så hör vi av oss så fort
        Collaktiv lanseras.
      </p>
    </div>
  );
}
