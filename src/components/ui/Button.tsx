import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] shadow-sm shadow-[var(--color-brand-primary)]/20",
  secondary:
    "bg-[var(--color-brand-mint)] text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-mint)]/70",
  outline:
    "bg-white text-[var(--color-brand-ink)] border border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)]",
  ghost:
    "bg-transparent text-[var(--color-brand-ink)] hover:bg-[var(--color-brand-secondary)]",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-[15px] px-5 py-3",
  lg: "text-base px-7 py-4",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    children,
    variant = "primary",
    size = "md",
    className,
    icon,
    iconPosition = "right",
    ...rest
  } = props;

  const classes = cn(base, variants[variant], sizes[size], className);

  const content = (
    <>
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </>
  );

  if ("href" in props && props.href) {
    const { href, target, rel } = props as ButtonAsLink;
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
