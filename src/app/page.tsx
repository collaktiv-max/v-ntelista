"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { OptionPill } from "@/components/waitlist/OptionPill";
import { QuestionCard } from "@/components/waitlist/QuestionCard";
import { MissingAnswersModal } from "@/components/waitlist/MissingAnswersModal";
import { FollowSection } from "@/components/waitlist/FollowSection";
import { Footer } from "@/components/waitlist/Footer";
import { RABATT_OPTIONS, type RabattOption } from "@/lib/types";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function VantelistaPage() {
  const [busGuess, setBusGuess] = useState("");
  const [rabattAnswer, setRabattAnswer] = useState<RabattOption | null>(null);
  const [localBusinessAnswer, setLocalBusinessAnswer] = useState("");
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
    if (!rabattAnswer) {
      list.push("Ett svar på frågan om vilka rabatter du vill ha");
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
          rabattAnswer,
          localBusinessAnswer: localBusinessAnswer.trim() || null,
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
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-brand-accent)]/15 blur-3xl" />

      <header className="relative py-10 sm:py-14">
        <Container className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Logo
              showIcon={false}
              textClassName="text-4xl sm:text-5xl md:text-6xl"
            />
          </motion.div>
        </Container>
      </header>

      <main className="relative flex-1">
        <Container className="max-w-2xl pb-6 text-center sm:pb-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[16px] font-semibold leading-relaxed text-[var(--color-brand-muted)] sm:text-lg"
          >
            Res kollektivt, samla resepoäng och växla in dem mot rabatter hos
            lokala företag.
          </motion.p>
        </Container>

        <Container className="max-w-2xl pb-8 sm:pb-10">
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
                  subtitle="De två som gissar närmast får ett varsitt pris!"
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
                  done={!!rabattAnswer}
                  title="Hjälp oss bli bättre"
                  subtitle="Svara på frågan nedan för att gå vidare."
                >
                  <div role="radiogroup" aria-label="Vad för rabatter skulle du vilja ha för att åka mer buss?">
                    <p className="mb-3 text-[14.5px] font-bold text-[var(--color-brand-ink)]">
                      Vad för rabatter skulle du vilja ha för att åka mer buss?
                    </p>
                    <div className="flex flex-col gap-2">
                      {RABATT_OPTIONS.map((option, index) => (
                        <OptionPill
                          key={option}
                          index={index}
                          label={option}
                          selected={rabattAnswer === option}
                          onSelect={() =>
                            setRabattAnswer(rabattAnswer === option ? null : option)
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {rabattAnswer && (
                      <motion.div
                        key="local-business"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <Field
                          label="Vilken lokal butik, restaurang eller företag i din stad skulle du allra helst vilja ha erbjudanden hos i Collaktiv?"
                          hint="Frivilligt"
                          className="mt-4"
                        >
                          <Textarea
                            placeholder="T.ex. namnet på ett lokalt café eller en butik"
                            value={localBusinessAnswer}
                            onChange={(e) => setLocalBusinessAnswer(e.target.value)}
                          />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
    <div className="rounded-[1.75rem] border border-[var(--color-brand-primary)] bg-[#F2FAF7] p-8 text-center shadow-sm sm:p-10">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--color-brand-primary)]">
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
