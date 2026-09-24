import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Deterministic hash → hue, for seeded avatars/token glyphs. */
export function hueFromSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
}

/** Two-stop gradient string from a seed. */
export function gradientFromSeed(seed: string): string {
  const h = hueFromSeed(seed);
  const h2 = (h + 48) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${h2} 75% 42%))`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function fmtUsd(n: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  const digits = Math.abs(n) < 1 ? 4 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  }).format(n);
}

export function fmtPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(n >= 1000 ? 0 : 2)}%`;
}

export function fmtPrice(n: number): string {
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8)}`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/** Fake Solana-style tx hash for simulated trades. */
export function pseudoTx(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let out = "";
  for (let i = 0; i < 44; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function shortTx(tx: string): string {
  return `${tx.slice(0, 4)}…${tx.slice(-4)}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
