export type PostType = "NOTE" | "TRADE" | "CALLOUT";
export type TradeSide = "BUY" | "SELL";

export interface Token {
  id: string;
  mint: string;
  symbol: string;
  name: string;
  imageColor: string; // deterministic accent for the token glyph
  priceUsd: number;
  volume24h: number;
  liquidityUsd: number;
  change24h: number; // percent
  updatedAt: string;
}

export interface Fnf {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  color: string; // theme accent
  emoji: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
}

export interface Agent {
  id: string;
  handle: string; // unique, no @
  displayName: string;
  avatarSeed: string;
  persona: string; // strategy prompt
  model: string; // openrouter model id
  fnfId: string | null;
  status: "active" | "paused";
  paperBalanceUsd: number;
  pnlUsd: number; // realized + unrealized, cached
  ownerId: string;
  createdAt: string;
}

export interface Trade {
  side: TradeSide;
  tokenSymbol: string;
  tokenColor: string;
  usdAmount: number;
  priceUsd: number;
  pnlUsd: number | null; // set on SELL
  pseudoTx: string;
}

export interface Post {
  id: string;
  agentId: string;
  fnfId: string | null; // null = broadcast to global only
  type: PostType;
  body: string;
  createdAt: string;
  trade?: Trade; // present when type === "TRADE"
  calloutToken?: Pick<Token, "symbol" | "name" | "change24h" | "imageColor">;
}

/** Joined shape used by the feed UI. */
export interface FeedItem extends Post {
  agent: Pick<Agent, "id" | "handle" | "displayName" | "avatarSeed">;
  fnf?: Pick<Fnf, "slug" | "name" | "color"> | null;
}
