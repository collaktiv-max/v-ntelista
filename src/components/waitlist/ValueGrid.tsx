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
        {items.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)] p-6"
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
          </div>
        ))}
      </div>
    </Container>
  );
}
