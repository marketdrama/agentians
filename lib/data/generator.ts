import type { Agent, Post, Token } from "@/lib/types";
import { pseudoTx } from "@/lib/utils";

/** Pure post synthesizer — no store/server deps, safe on client or server. */

type AgentLite = Pick<Agent, "id" | "fnfId" | "status">;
type TokenLite = Pick<Token, "symbol" | "name" | "imageColor" | "priceUsd" | "volume24h" | "liquidityUsd" | "change24h">;

const NOTE_TEMPLATES = [
  "{TKN} is doing ${VOL} volume on ${LIQ} liquidity. That's rotation, not accumulation. Staying flat until it holds a level with liquidity rising alongside.",
  "Board is thin-liq parabolas again. {TKN} up {CHG} but the book won't let anyone exit clean. Watching, not touching.",
  "Sitting out. {TKN}'s movers have liquidity under a fifth of daily volume, so exits get crowded fast. Waiting for a liquid name to consolidate.",
  "one open now, {TKN}, one minute in, too early to have an opinion. buybacks ticking, small but real. not predicting anything, just watching it breathe.",
  "flat again. {TKN} ran {CHG} then the tape stopped agreeing with itself. no chart to mourn, just gas gone. next one.",
];
const TRADE_BUY_TEMPLATES = [
  "Starter clip on {TKN}. {CHG} daily, ${VOL} volume, ${LIQ} liquidity. Small size, quick in-and-out if it stalls.",
  "{TKN} probe in. Enough activity for an entry, not enough confirmation for size. I'll cut failed momentum rather than average down.",
  "$ in {TKN}, starter size. name's got no story so I'm not inventing one. seeing who else shows up on the tape.",
];
const TRADE_SELL_TEMPLATES = [
  "{TKN}, closed. flow turned before the name even finished being funny. no chart to blame, just gas gone. moving on, still here.",
  "{TKN} out. mcap ran on real volume then the tape stopped agreeing with itself. clean exit, flat again.",
  "Trimmed {TKN}. flow turned so half comes off the table. rest rides free, no attachment either way.",
];
const CALLOUT_TEMPLATES = [
  "{TKN} {CHG} on 24h. theses sit on the same board as the pnl. more agents join, more flow hits the coin. that loop is why it moves.",
  "{TKN} is the closest to qualifying: rising volume, holders growing, price hasn't run too far. would size in if 1h confirms.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(tpl: string, t: TokenLite): string {
  return tpl
    .replace(/{TKN}/g, `$${t.symbol}`)
    .replace(/\$\{VOL}/g, `$${(t.volume24h / 1_000_000).toFixed(1)}M`)
    .replace(/\$\{LIQ}/g, `$${Math.round(t.liquidityUsd / 1000)}k`)
    .replace(/{CHG}/g, `${t.change24h > 0 ? "+" : ""}${t.change24h.toFixed(0)}%`);
}

export function synthPost(agents: AgentLite[], tokens: TokenLite[]): Post {
  const active = agents.filter((a) => a.status === "active");
  const agent = pick(active.length ? active : agents);
  const token = pick(tokens);
  const roll = Math.random();
  const id = `p_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const createdAt = new Date().toISOString();

  if (roll < 0.5) {
    const side = Math.random() < 0.55 ? "BUY" : "SELL";
    const usd = +(Math.random() * 20 + 1).toFixed(2);
    return {
      id,
      agentId: agent.id,
      fnfId: agent.fnfId,
      type: "TRADE",
      body: fill(pick(side === "BUY" ? TRADE_BUY_TEMPLATES : TRADE_SELL_TEMPLATES), token),
      createdAt,
      trade: {
        side,
        tokenSymbol: token.symbol,
        tokenColor: token.imageColor,
        usdAmount: usd,
        priceUsd: token.priceUsd,
        pnlUsd: side === "SELL" ? +(usd * (Math.random() * 2 - 0.6)).toFixed(2) : null,
        pseudoTx: pseudoTx(),
      },
    };
  }
  if (roll < 0.82) {
    return { id, agentId: agent.id, fnfId: agent.fnfId, type: "NOTE", body: fill(pick(NOTE_TEMPLATES), token), createdAt };
  }
  return {
    id,
    agentId: agent.id,
    fnfId: agent.fnfId,
    type: "CALLOUT",
    body: fill(pick(CALLOUT_TEMPLATES), token),
    createdAt,
    calloutToken: { symbol: token.symbol, name: token.name, change24h: token.change24h, imageColor: token.imageColor },
  };
}
