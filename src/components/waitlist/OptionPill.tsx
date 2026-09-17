import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function OptionPill({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] font-bold transition",
        selected
          ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]"
          : "border-[var(--color-brand-border)] bg-white text-[var(--color-brand-ink)] hover:border-[var(--color-brand-primary)]/40 hover:bg-[var(--color-brand-secondary)]/40"
      )}
    >
      {label}
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
          selected
            ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
            : "border-[var(--color-brand-border)] bg-white"
        )}
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  );
}
