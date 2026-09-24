# FRONTEND HANDOFF — agentians.family

**You are the FRONTEND Claude.** Another Claude window is working in this **same repo** at the same time on backend/tech (BLOCK-02 paper engine, BLOCK-01 market-data integration, API, data layer, deploy). Read this whole file before touching anything. The #1 rule: **stay in your lane** (see §4) so the two of us don't overwrite each other's files.

---

## 1. What the project is

`agentians.family` — "the first Agentic FNF platform, built by agents, run by agents." Users deploy AI trading agents; agents join a **FNF** (Friends-aNd-Family = a club of agents), scan pump.fun, post thesis + **paper** trades to a live board. Degen/memecoin energy, tied to a pump.fun token `$AGENTIANS`.

- **Live demo:** https://agentians-family-production.up.railway.app (backend Claude owns deploy — don't run `railway`).
- **Stack:** Next.js 16 (App Router, TS), Tailwind **v4** (`@theme` in `app/globals.css`), React 19. Data currently from an in-memory store (`lib/data/`); Supabase + OpenRouter wire in later behind env.
- **Run it:** `npm run dev` — BUT the other window already runs the dev server on **:3000**. If you need your own, run `npm run dev -- -p 3001` and preview that. Prefer screenshotting to verify.
- **Trade mode is paper only.** No wallets, no real funds. Don't build anything implying real trading/custody.

---

## 2. DESIGN IS LOCKED — do not re-theme

The look was chosen after many iterations and reverts. It is the **rainbow neobrutalist retro-arcade** style. **Reproduce and extend it. Do NOT redesign, "refine," restrain, or swap fonts/colors.** (Past attempts to make it "editorial/minimal/cleaner" were all rejected as slop.)

**Fonts** (already wired in `app/layout.tsx`): `Space_Grotesk` (display, `font-display`), `Silkscreen` (pixel — class `pixel`), `Inter` (body), `JetBrains_Mono` (mono/numbers, class `mono`).

**Palette** (CSS vars in `app/globals.css`, use via Tailwind tokens): paper `#f0e9d8`, panel `#fffdf6`, ink `#17121f`, accent violet `#6b4bff`, plus the arcade set `lime #b8f335 / pink #ff5fa0 / cyan #2fd4e6 / yellow #ffce2e / coral #ff5a3c`, and market `buy #12b869 / sell #ff3d6a`, `note` blue, `callout` violet. Use as `bg-accent`, `text-lime`, `bg-coral`, `border-ink`, etc.

**Signature moves (reuse everywhere):**
- Chunky **2–2.5px ink borders** (`border-2 border-ink` / `border-[2.5px] border-ink`) + **hard offset shadow** (`.hard`, `.hard-lg`, hover `.hard-hover`).
- Dotted paper background (`.dots-bg`) + faint `.grain` overlay (already on `<body>`).
- **Pixel labels** (`pixel` class) for kickers/badges/nav; `mono` for numbers.
- Terminal **`Window`** frames (colored header + coral/yellow/green dots) for panels.
- Marquee banners (`MarqueeBanner`), color-blocked tilted **FNF tiles**, rainbow stat "stickers", arcade rails (`HIGH SCORES` yellow, `HOT TOKENS` coral).
- Motion: `live-dot`, `slide-in`, `marquee`, `thinking`, `float`, `wiggle`.

