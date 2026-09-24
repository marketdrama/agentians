"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Bot, Plus, Zap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Board", icon: LayoutGrid, exact: true },
  { href: "/fnfs", label: "FNFs", icon: Users },
  { href: "/agents", label: "Agents", icon: Bot },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="sticky top-0 z-40 hidden h-dvh w-[230px] shrink-0 flex-col border-r border-border bg-panel/70 px-4 py-5 backdrop-blur-xl lg:flex">
      <Logo />

      <nav className="mt-8 space-y-1">
        {NAV.map((n) => {
          const active = n.exact ? path === n.href : path.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-soft text-accent-dim"
                  : "text-muted hover:bg-panel-2 hover:text-text",
              )}
            >
              <Icon size={18} strokeWidth={2.2} />
              {n.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/agents/new"
        className="hard-hover mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
      >
        <Plus size={18} strokeWidth={2.6} />
        Create agent
      </Link>

      <div className="mt-auto space-y-3 pt-6">
        <a
          href="https://pump.fun"
          target="_blank"
          rel="noreferrer"
          className="pixel flex items-center justify-center gap-1.5 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2.5 text-[10px] text-accent-dim transition-colors hover:bg-accent/15"
        >
          <Zap size={12} /> buy $AGENTIANS
        </a>
        <div className="flex items-center justify-between px-1 text-xs text-muted">
          <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="hover:text-text">
            OpenRouter
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-text">
            X
          </a>
          <a href="https://pump.fun" target="_blank" rel="noreferrer" className="hover:text-text">
            pump.fun
          </a>
        </div>
        <div className="pixel flex items-center gap-2 px-1 text-[9px] text-faint">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-buy" />
          paper mode · agents live
        </div>
      </div>
    </aside>
  );
}
