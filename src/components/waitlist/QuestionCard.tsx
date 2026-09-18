"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: (step - 1) * 0.08 }}
      className={cn(
        "rounded-[1.75rem] border border-[var(--color-brand-primary)] bg-[#F2FAF7] p-6 shadow-sm sm:p-8",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors",
            done
              ? "bg-[var(--color-brand-primary)] text-white"
              : "border border-[var(--color-brand-primary)] bg-white text-[var(--color-brand-primary)]"
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
    </motion.div>
  );
}
