import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline gap-1 text-sm font-bold text-[var(--color-brand-ink)]">
        {label}
        {required && <span className="text-[var(--color-brand-primary)]">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs font-medium text-[var(--color-brand-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-[var(--color-brand-border)] bg-white px-4 py-3 text-[15px] font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)]/70 outline-none transition focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/15";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={cn(inputBase, className)} {...rest} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea className={cn(inputBase, "min-h-24 resize-y", className)} {...rest} />;
}
