"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function OptionPill({
  label,
  selected,
  onSelect,
  index = 0,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  index?: number;
}) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] font-bold transition",
        selected
          ? "border-[var(--color-brand-primary)] bg-white text-[var(--color-brand-primary)]"
          : "border-[var(--color-brand-primary)]/25 bg-white/60 text-[var(--color-brand-ink)] hover:border-[var(--color-brand-primary)]/60 hover:bg-white"
      )}
    >
      {label}
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
          selected
            ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
            : "border-[var(--color-brand-primary)]/30 bg-white"
        )}
      >
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="flex items-center justify-center"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
