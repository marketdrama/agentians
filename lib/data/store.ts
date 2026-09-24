import type { Agent, FeedItem, Fnf, Post, Token } from "@/lib/types";
import { SEED_AGENTS, SEED_FNFS, SEED_POSTS, SEED_TOKENS } from "./seed";
import { synthPost } from "./generator";
import { createMarketAdapter, type MarketToken, type ProviderName } from "@/lib/market/index";
import { createPortfolio, valuate, type Portfolio, type Valuation } from "@/lib/paper/index";

/**
 * In-memory store — the runtime data layer for the demo. Cached on globalThis so
 * it survives Next.js hot-reloads. In production this is replaced by Supabase
 * (see lib/supabase + supabase/migrations); the read/write shape below is the
 * contract that adapter must satisfy.
 *
 * BLOCK-01 (lib/market) feeds real pump.fun/Solana prices into `tokens` via
 * refreshMarketTokens(); BLOCK-02 (lib/paper) runs each agent's paper portfolio.
 */
interface Store {
  tokens: Token[];
  fnfs: Fnf[];
  agents: Agent[];
  posts: Post[];
  portfolios: Record<string, Portfolio>; // keyed by agent id
}

const g = globalThis as unknown as { __agentiansStore?: Store };

function initStore(): Store {
  const agents = [...SEED_AGENTS];
  const portfolios: Record<string, Portfolio> = {};
  for (const a of agents) portfolios[a.id] = createPortfolio(a.paperBalanceUsd);
  return {
    tokens: [...SEED_TOKENS],
    fnfs: [...SEED_FNFS],
    agents,
    posts: [...SEED_POSTS],
    portfolios,
  };
}

// ---- BLOCK-01 market adapters, with a fallback chain ----
// Try the primary provider (MARKET_PROVIDER, default dexscreener), then fall
// back to the others so a rate-limited/blocked source doesn't kill live prices.
const gm = globalThis as unknown as {
  __agentiansAdapters?: ReturnType<typeof createMarketAdapter>[];
};

function providerChain(): ProviderName[] {
  const primary = (process.env.MARKET_PROVIDER as ProviderName | undefined) ?? "dexscreener";
  const chain: ProviderName[] = [primary, "dexscreener", "pumpfun"];
  if (process.env.BIRDEYE_API_KEY) chain.push("birdeye");
  return [...new Set(chain)];
}

function adapters() {
  if (!gm.__agentiansAdapters) {
    gm.__agentiansAdapters = providerChain().map((provider) => createMarketAdapter({ provider }));
  }
  return gm.__agentiansAdapters;
}

/** Map a BLOCK-01 MarketToken onto the app's Token shape. */
function toToken(m: MarketToken): Token {
  return {
    id: "t_" + m.mint,
    mint: m.mint,
    symbol: m.symbol,
    name: m.name,
    imageColor: m.imageColor,
    priceUsd: m.priceUsd,
    volume24h: m.volume24h,
    liquidityUsd: m.liquidityUsd,
    change24h: m.change24h,
    updatedAt: m.updatedAt,
  };
}

/**
 * Pull live trending tokens and replace the cache. Soft-fail: on an empty
 * result (network/rate-limit/parse error) the existing seed tokens are kept.
 */
export async function refreshMarketTokens(limit = 30): Promise<number> {
  for (const a of adapters()) {
    const live = await a.getTrendingTokens(limit);
    if (live.length) {
      store().tokens = live.map(toToken);
      if (a.name !== "dexscreener") console.log(`[market] using fallback provider: ${a.name}`);
      return live.length;
    }
  }
  return 0; // all providers empty — keep existing seed tokens
}

/** Current price keyed by mint, for the paper engine. */
export function priceByMint(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of store().tokens) if (t.mint && t.priceUsd > 0) out[t.mint] = t.priceUsd;
  return out;
}

export function getPortfolio(agentId: string): Portfolio {
  const s = store();
  if (!s.portfolios[agentId]) {
    const a = s.agents.find((x) => x.id === agentId);
    s.portfolios[agentId] = createPortfolio(a?.paperBalanceUsd ?? 1000);
  }
  return s.portfolios[agentId];
}

export function setPortfolio(agentId: string, p: Portfolio): void {
  store().portfolios[agentId] = p;
}

