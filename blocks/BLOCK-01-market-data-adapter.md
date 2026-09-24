# BLOCK-01 · Live Market-Data Adapter (pump.fun / Solana)

**For:** a separate, parallel Claude Code session.
**Coordinator:** the human. **Integrator:** the main `agentians.family` Claude session (pulls your work and wires it in).
**Your job:** build ONE self-contained block — a real market-data adapter — in your **own standalone GitHub repo**, with tests, and hand back the repo URL + commit SHA. You do **not** touch the main app. The integrator copies your module in behind a fixed interface.

---

## 0. TL;DR of the contract

- Build a TypeScript module that fetches **real Solana / pump.fun token market data** (price, 24h volume, liquidity, 24h change) and returns it normalized to a fixed shape (`MarketToken` — defined below, copy it verbatim).
- Default provider must work with **no API key** (use DexScreener). Add pump.fun + one keyed provider as pluggable options.
- Ship it as a **standalone repo** with unit tests (offline, fixture-based) + a live smoke script.
- Match the `MarketToken` interface and file layout **exactly** — that is the only integration seam.
- Do not build UI, do not add a database, do not touch the main app's files. Output data only.

---

## 1. Project context (what you're plugging into)

`agentians.family` = "the first Agentic FNF platform, built by agents, run by agents." A pump.fun-adjacent app where users deploy AI trading agents that scan the market, post thesis, and make **paper** trades to a live feed. Live demo: `https://agentians-family-production.up.railway.app`.

Stack: **Next.js 16 (App Router, TS), Tailwind v4, Supabase (planned), OpenRouter**. Node 22. The app currently runs on an **in-memory store** seeded with fake tokens (`lib/data/seed.ts`). Agents read a "market snapshot" built from those tokens in `lib/agent-runtime.ts`.

**Your block replaces the fake token data with real data.** The app has a `tokens` concept with this shape (from `lib/types.ts`, for reference only — you output the `MarketToken` variant below, the integrator maps it):

```ts
// main app's Token (reference — DO NOT depend on this)
interface Token {
  id: string; mint: string; symbol: string; name: string;
  imageColor: string; priceUsd: number; volume24h: number;
  liquidityUsd: number; change24h: number; updatedAt: string;
}
```

---

## 2. The Block Protocol (how every parallel block works — reusable)

1. **Isolation:** you work in your **own new GitHub repo**, never in the main app repo. No coordination on files = no merge conflicts.
2. **Fixed seam:** the block communicates with the app through ONE typed interface + one exported factory. Both sides agree on it via this doc. Nothing else is shared.
3. **Additive only:** your deliverable is a folder of new source files + a dependency list + tests. The integrator copies the folder into the app and does the wiring (which touches shared files — that's the integrator's job, not yours).
4. **Self-testable:** your repo must build and test **without the main app and without secrets** (fixtures for unit tests; live calls only in an opt-in smoke script).
5. **Handoff artifact:** when done you return: repo URL, default branch, latest commit SHA, the list of files to copy, and the exact runtime deps to install. (See §7.)

---

## 3. This block's interface (COPY VERBATIM into `src/types.ts`)

```ts
export interface MarketToken {
  mint: string;          // Solana mint address (unique id)
  symbol: string;        // e.g. "WIF" (no leading $)
  name: string;          // human name
  imageColor: string;    // hex like "#8b93a1" — derive deterministically from symbol if the source has no color
  priceUsd: number;      // > 0
  volume24h: number;     // USD, 24h
  liquidityUsd: number;  // USD, current pool liquidity
  change24h: number;     // percent, e.g. -12.5 or 318.0
  updatedAt: string;     // ISO 8601 timestamp of when fetched
}

export interface MarketAdapter {
  /** provider name, e.g. "dexscreener" */
  readonly name: string;
  /** trending / most-active Solana tokens, normalized + sorted by volume24h desc */
  getTrendingTokens(limit?: number): Promise<MarketToken[]>;
  /** one token by mint, or null if not found */
  getToken(mint: string): Promise<MarketToken | null>;
}
```

And the single public factory (in `src/index.ts`):

```ts
export function createMarketAdapter(opts?: {
  provider?: "dexscreener" | "pumpfun" | "birdeye"; // default from env MARKET_PROVIDER, else "dexscreener"
  cacheTtlMs?: number;                               // default from env MARKET_CACHE_TTL_MS, else 30000
  apiKey?: string;                                   // for keyed providers (birdeye), from env
}): MarketAdapter;
```

**Rules:**
- Never throw out of `getTrendingTokens` / `getToken` for network/rate-limit failures — log and return `[]` / `null`. The app falls back to seed data on empty, so failures must be soft.
- Every returned `MarketToken` must have `priceUsd > 0` and finite numbers (filter out garbage rows).
- `imageColor`: if the source gives no image/color, derive a hex from a hash of `symbol` (deterministic). Include a tiny helper `colorFromSymbol(symbol): string`.

---

## 4. Providers to implement

Implement a small internal `Provider` layer; the adapter wraps it with normalization + caching.

1. **DexScreener — DEFAULT, no key required.**
   - Token profiles / search / pairs: `https://api.dexscreener.com/latest/dex/search?q=solana` and `https://api.dexscreener.com/latest/dex/tokens/{mint}` and `https://api.dexscreener.com/token-profiles/latest/v1` (research current endpoints — they evolve).
   - Filter to `chainId === "solana"`. Map: `priceUsd`, `volume.h24`, `liquidity.usd`, `priceChange.h24`, `baseToken.symbol/name/address`.
   - This is the zero-config default so the app keeps its "runs with no keys" property.

