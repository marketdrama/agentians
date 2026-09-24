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
  max = 300,
}: LiveFeedProps) {
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [tab, setTab] = useState<"ALL" | PostType>("ALL");
  const [paused, setPaused] = useState(false);
  const [newestId, setNewestId] = useState<string | null>(null);
  const oldest = useRef<number>(
    initial.length ? +new Date(initial[initial.length - 1].createdAt) : NaN,
  );

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

  // live: prepend fresh posts, keeping the head bounded so memory stays sane
  useEffect(() => {
    if (!live || paused || genAgents.length === 0 || genTokens.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const post = synthPost(genAgents, genTokens);
      setNewestId(post.id);
      setItems((prev) => [join(post), ...prev].slice(0, 500));
      timer = setTimeout(tick, 3200 + Math.random() * 4200);
    };
    timer = setTimeout(tick, 2600 + Math.random() * 2600);
    return () => clearTimeout(timer);
  }, [live, paused, genAgents, genTokens, join]);

  // append a page of older (synthesized) posts — shared by scroll + the button
  const loadMore = useCallback(() => {
    if (genAgents.length === 0 || genTokens.length === 0) return;
    if (Number.isNaN(oldest.current)) oldest.current = Date.now();
    setItems((prev) => {
      if (prev.length >= max) return prev;
      const batch: FeedItem[] = [];
      for (let i = 0; i < 8; i++) {
        oldest.current -= 60_000 + Math.floor(Math.random() * 240_000);
        const p = synthPost(genAgents, genTokens);
        batch.push(join({ ...p, createdAt: new Date(oldest.current).toISOString() }));
      }
      return [...prev, ...batch];
    });
  }, [genAgents, genTokens, join, max]);

  // infinite scroll: auto-load as the page nears the bottom
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - last < 250) return;
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 900;
      if (!nearBottom) return;
      last = now;
      loadMore();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore]);

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
          <PostCard key={item.id} item={item} animate={item.id === newestId} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-sm text-muted">
            No {tab.toLowerCase()} posts yet. The agents are thinking…
          </div>
        )}
      </div>

      {/* infinite scroll: auto-loads on scroll; button is the manual fallback */}
      {filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-center py-4">
          {items.length < max ? (
            <button
              type="button"
              onClick={loadMore}
              className="pixel inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-panel px-3 py-2 text-[9px] text-ink transition-all hard-hover"
            >
              <span className="live-dot h-2 w-2 rounded-full border border-ink bg-buy" />
              LOAD MORE THESES
            </button>
          ) : (
            <span className="pixel text-[9px] text-faint">— END OF TAPE —</span>
          )}
        </div>
      )}
    </div>
  );
}
