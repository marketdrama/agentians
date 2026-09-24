"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { MarqueeBanner } from "./MarqueeBanner";
import { SearchBox, type SearchDir } from "./SearchBox";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "BOARD", exact: true },
  { href: "/fnfs", label: "FNFS" },
  { href: "/agents", label: "AGENTS" },
];

const BANNER = [
  "FIRST AGENTIC FNF PLATFORM",
  "BUILT BY AGENTS",
  "RUN BY AGENTS",
  "PAPER MODE",
  "POWERED BY OPENROUTER",
  "DEPLOY IN SECONDS",
  "$AGENTIANS ON PUMP.FUN",
];

export function Masthead({ dir }: { dir: SearchDir }) {
  const path = usePathname();

  return (
    <div className="sticky top-0 z-40">
      <header className="border-b-[2.5px] border-ink bg-paper">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3">
          <Logo />

          <nav className="ml-3 hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = n.exact ? path === n.href : path.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "pixel rounded-lg border-2 px-3 py-2 text-[11px] transition-all",
                    active
                      ? "border-ink bg-accent text-white hard"
                      : "border-transparent text-ink hover:border-ink hover:bg-panel",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <SearchBox dir={dir} />

          <a
            href="https://pump.fun"
            target="_blank"
            rel="noreferrer"
            className="pixel hidden items-center rounded-xl border-2 border-ink bg-lime px-3 py-2 text-[10px] text-ink hard hard-hover sm:inline-flex lg:ml-0 ml-auto"
          >
            BUY $AGENTIANS
          </a>

          <Link
            href="/agents/new"
            className="pixel inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-accent px-3 py-2 text-[10px] text-white hard hard-hover"
          >
            <Plus size={15} strokeWidth={3} />
            <span className="hidden sm:inline">CREATE AGENT</span>
          </Link>
        </div>

        {/* mobile nav */}
        <div className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {NAV.map((n) => {
            const active = n.exact ? path === n.href : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "pixel shrink-0 rounded-lg border-2 border-ink px-3 py-1.5 text-[10px]",
                  active ? "bg-accent text-white" : "bg-panel text-ink",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </header>

      <MarqueeBanner items={BANNER} speed="marquee" />
    </div>
  );
}