2. **pump.fun — optional, no key (unofficial, may be unstable).**
   - Trending/new coins: `https://frontend-api.pump.fun/coins?sort=...&limit=...` (verify; endpoints unofficial and change). Good for surfacing brand-new pump mints.
   - Be defensive: unstable schema, rate limits. Soft-fail.

3. **Birdeye — optional, keyed (`BIRDEYE_API_KEY`).**
   - `https://public-api.birdeye.so` token list/price (Solana). Header `X-API-KEY`, `x-chain: solana`.

Provider chosen by `MARKET_PROVIDER` env (default `dexscreener`). Keep providers in separate files so more can be added later.

---

## 5. Required repo layout

```
agentians-market-adapter/           (your standalone repo)
├── src/
│   ├── types.ts                     # MarketToken + MarketAdapter (verbatim from §3)
│   ├── index.ts                     # createMarketAdapter() factory + re-exports
│   ├── cache.ts                     # tiny TTL cache
│   ├── color.ts                     # colorFromSymbol()
│   ├── normalize.ts                 # provider row -> MarketToken, with validation
│   └── providers/
│       ├── dexscreener.ts
│       ├── pumpfun.ts
│       └── birdeye.ts
├── test/
│   ├── normalize.test.ts
│   ├── dexscreener.test.ts          # uses fixtures, no network
│   └── fixtures/*.json              # recorded real responses
├── scripts/
│   └── smoke.ts                     # hits the LIVE api, prints a table; opt-in manual check
├── package.json                     # own deps; "type": "module"; vitest; tsx for smoke
├── tsconfig.json
├── .env.example                     # MARKET_PROVIDER, MARKET_CACHE_TTL_MS, BIRDEYE_API_KEY
├── .gitignore                       # node_modules, dist, .env
└── README.md                        # setup, env, `npm test`, `npm run smoke`, INTEGRATION note
```

**Constraints:**
- Language: TypeScript, ESM (`"type": "module"`), targeting Node 22. Use the **global `fetch`** (no axios/node-fetch).
- Runtime deps: aim for **zero** (native fetch). Dev deps only: `vitest`, `tsx`, `typescript`, `@types/node`.
- No React, no Next, no browser APIs — this is a server-side data module.
- Keep the public surface to `createMarketAdapter`, `MarketToken`, `MarketAdapter`, and `colorFromSymbol`.

---

## 6. Tests & acceptance criteria (Definition of Done)

- [ ] `npm install && npm test` passes **offline** (unit tests use `test/fixtures/*.json`, no live network).
- [ ] `normalize.ts` tested: drops rows with `priceUsd<=0`/NaN, maps fields correctly, derives `imageColor`, sets ISO `updatedAt`.
- [ ] `getTrendingTokens()` returns items sorted by `volume24h` desc, respects `limit`.
- [ ] Soft-fail proven: a test where the provider fetch rejects → returns `[]` (no throw).
- [ ] Cache proven: two calls within TTL hit the network once (mock fetch, assert call count).
- [ ] `npm run smoke` (live) prints ≥10 real Solana tokens with non-zero price/volume/liquidity. Paste a sample of that output into the PR/README so the integrator can see it worked.
- [ ] `npx tsc --noEmit` clean. `README.md` documents env + how to run + an **INTEGRATION** section noting the exact deps to install (should be none) and the files under `src/` to copy.

---

## 7. Git / GitHub workflow (what to do, and what to hand back)

1. Create the repo with the GitHub CLI:
   ```bash
   gh repo create agentians-market-adapter --private --source . --remote origin
   ```
   (Ask the coordinator whether it should be `--public` or `--private`; default private.)
2. Work on a branch, then open a PR into `main` (or push straight to `main` if the coordinator prefers). Small, logical commits.
3. **Commit message convention** — end every commit message with:
   ```
   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   ```
4. **PR description** — end it with:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```
5. When done, hand the coordinator back, in one message:
   - repo URL
   - default branch + latest commit SHA
   - the list of files under `src/` (the copy set)
   - runtime deps to install in the main app (expected: none)
   - a pasted sample of `npm run smoke` output

Do **not** deploy anything. Do **not** put secrets in the repo or commits (`.env` is gitignored; only `.env.example`).

---

## 8. How the integrator will wire it in (context so you build to the right seam)

You don't do this — but build so it slots in cleanly. On pull, the main Claude will:

1. Copy your `src/**` into the app at `lib/market/` (e.g. `lib/market/index.ts`, `lib/market/providers/…`).
2. Install any runtime deps you listed (target: none).
3. Add a mapper `MarketToken → Token` (adds `id = "t_" + mint`) and a `refreshMarketTokens()` that calls `getTrendingTokens()` and updates the in-memory `tokens` in `lib/data/store.ts`.
4. Call `refreshMarketTokens()` at the top of the runtime loop in `lib/agent-runtime.ts` (`/api/cron/tick`) so agents reason over live data; keep seed data as the fallback when the adapter returns `[]`.
5. Set `MARKET_PROVIDER` (and any key) as env on Railway.

So: the cleaner and more defensive `getTrendingTokens()` is (always returns valid `MarketToken[]` or `[]`), the more drop-in your block is.

---

## 9. Out of scope (do NOT do)

- No UI / React / styling.
- No database / Supabase.
- No changes to the main app repo.
- No websockets/streaming (polling only for now).
- No trade execution — this is read-only market data for **paper** trading.

Questions or interface ambiguity → ask the coordinator before diverging from §3. The interface is the contract; keep it exact.
