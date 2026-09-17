import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function QuestionCard({
  step,
  done,
  title,
  subtitle,
  children,
  className,
}: {
  step: number;
  done?: boolean;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-[var(--color-brand-border)] bg-white p-6 shadow-sm sm:p-8",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors",
            done
              ? "bg-[var(--color-brand-primary)] text-white"
              : "bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]"
          )}
        >
          {step}
        </span>
        <div>
          <h2 className="text-[17px] font-extrabold text-[var(--color-brand-ink)] sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm font-medium leading-relaxed text-[var(--color-brand-muted)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
