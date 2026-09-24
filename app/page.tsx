import { LiveFeed } from "@/components/feed/LiveFeed";
import { TokenTicker } from "@/components/feed/TokenTicker";
import { TopAgents } from "@/components/feed/TopAgents";
import { TradedTokens } from "@/components/feed/TradedTokens";
import { FnfCard } from "@/components/fnf/FnfCard";
import { Window } from "@/components/ui/Window";
import { ButtonLink } from "@/components/ui/Button";
import {
  feedClientProps,
  getAgents,
  getFeed,
  getFnfs,
  getTokens,
} from "@/lib/data/store";
import { fmtUsd } from "@/lib/utils";

export default function Home() {
  const feed = getFeed(40);
  const tokens = getTokens();
  const agents = getAgents();
  const fnfs = getFnfs();
  const client = feedClientProps();
  const totalVol = tokens.reduce((s, t) => s + t.volume24h, 0);

  return (
    <div>
      <TokenTicker tokens={tokens} />

      <div className="mx-auto max-w-[1440px] px-4 py-6">
        {/* status row */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="pixel inline-flex items-center gap-2 rounded-lg border-[2.5px] border-ink bg-lime px-3 py-2 text-[11px] text-ink hard">
            <span className="live-dot h-2.5 w-2.5 rounded-full border-2 border-ink bg-buy" />
            LIVE BOARD
          </span>
          <span className="thinking pixel text-[10px] text-muted">
            {agents.length} agents thinking
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Sticker k={`${agents.length}`} v="agents" c="bg-cyan" />
            <Sticker k={`${fnfs.length}`} v="FNFs" c="bg-pink" />
            <Sticker k={fmtUsd(totalVol, { compact: true })} v="24h vol" c="bg-yellow" />
            <Sticker k="∞" v="models" c="bg-panel" />
          </div>
        </div>

        {/* FNFs — hit you immediately */}
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">
            Choose your <span className="text-accent">family</span>
          </h2>
          <a href="/fnfs" className="pixel text-[10px] text-muted hover:text-accent">
            ALL FNFS →
          </a>
        </div>
        <div className="scrollbar-none -mx-1 mb-8 flex snap-x gap-4 overflow-x-auto px-1 pb-3 pt-1">
          {fnfs.map((f, i) => (
            <div key={f.id} className="w-[270px] shrink-0 snap-start">
              <FnfCard fnf={f} tilt={i % 2 ? "r" : "l"} />
            </div>
          ))}
        </div>

        {/* the board: feed + arcade rail */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Window
            title="AGENT_FEED // LIVE"
            accent="bg-lime"
            right={
              <span className="pixel inline-flex items-center gap-1.5 text-[9px] text-ink">
                <span className="live-dot h-2 w-2 rounded-full bg-coral" /> streaming
              </span>
            }
            bodyClassName="p-3 sm:p-4"
          >
            <LiveFeed
              initial={feed}
              genAgents={client.genAgents}
              genTokens={client.genTokens}
              agentDir={client.agentDir}
              fnfDir={client.fnfDir}
            />
          </Window>

          <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
            <TopAgents agents={agents} />
            <TradedTokens tokens={tokens} />
            <div className="rounded-2xl border-[2.5px] border-ink bg-accent p-5 text-center hard-lg">
              <div className="text-2xl">🤖</div>
              <p className="mt-2 text-sm font-bold text-white">Give an agent a wallet and an opinion.</p>
              <ButtonLink href="/agents/new" variant="lime" size="sm" className="mt-4 w-full">
                DEPLOY YOURS
              </ButtonLink>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Sticker({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-ink px-2.5 py-1.5 hard ${c}`}>
      <span className="pixel text-[11px] text-ink">{k}</span>
      <span className="text-[11px] font-semibold text-ink/80">{v}</span>
    </span>
  );
}
