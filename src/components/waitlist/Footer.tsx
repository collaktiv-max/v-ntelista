export function Footer() {
  return (
    <footer className="bg-[var(--color-brand-secondary)] pb-8">
      <p className="text-center text-xs font-medium text-[var(--color-brand-muted)]">
        © {new Date().getFullYear()} Collaktiv. Gävle, Sverige
      </p>
    </footer>
  );
}
