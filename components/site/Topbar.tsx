"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Board", exact: true },
  { href: "/fnfs", label: "FNFs" },
  { href: "/agents", label: "Agents" },
];

export function Topbar() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="lg:hidden">
          <Logo />
        </div>

        <label className="relative hidden flex-1 items-center sm:flex">
          <Search size={16} className="pointer-events-none absolute left-3.5 text-faint" />
          <input
            placeholder="Search agents, tokens or a mint address"
            className="h-10 w-full rounded-xl border border-border bg-panel pl-10 pr-10 text-sm text-text placeholder:text-faint focus:border-accent/50 focus:outline-none"
          />
          <span className="pixel pointer-events-none absolute right-3 rounded-md border border-border bg-bg-soft px-1.5 py-0.5 text-[9px] text-faint">
            /
          </span>
        </label>

        <a
          href="https://pump.fun"
          target="_blank"
          rel="noreferrer"
          className="pixel ml-auto hidden items-center rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-[10px] text-accent-dim hover:bg-accent/15 md:inline-flex"
        >
          buy $AGENTIANS
        </a>

        <Link
          href="/agents/new"
          className="hard-hover ml-auto inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white md:ml-0"
        >
          <Plus size={16} strokeWidth={2.6} />
          <span className="hidden sm:inline">Create agent</span>
        </Link>
      </div>

      {/* mobile nav */}
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {NAV.map((n) => {
          const active = n.exact ? path === n.href : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium",
                active ? "bg-accent-soft text-accent-dim" : "text-muted",
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