**Reuse these components (don't reinvent):**
`components/ui/{Button,ButtonLink,Logo,TypeBadge,Window,Avatar}`, `components/feed/{PostCard,LiveFeed,TokenTicker,TokenGlyph,TopAgents,TradedTokens,Chat}`, `components/fnf/{FnfCard,FnfStrip,CreateFnfButton}`, `components/site/{Masthead,FooterBar,MarqueeBanner,HowItWorks}`, `components/agent/{CreateAgentForm}`.
Helpers in `lib/utils.ts`: `cn`, `fmtUsd`, `fmtPct`, `fmtPrice`, `timeAgo`, `shortTx`, `slugify`, `gradientFromSeed`, `initials`.

> `Chat.tsx` and `HowItWorks.tsx` exist but are **not on the home page** right now (home uses the `LiveFeed` window). They're available if a page wants them.

---

## 3. Data you can read (contract — READ-ONLY for you)

The backend window owns the data layer. **Call these getters; do not change their signatures or edit the files that define them.** If you need new data/shape, leave a request in §7 / ping the coordinator — don't refactor the store yourself.

From `lib/data/store.ts` (server components only):
`getTokens()`, `getFnfs()`, `getFnfBySlug(slug)`, `getFnfById(id)`, `getAgents()`, `getAgentById(id)`, `getAgentsByFnf(fnfId)`, `getFeed(limit)`, `getFnfFeed(fnfId, limit)`, `getAgentPosts(agentId, limit)`, `feedClientProps(scopeFnfId?)`.

Types in `lib/types.ts`: `Token, Fnf, Agent, Post, Trade, FeedItem, PostType, TradeSide`. **Treat `lib/types.ts` as shared/frozen** — if a field must change, coordinate first (both windows import it).

Client live components (`LiveFeed`, `Chat`) take `feedClientProps()` output: `{ genAgents, genTokens, agentDir, fnfDir }`. Reuse that pattern for any new live UI.

APIs (backend-owned, you may `fetch` them): `POST /api/agents`, `POST /api/fnfs`, `GET /api/models`, `GET|POST /api/cron/tick`.

---

## 4. OWNERSHIP MAP — stay in your lane ⚠️

Same working tree, no locks. Editing a file the other window is editing **will clobber**. Strict zones:

**YOU (frontend) own — edit freely:**
- `components/**` (all UI components)
- `app/globals.css` (design tokens/styles)
- `app/**/page.tsx` and `app/**/layout.tsx` **except** anything under `app/api/**`
- `app/not-found.tsx`, page-level metadata
- `public/**`
- New UI-only files under `components/**` or `app/**`

**BACKEND (other window) owns — DO NOT edit:**
- `lib/data/**` (store, seed, generator), `lib/types.ts` (shared/frozen — coordinate), `lib/agent-runtime.ts`, `lib/openrouter.ts`
- `lib/market/**` (BLOCK-01 integration, incoming), `lib/supabase/**`
- `app/api/**`, `supabase/**`, `vercel.json`, `.env*`, `blocks/**`
- `package.json` / lockfile (ask before adding deps), Railway/deploy

**Shared — announce before editing:** `lib/utils.ts` (add-only; don't rename existing), `lib/types.ts` (frozen).

If a task needs you to cross into backend files, **stop and hand it to the coordinator** instead.

---

## 5. Frontend backlog (do these, in this order)

The home page + core components are done in the locked style. The **inner pages are the gap** — bring them fully up to the arcade look, then add features.

1. **Create-agent page** `app/agents/new/page.tsx` + `components/agent/CreateAgentForm.tsx` — restyle to arcade (2px ink borders, `pixel` labels, hard shadows, colored preset chips, arcade live-preview card). Keep the form logic + POST intact.
2. **Agent profile** `app/agent/[id]/page.tsx` — arcade portfolio panel (paper equity / PnL / return as bordered stat tiles), persona in a `Window`, activity via `PostCard`. Add an empty-state that has personality.
3. **FNF detail** `app/fnf/[slug]/page.tsx` — arcade header (color-blocked like `FnfCard`), roster list in a bordered panel, scoped `LiveFeed` in a `Window`, `Join this FNF` CTA.
4. **FNFs index** `app/fnfs/page.tsx` — grid of `FnfCard` tiles (already arcade) + `CreateFnfButton` (restyle its modal to arcade) — verify spacing/mobile.
5. **Agents index** `app/agents/page.tsx` — arcade agent cards grid; add sort/filter chips (client) if easy.
6. **/feed page** `app/feed/page.tsx` — make it the full-screen board (3-col: `TopAgents` | `LiveFeed` `Window` | `TradedTokens`) matching home.
7. **Polish:** mobile layouts, empty/loading states, focus states, make the masthead search do a simple client-side filter (agents/tokens/fnfs) instead of being fake.
8. **Nice-to-haves:** token detail popover, agent "chat thread" view (reuse `Chat`), FNF leaderboard, share/OG images.

Every new screen must look like it belongs to the home page — same borders, shadows, pixel labels, colors.

---

## 6. Conventions

- Server components by default; add `"use client"` only for interactivity (see `LiveFeed`/`Chat`/`CreateAgentForm`).
- Colors/spacing via Tailwind tokens + the vars in `globals.css`. Don't hardcode hexes in components except a token/FNF's own `color` field.
- Reference files as `path:line`. Match the existing code's density and idioms.
- Keep it accessible: real `<button>`/`<a>`, `alt`/`aria` where needed, visible focus.
- Build must stay green: `npm run build` (Turbopack). Fix type errors before finishing.

---

## 7. Two-window hygiene (important)

- **Never edit a backend-owned file (§4).** If you think you must, write the request here under "Requests to backend:" and stop.
- **Don't deploy** (`railway ...`) — backend owns it. Don't add npm deps without asking (package.json is shared).
- Don't run a second dev server on :3000 — use `-p 3001` or just screenshot.
- Commit often if git is initialized (backend may `git init`); keep commits to your zone. Commit message footer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- When backend lands BLOCK-01 (`lib/market/`) or BLOCK-02 (paper engine), **nothing changes for you** — the store getters keep the same shape; real numbers just replace seed numbers. Don't wire adapters yourself.

**Requests to backend:** (add lines here as you find missing data)
- _(none yet)_

**Requests FROM backend → frontend (please action):**
- Render `<PoweredByOpenRouter />` (new: `components/site/PoweredByOpenRouter.tsx`) in the footer and/or side rail — it's the marketing attribution badge, built in the arcade style with theme tokens. OpenRouter integration is now live-verified (`usedOpenRouter: true`).

---

## 8. Verify before you finish

1. `npm run build` clean.
2. Screenshot each page you touched at desktop **and** mobile widths; confirm it matches the arcade look.
3. No console errors. Links work. Forms still POST.
4. You did not edit anything in §4's backend list.
