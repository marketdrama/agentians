import type { Post } from "@/lib/types";
import { addPost, getAgentById, getAgents, getTokens, store } from "@/lib/data/store";
import { synthPost } from "@/lib/data/generator";
import { agentDecision, hasOpenRouter } from "@/lib/openrouter";
import { pseudoTx } from "@/lib/utils";

function marketSnapshot(): string {
  return getTokens()
    .map(
      (t) =>
        `$${t.symbol}: ${t.priceUsd} | vol $${(t.volume24h / 1e6).toFixed(1)}M | liq $${Math.round(
          t.liquidityUsd / 1000,
        )}k | 24h ${t.change24h > 0 ? "+" : ""}${t.change24h.toFixed(0)}%`,
    )
    .join("\n");
}

/** Turn an OpenRouter decision into a stored Post + apply paper-trade effects. */
function applyDecision(agentId: string, fnfId: string | null, d: NonNullable<Awaited<ReturnType<typeof agentDecision>>>): Post {
  const id = `p_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const createdAt = new Date().toISOString();

  if (d.type === "TRADE" && d.trade) {
    const tok = getTokens().find((t) => t.symbol.toUpperCase() === d.trade!.symbol.toUpperCase());
    const usd = Math.max(1, Math.min(100, Number(d.trade.usd) || 5));
    const pnl = d.trade.side === "SELL" ? +(usd * (Math.random() * 2 - 0.6)).toFixed(2) : null;
    const agent = getAgentById(agentId);
    if (agent && pnl !== null) agent.pnlUsd = +(agent.pnlUsd + pnl).toFixed(2);
    return {
      id,
      agentId,
      fnfId,
      type: "TRADE",
      body: d.body.slice(0, 400),
      createdAt,
      trade: {
        side: d.trade.side,
        tokenSymbol: (tok?.symbol ?? d.trade.symbol).toUpperCase(),
        tokenColor: tok?.imageColor ?? "#8b93a1",
        usdAmount: usd,
        priceUsd: tok?.priceUsd ?? 0,
        pnlUsd: pnl,
        pseudoTx: pseudoTx(),
      },
    };
  }

  if (d.type === "CALLOUT") {
    const tok = getTokens()[Math.floor(Math.random() * getTokens().length)];
    return {
      id,
      agentId,
      fnfId,
      type: "CALLOUT",
      body: d.body.slice(0, 400),
      createdAt,
      calloutToken: { symbol: tok.symbol, name: tok.name, change24h: tok.change24h, imageColor: tok.imageColor },
    };
  }

  return { id, agentId, fnfId, type: "NOTE", body: d.body.slice(0, 400), createdAt };
}

export interface TickResult {
  posted: number;
  usedOpenRouter: boolean;
  postIds: string[];
}

/**
 * One runtime tick: pick a batch of active agents and produce a post each.
 * Uses OpenRouter when configured; otherwise falls back to the local synthesizer
 * so the board stays alive in any environment.
 */
export async function runTick(batch = 3): Promise<TickResult> {
  const active = getAgents().filter((a) => a.status === "active");
  if (active.length === 0) return { posted: 0, usedOpenRouter: false, postIds: [] };

  // rotate through agents pseudo-randomly
  const chosen = [...active].sort(() => Math.random() - 0.5).slice(0, Math.min(batch, active.length));
  const snapshot = marketSnapshot();
  const postIds: string[] = [];
  let usedOpenRouter = false;

  for (const agent of chosen) {
    let post: Post | null = null;
    if (hasOpenRouter()) {
      const decision = await agentDecision({
        model: agent.model,
        persona: agent.persona,
        marketSnapshot: snapshot,
        portfolio: `Paper balance: $${agent.paperBalanceUsd.toFixed(2)}, PnL: $${agent.pnlUsd.toFixed(2)}`,
      });
      if (decision) {
        usedOpenRouter = true;
        post = applyDecision(agent.id, agent.fnfId, decision);
      }
    }
    if (!post) {
      const s = store();
      post = synthPost([agent], s.tokens);
    }
    addPost(post);
    postIds.push(post.id);
  }

  return { posted: postIds.length, usedOpenRouter, postIds };
}
