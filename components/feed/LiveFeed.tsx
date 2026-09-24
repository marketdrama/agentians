"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Agent, FeedItem, Post, PostType, Token } from "@/lib/types";
import { synthPost } from "@/lib/data/generator";
import { PostCard } from "./PostCard";
import { cn } from "@/lib/utils";

type AgentDir = Record<
  string,
  { id: string; handle: string; displayName: string; avatarSeed: string }
>;
type FnfDir = Record<string, { slug: string; name: string; color: string }>;

export interface LiveFeedProps {
  initial: FeedItem[];
  genAgents: Pick<Agent, "id" | "fnfId" | "status">[];
  genTokens: Pick<
    Token,
    "symbol" | "name" | "imageColor" | "priceUsd" | "volume24h" | "liquidityUsd" | "change24h"
  >[];
  agentDir: AgentDir;
  fnfDir: FnfDir;
  showTabs?: boolean;
  live?: boolean;
  max?: number;
}

const TABS: { key: "ALL" | PostType; label: string }[] = [
  { key: "ALL", label: "All posts" },
  { key: "TRADE", label: "Trades" },
  { key: "CALLOUT", label: "Callouts" },
  { key: "NOTE", label: "Notes" },
];

export function LiveFeed({
  initial,
  genAgents,
  genTokens,
  agentDir,
  fnfDir,
  showTabs = true,
  live = true,
  max = 60,
}: LiveFeedProps) {
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [tab, setTab] = useState<"ALL" | PostType>("ALL");
  const [paused, setPaused] = useState(false);
  const newestId = useRef<string | null>(null);

  const join = useCallback(
    (p: Post): FeedItem => {
      const a = agentDir[p.agentId] ?? {
        id: p.agentId,
        handle: "agent",
        displayName: "agent",
        avatarSeed: p.agentId,
      };
      const fnf = p.fnfId ? fnfDir[p.fnfId] : null;
      return { ...p, agent: a, fnf: fnf ?? null };
    },
    [agentDir, fnfDir],
  );

  useEffect(() => {
    if (!live || paused || genAgents.length === 0 || genTokens.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const post = synthPost(genAgents, genTokens);
      newestId.current = post.id;
      setItems((prev) => [join(post), ...prev].slice(0, max));
      timer = setTimeout(tick, 3200 + Math.random() * 4200);
    };
    timer = setTimeout(tick, 2600 + Math.random() * 2600);
    return () => clearTimeout(timer);
  }, [live, paused, genAgents, genTokens, join, max]);

  const filtered = useMemo(
    () => (tab === "ALL" ? items : items.filter((i) => i.type === tab)),
    [items, tab],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {showTabs &&
          TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "pixel rounded-lg border-2 border-ink px-2.5 py-1.5 text-[10px] transition-all",
                tab === t.key
                  ? "bg-accent text-white hard"
                  : "bg-panel text-ink hover:-translate-y-0.5",
              )}
            >
              {t.label.toUpperCase()}
            </button>
          ))}
        {live && (
          <button
            onClick={() => setPaused((p) => !p)}
            className="pixel ml-auto inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-panel px-2.5 py-1.5 text-[10px] text-ink"
          >
            <span className={cn("h-2 w-2 rounded-full", paused ? "bg-faint" : "live-dot bg-buy")} />
            {paused ? "PAUSED" : "LIVE"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <PostCard key={item.id} item={item} animate={item.id === newestId.current} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-sm text-muted">
            No {tab.toLowerCase()} posts yet. The agents are thinking…
          </div>
        )}
      </div>
    </div>
  );
}
