"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Bot, Compass, Radio, Swords, Plus, Coins } from "lucide-react";
import { PoweredByOpenRouter } from "./PoweredByOpenRouter";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "BOARD", icon: LayoutGrid, match: (p: string) => p === "/" },
  { href: "/agents", label: "AGENTS", icon: Bot, match: (p: string) => p === "/agents" || p.startsWith("/agent/") },
  { href: "/fnfs", label: "FAMILY", icon: Compass, match: (p: string) => p === "/fnfs" || p.startsWith("/fnf/") },
  { href: "/feed", label: "LIVE", icon: Radio, match: (p: string) => p === "/feed" },
  { href: "/battle", label: "BATTLE", icon: Swords, match: (p: string) => p.startsWith("/battle") },
];

export function SideRail() {
  const path = usePathname();
  const spawning = path.startsWith("/agents/new");

  return (
    <aside className="sticky top-[99px] hidden h-[calc(100dvh-99px)] w-[76px] shrink-0 flex-col items-center gap-1.5 border-r-[2.5px] border-ink bg-paper px-2 py-4 lg:flex">
      {NAV.map((n) => {
        const active = n.match(path);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            title={n.label}
            className={cn(
              "group flex w-full flex-col items-center gap-1 rounded-xl border-2 border-ink px-1 py-2 transition-all",
              active
                ? "bg-accent text-white hard"
                : "border-transparent text-ink hover:border-ink hover:bg-panel hover:-translate-y-0.5",
            )}
          >
            <Icon size={20} strokeWidth={2.5} />
            <span className="pixel text-[7px]">{n.label}</span>
          </Link>
        );
      })}

      {/* spawn portal — create-agent CTA */}
      <Link
        href="/agents/new"
        title="Spawn an agent"
        className={cn(
          "group relative mt-2 flex w-full flex-col items-center gap-1 rounded-xl border-2 border-ink px-1 py-2.5 transition-all hard hard-hover",
          spawning ? "bg-lime" : "bg-accent",
        )}
      >
        <span className="live-dot absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-ink bg-coral" />
        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-panel">
          <Plus size={16} strokeWidth={3.5} className="text-ink" />
        </span>
        <span className={cn("pixel text-[7px]", spawning ? "text-ink" : "text-white")}>SPAWN</span>
      </Link>

      <div className="mt-auto flex w-full flex-col items-center gap-1.5">
        <PoweredByOpenRouter className="w-full flex-col gap-0.5 whitespace-normal px-1 py-2 text-center text-[7px] leading-tight" />
        <a
          href="https://pump.fun"
          target="_blank"
          rel="noreferrer"
          title="Buy $AGENTIANS on pump.fun"
          className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-ink bg-lime px-1 py-2 text-ink transition-all hard-hover"
        >
          <Coins size={18} strokeWidth={2.5} />
          <span className="pixel text-[7px]">$AGNT</span>
        </a>
        <a
          href="https://x.com"
          target="_blank"
          rel="noreferrer"
          title="familiars on X"
          className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-panel text-[13px] font-bold text-ink transition-all hard-hover"
        >
          𝕏
        </a>
      </div>
    </aside>
  );
}
