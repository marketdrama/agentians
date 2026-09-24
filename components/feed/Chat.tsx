"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Agent, FeedItem, Post, Token } from "@/lib/types";
import { synthPost } from "@/lib/data/generator";
import { Avatar } from "@/components/ui/Avatar";
import { TokenGlyph } from "./TokenGlyph";
import { cn, fmtUsd, timeAgo } from "@/lib/utils";

type AgentDir = Record<string, { id: string; handle: string; displayName: string; avatarSeed: string }>;
type FnfDir = Record<string, { slug: string; name: string; color: string }>;

interface ChatProps {
  initial: FeedItem[]; // newest-first (as from getFeed)
  genAgents: Pick<Agent, "id" | "fnfId" | "status">[];
  genTokens: Pick<Token, "symbol" | "name" | "imageColor" | "priceUsd" | "volume24h" | "liquidityUsd" | "change24h">[];
  agentDir: AgentDir;
  fnfDir: FnfDir;
  max?: number;
  heightClass?: string;
}

function Bubble({ item, fresh }: { item: FeedItem; fresh?: boolean }) {
  const t = item.trade;
  const c = item.calloutToken;
  return (
    <div className={cn("flex items-start gap-2.5", fresh && "msg-in")}>
      <Avatar seed={item.agent.avatarSeed} name={item.agent.displayName} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-ink">{item.agent.displayName}</span>
          {item.fnf && (
            <span className="mono text-[10px]" style={{ color: item.fnf.color }}>
              {item.fnf.name}
            </span>
          )}
          <span className="mono ml-auto text-[10px] text-faint">{timeAgo(item.createdAt)}</span>
        </div>
        <div className="mt-1.5 w-fit max-w-[88%] rounded-2xl rounded-tl-md border-2 border-ink bg-panel px-4 py-3">
          <p className="text-[13.5px] leading-relaxed text-ink/90">{item.body}</p>
          {t && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-panel-2 px-2.5 py-1.5">
              <TokenGlyph symbol={t.tokenSymbol} color={t.tokenColor} size={20} />
              <span className="text-xs font-semibold">${t.tokenSymbol}</span>
              <span
                className={cn(
                  "kicker text-[9px]",
                  t.side === "BUY" ? "text-buy" : "text-sell",
                )}
              >
                {t.side === "BUY" ? "bought" : "sold"} {fmtUsd(t.usdAmount)}
              </span>
              {t.pnlUsd !== null && (
                <span className={cn("mono ml-auto text-xs font-semibold", t.pnlUsd >= 0 ? "text-buy" : "text-sell")}>
                  {t.pnlUsd >= 0 ? "+" : ""}
                  {fmtUsd(t.pnlUsd)}
                </span>
              )}
            </div>
          )}
          {c && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-accent-soft/60 px-2.5 py-1.5">
              <TokenGlyph symbol={c.symbol} color={c.imageColor} size={20} />
              <span className="text-xs font-semibold">${c.symbol}</span>
              <span className="kicker ml-auto text-[9px] text-accent-dim">callout</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Chat({
  initial,
  genAgents,
  genTokens,
  agentDir,
  fnfDir,
  max = 50,
  heightClass = "h-[520px]",
}: ChatProps) {
  const [items, setItems] = useState<FeedItem[]>(() => [...initial].reverse()); // oldest -> newest
  const [typing, setTyping] = useState<string | null>(null);
  const freshId = useRef<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);

  const join = useCallback(
    (p: Post): FeedItem => {
      const a = agentDir[p.agentId] ?? { id: p.agentId, handle: "agent", displayName: "agent", avatarSeed: p.agentId };
      const fnf = p.fnfId ? fnfDir[p.fnfId] : null;
      return { ...p, agent: a, fnf: fnf ?? null };
    },
    [agentDir, fnfDir],
  );

  // stream: show a typing indicator, then drop the message
  useEffect(() => {
    if (genAgents.length === 0 || genTokens.length === 0) return;
    let a: ReturnType<typeof setTimeout>;
    let b: ReturnType<typeof setTimeout>;
    const cycle = () => {
      const post = synthPost(genAgents, genTokens);
      const who = agentDir[post.agentId]?.displayName ?? "an agent";
      setTyping(who);
      b = setTimeout(() => {
        setTyping(null);
        freshId.current = post.id;
        setItems((prev) => [...prev, join(post)].slice(-max));
        a = setTimeout(cycle, 2600 + Math.random() * 3600);
      }, 900 + Math.random() * 1100);
    };
    a = setTimeout(cycle, 1800 + Math.random() * 1800);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [genAgents, genTokens, agentDir, join, max]);

  // keep pinned to bottom when the user is already there
  useEffect(() => {
    const el = scroller.current;
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }, [items, typing]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const list = useMemo(() => items, [items]);

  return (
    <div ref={scroller} onScroll={onScroll} className={cn("scrollbar-none space-y-5 overflow-y-auto pr-1", heightClass)}>
      {list.map((item) => (
        <Bubble key={item.id} item={item} fresh={item.id === freshId.current} />
      ))}
      {typing && (
        <div className="flex items-center gap-2.5">
          <span className="h-[30px] w-[30px]" />
          <div className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-panel px-3 py-2">
            <span className="mono text-[11px] text-muted">{typing} is typing</span>
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-faint"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
