"use client";

import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function MissingAnswersModal({
  missing,
  onClose,
}: {
  missing: string[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-brand-ink)]/40 px-5 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-answers-title"
    >
      <div className="w-full max-w-sm rounded-[1.75rem] border border-[var(--color-brand-border)] bg-white p-7 text-center shadow-lg animate-slide-up">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
          <AlertCircle className="h-7 w-7" />
        </span>
        <h2
          id="missing-answers-title"
          className="mt-4 text-lg font-extrabold text-[var(--color-brand-ink)]"
        >
          Nästan klart!
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--color-brand-muted)]">
          Du måste svara på allt nedan för att vara med i tävlingen:
        </p>
        <ul className="mt-4 space-y-2 text-left">
          {missing.map((m) => (
            <li
              key={m}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-secondary)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--color-brand-ink)]"
            >
              <X className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand-primary)]" strokeWidth={3} />
              {m}
            </li>
          ))}
        </ul>
        <Button onClick={onClose} className="mt-6 w-full">
          Fyll i och försök igen
        </Button>
      </div>
    </div>
  );
}
