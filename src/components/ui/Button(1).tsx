import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-3 rounded-sm text-[0.9rem] font-medium tracking-[0.01em] transition-[background-color,color,border-color,transform] duration-300 ease-lux disabled:cursor-not-allowed disabled:opacity-50 select-none";
const variants: Record<Variant, string> = {
  primary: "bg-gold text-obsidian hover:bg-champagne active:scale-[0.99]",
  secondary: "border border-soft/30 text-white hover:border-champagne hover:text-champagne",
  ghost: "text-soft hover:text-champagne px-0",
  dark: "bg-obsidian text-white hover:bg-midnight",
};
const sizes: Record<Size, string> = { md: "min-h-11 px-6", lg: "min-h-[3.25rem] px-8" };

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return [base, variants[variant], variant === "ghost" ? "min-h-11" : sizes[size], extra].join(" ");
}

interface Common { variant?: Variant; size?: Size; className?: string; children: ReactNode }

export function ButtonLink({ variant, size, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...rest}>{children}</Link>;
}

export function Button({ variant, size, className, children, ...rest }: Common & ComponentProps<"button">) {
  return <button className={buttonClass(variant, size, className)} {...rest}>{children}</button>;
}
