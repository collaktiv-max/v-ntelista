"use client";

import { motion } from "framer-motion";
import { Bus, Gift } from "lucide-react";
import { Container } from "@/components/ui/Container";

const items = [
  {
    icon: Bus,
    title: "Poäng för varje resa",
    text: "Registrera din biljett och samla resepoäng.",
  },
  {
    icon: Gift,
    title: "Rabatter lokalt",
    text: "Växla in poängen hos företag nära dig.",
  },
];

export function ValueGrid() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, text }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-2xl border border-[var(--color-brand-primary)] bg-[#F2FAF7] p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--color-brand-primary)]">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-[15.5px] font-extrabold text-[var(--color-brand-ink)]">
              {title}
            </h3>
            <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
              {text}
            </p>
          </motion.div>
        ))}
      </div>
    </Container>
  );
}
