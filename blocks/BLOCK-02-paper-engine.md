# BLOCK-02 · Paper-Trading Engine

**For:** the same parallel Claude session (after BLOCK-01 handoff).
**Your job:** build a pure, self-contained TypeScript module that runs each agent's **paper portfolio** — buys/sells at a given price, tracks positions, and computes realized + unrealized PnL and equity. Own GitHub repo, own tests, additive. You do not touch the main app.

Follow the **Block Protocol** from `BLOCK-01-market-data-adapter.md` §2 verbatim (own repo, fixed interface, additive-only, self-testable, handoff artifact). Same commit/PR attribution rules (§7 there).

---

## 1. Context

`agentians.family` = AI agents that **paper-trade** memecoins. Today the app fakes PnL with random numbers. Your module replaces that with a correct, deterministic paper-accounting engine. It is **pure** — no network, no DB, no time-of-day dependence except an injected `now`. The integrator calls it from the agent runtime after BLOCK-01 gives live prices.

Prices come in as `priceUsd` per token `mint` (from BLOCK-01's `MarketToken`). You never fetch anything.

---

## 2. Interface (COPY VERBATIM into `src/types.ts`)

```ts
export interface Position {
  mint: string;
  symbol: string;
  qty: number;            // token units held (>= 0)
  avgCostUsd: number;     // average cost basis per unit
}

export interface Portfolio {
  cashUsd: number;        // uninvested paper cash
  realizedPnlUsd: number; // cumulative realized PnL
  positions: Record<string, Position>; // keyed by mint
}

export interface Fill {
  mint: string;
  symbol: string;
  side: "BUY" | "SELL";
  usdAmount: number;      // notional filled
  priceUsd: number;
  qty: number;            // units bought/sold
  realizedPnlUsd: number; // 0 for BUY; realized portion for SELL
  ts: string;             // ISO
}

export interface Valuation {
  cashUsd: number;
  positionsValueUsd: number;
  equityUsd: number;          // cash + positions value
  unrealizedPnlUsd: number;
  realizedPnlUsd: number;
  totalPnlUsd: number;        // realized + unrealized
  totalPnlPct: number;        // vs a provided starting balance
}
```

Public surface (in `src/index.ts`):

```ts
export function createPortfolio(startCashUsd: number): Portfolio;

/** Buy `usdAmount` of a token at priceUsd. Clamps to available cash; no-ops if cash/price invalid. */
export function buy(p: Portfolio, args: { mint: string; symbol: string; priceUsd: number; usdAmount: number; now?: Date }): { portfolio: Portfolio; fill: Fill | null };

/** Sell. Provide either usdAmount OR fraction (0..1 of the position) OR qty. Clamps to holdings. */
export function sell(p: Portfolio, args: { mint: string; priceUsd: number; usdAmount?: number; qty?: number; fraction?: number; now?: Date }): { portfolio: Portfolio; fill: Fill | null };

/** Mark the whole book to market given current prices by mint. */
export function valuate(p: Portfolio, priceByMint: Record<string, number>, startCashUsd: number): Valuation;
```

**Rules:**
- **Immutable:** never mutate the input `Portfolio`; return a new one (structural copy). Prove it in a test.
- **Deterministic & pure:** no `Math.random`, no `Date.now()` unless `now` omitted (then default `new Date()` — but tests must pass a fixed `now`).
- **Safe math:** reject/clamp NaN, negative, zero-price, over-sell, over-spend. Never produce negative `qty`/`cash`. On an invalid op, return the portfolio unchanged and `fill: null`.
- **Cost basis:** BUY updates `avgCostUsd` as a weighted average. SELL realizes `qty * (priceUsd - avgCostUsd)`, reduces `qty`, leaves `avgCostUsd` unchanged; a position hitting `qty <= dust` is removed.
- Keep everything in USD notionals (the app thinks in USD paper dollars).

---

## 3. Repo layout

```
agentians-paper-engine/
├── src/
│   ├── types.ts     # verbatim from §2
│   ├── index.ts     # createPortfolio, buy, sell, valuate
│   └── math.ts      # internal helpers (weighted avg, clamps)
├── test/
│   ├── buy.test.ts
│   ├── sell.test.ts
│   ├── valuate.test.ts
│   └── invariants.test.ts   # immutability, no-negative, over-sell/over-spend clamps
├── package.json     # ESM, "dependencies": {}, devDeps: vitest, typescript, @types/node, tsx
├── tsconfig.json
└── README.md        # public surface + INTEGRATION note (deps: none)
```

Constraints identical to BLOCK-01: TypeScript, ESM, Node 22, **zero runtime deps**, no UI/DB/network.

---

## 4. Definition of Done

- [ ] `npm install && npm test` passes offline; **immutability test** included (input portfolio unchanged after buy/sell).
- [ ] BUY weighted-average cost basis verified; SELL realized-PnL math verified (incl. partial sells via `fraction` and `qty`).
- [ ] Clamp tests: over-spend → clamped to cash; over-sell → clamped to holdings; zero/NaN/negative price → `fill: null`, portfolio unchanged.
- [ ] `valuate()` returns correct equity / unrealized / total / pct for a mixed book.
- [ ] `npx tsc --noEmit` clean. README documents the public surface + says runtime deps = none.
- [ ] Commit/PR attribution per BLOCK-01 §7. No secrets.

---

## 5. Integrator seam (context, don't build)

The main app will, per runtime tick: give each agent live prices from BLOCK-01, call `buy`/`sell` when the agent decides to trade, persist the returned `Portfolio`, and use `valuate(...).totalPnlUsd` to drive the leaderboard. So keep the functions total, pure, and forgiving of bad input.

## 6. Out of scope

No live prices (that's BLOCK-01), no persistence, no order types beyond market buy/sell, no fees/slippage (can add later behind the same interface), no UI.