/** Mark an agent's paper book to market with current prices. */
export function getAgentValuation(agentId: string): Valuation {
  const a = store().agents.find((x) => x.id === agentId);
  return valuate(getPortfolio(agentId), priceByMint(), a?.paperBalanceUsd ?? 1000);
}

export function store(): Store {
  if (!g.__agentiansStore) g.__agentiansStore = initStore();
  const s = g.__agentiansStore;
  // backfill for stores cached before `portfolios` existed (HMR / older sessions)
  if (!s.portfolios) {
    s.portfolios = {};
    for (const a of s.agents) s.portfolios[a.id] = createPortfolio(a.paperBalanceUsd);
  }
  return s;
}

// ---- reads ----
export function getTokens(): Token[] {
  return store().tokens;
}
export function getFnfs(): Fnf[] {
  return [...store().fnfs].sort((a, b) => b.memberCount - a.memberCount);
}
export function getFnfBySlug(slug: string): Fnf | undefined {
  return store().fnfs.find((f) => f.slug === slug);
}
export function getFnfById(id: string | null): Fnf | undefined {
  if (!id) return undefined;
  return store().fnfs.find((f) => f.id === id);
}
export function getAgents(): Agent[] {
  return store().agents;
}
export function getAgentById(id: string): Agent | undefined {
  return store().agents.find((a) => a.id === id);
}
export function getAgentsByFnf(fnfId: string): Agent[] {
  return store().agents.filter((a) => a.fnfId === fnfId);
}

function toFeedItem(p: Post): FeedItem {
  const agent = getAgentById(p.agentId);
  const fnf = getFnfById(p.fnfId);
  return {
    ...p,
    agent: agent
      ? { id: agent.id, handle: agent.handle, displayName: agent.displayName, avatarSeed: agent.avatarSeed }
      : { id: p.agentId, handle: "unknown", displayName: "unknown", avatarSeed: p.agentId },
    fnf: fnf ? { slug: fnf.slug, name: fnf.name, color: fnf.color } : null,
  };
}

export function getFeed(limit = 40): FeedItem[] {
  return [...store().posts]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit)
    .map(toFeedItem);
}

export function getFnfFeed(fnfId: string, limit = 40): FeedItem[] {
  return [...store().posts]
    .filter((p) => p.fnfId === fnfId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit)
    .map(toFeedItem);
}

export function getAgentPosts(agentId: string, limit = 40): FeedItem[] {
  return [...store().posts]
    .filter((p) => p.agentId === agentId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit)
    .map(toFeedItem);
}

// ---- writes ----
export function addAgent(a: Agent): Agent {
  store().agents.unshift(a);
  store().portfolios[a.id] = createPortfolio(a.paperBalanceUsd);
  const fnf = getFnfById(a.fnfId);
  if (fnf) fnf.memberCount += 1;
  return a;
}

export function addPost(p: Post): FeedItem {
  store().posts.unshift(p);
  return toFeedItem(p);
}

/** Synthesize one plausible post from a random active agent + token. */
export function generatePost(): Post {
  const s = store();
  return synthPost(s.agents, s.tokens);
}

/** Lightweight props for the client-side <LiveFeed>. Scope to one FNF if given. */
export function feedClientProps(scopeFnfId?: string) {
  const s = store();
  const genAgents = s.agents
    .filter((a) => (scopeFnfId ? a.fnfId === scopeFnfId : true))
    .map((a) => ({ id: a.id, fnfId: a.fnfId, status: a.status }));
  const genTokens = s.tokens.map((t) => ({
    symbol: t.symbol,
    name: t.name,
    imageColor: t.imageColor,
    priceUsd: t.priceUsd,
    volume24h: t.volume24h,
    liquidityUsd: t.liquidityUsd,
    change24h: t.change24h,
  }));
  const agentDir: Record<string, { id: string; handle: string; displayName: string; avatarSeed: string }> = {};
  for (const a of s.agents) {
    agentDir[a.id] = { id: a.id, handle: a.handle, displayName: a.displayName, avatarSeed: a.avatarSeed };
  }
  const fnfDir: Record<string, { slug: string; name: string; color: string }> = {};
  for (const f of s.fnfs) {
    fnfDir[f.id] = { slug: f.slug, name: f.name, color: f.color };
  }
  return { genAgents, genTokens, agentDir, fnfDir };
}
