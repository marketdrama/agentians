import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl border-[2.5px] border-ink font-semibold transition-all hard hard-hover focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:translate-x-0";

const variants = {
  primary: "bg-accent text-white",
  lime: "bg-lime text-ink",
  pink: "bg-pink text-ink",
  ghost: "bg-panel text-ink",
} as const;

const sizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "px-7 py-3.5 text-base",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
