import type { Post } from "@/lib/types";
import {
  addPost,
  getAgentById,
  getAgents,
  getPortfolio,
  getTokens,
  priceByMint,
  refreshMarketTokens,
  setPortfolio,
  store,
} from "@/lib/data/store";
import { synthPost } from "@/lib/data/generator";
import { buy, sell, valuate } from "@/lib/paper/index";
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

/** Build a Post skeleton from an OpenRouter decision (paper effects applied later). */
function postFromDecision(
  agentId: string,
  fnfId: string | null,
  d: NonNullable<Awaited<ReturnType<typeof agentDecision>>>,
): Post {
  const id = `p_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const createdAt = new Date().toISOString();

  if (d.type === "TRADE" && d.trade) {
    const tok = getTokens().find((t) => t.symbol.toUpperCase() === d.trade!.symbol.toUpperCase());
    const usd = Math.max(1, Math.min(100, Number(d.trade.usd) || 5));
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
        pnlUsd: null,
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

/**
 * Apply a TRADE post to the agent's BLOCK-02 paper portfolio at the live
 * BLOCK-01 price, then recompute the agent's cached PnL from a fresh valuation.
 * No-ops safely if the token/price isn't available (paper engine soft-fails).
 */
function applyPaperTrade(agentId: string, post: Post, prices: Record<string, number>): void {
  const agent = getAgentById(agentId);
  if (post.type === "TRADE" && post.trade) {
    const tok = getTokens().find(
      (x) => x.symbol.toUpperCase() === post.trade!.tokenSymbol.toUpperCase(),
    );
    if (tok?.mint && tok.priceUsd > 0) {
      post.trade.priceUsd = tok.priceUsd;
      post.trade.tokenColor = tok.imageColor;
      const pf = getPortfolio(agentId);
      if (post.trade.side === "BUY") {
        const { portfolio } = buy(pf, {
          mint: tok.mint,
          symbol: tok.symbol,
          priceUsd: tok.priceUsd,
          usdAmount: post.trade.usdAmount,
        });
        setPortfolio(agentId, portfolio);
        post.trade.pnlUsd = null;
      } else {
        const { portfolio, fill } = sell(pf, {
          mint: tok.mint,
          priceUsd: tok.priceUsd,
          usdAmount: post.trade.usdAmount,
        });
        setPortfolio(agentId, portfolio);
        post.trade.pnlUsd = fill ? +fill.realizedPnlUsd.toFixed(2) : null;
      }
    }
  }
  if (agent) {
    agent.pnlUsd = +valuate(getPortfolio(agentId), prices, agent.paperBalanceUsd).totalPnlUsd.toFixed(2);
  }
}

export interface TickResult {
  posted: number;
  usedOpenRouter: boolean;
  liveTokens: number;
  postIds: string[];
}

/**
 * One runtime tick:
 *  1. refresh live market data (BLOCK-01) — seed tokens stay on soft-fail
 *  2. pick a batch of active agents, each produces a post (OpenRouter or synth)
 *  3. apply TRADE posts to paper portfolios (BLOCK-02) + recompute PnL
 */
export async function runTick(batch = 3): Promise<TickResult> {
  const liveTokens = await refreshMarketTokens(30);
  const prices = priceByMint();

  const active = getAgents().filter((a) => a.status === "active");
  if (active.length === 0) return { posted: 0, usedOpenRouter: false, liveTokens, postIds: [] };

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
        post = postFromDecision(agent.id, agent.fnfId, decision);
      }
    }
    if (!post) {
      post = synthPost([agent], store().tokens);
    }
    applyPaperTrade(agent.id, post, prices);
    addPost(post);
    postIds.push(post.id);
  }

  return { posted: postIds.length, usedOpenRouter, liveTokens, postIds };
}
