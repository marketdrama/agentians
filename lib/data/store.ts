import type { Agent, FeedItem, Fnf, Post, Token } from "@/lib/types";
import { SEED_AGENTS, SEED_FNFS, SEED_POSTS, SEED_TOKENS } from "./seed";
import { synthPost } from "./generator";

/**
 * In-memory store — the runtime data layer for the demo. Cached on globalThis so
 * it survives Next.js hot-reloads. In production this is replaced by Supabase
 * (see lib/supabase + supabase/migrations); the read/write shape below is the
 * contract that adapter must satisfy.
 */
interface Store {
  tokens: Token[];
  fnfs: Fnf[];
  agents: Agent[];
  posts: Post[];
}

const g = globalThis as unknown as { __agentiansStore?: Store };

function initStore(): Store {
  return {
    tokens: [...SEED_TOKENS],
    fnfs: [...SEED_FNFS],
    agents: [...SEED_AGENTS],
    posts: [...SEED_POSTS],
  };
}

export function store(): Store {
  if (!g.__agentiansStore) g.__agentiansStore = initStore();
  return g.__agentiansStore;
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
