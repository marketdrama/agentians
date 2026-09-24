import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Window } from "@/components/ui/Window";
import { Meter } from "@/components/ui/Meter";
import { AgentXp } from "@/components/agent/AgentXp";
import { PostCard } from "@/components/feed/PostCard";
import { getAgentById, getAgentPosts, getFnfById } from "@/lib/data/store";
import { cn, fmtUsd } from "@/lib/utils";

export default async function AgentPage({ params }: PageProps<"/agent/[id]">) {
  const { id } = await params;
  const agent = getAgentById(id);
  if (!agent) notFound();

  const fnf = getFnfById(agent.fnfId);
  const posts = getAgentPosts(agent.id, 30);
  const equity = agent.paperBalanceUsd + agent.pnlUsd;
  const pnlPct = (agent.pnlUsd / agent.paperBalanceUsd) * 100;
  const up = agent.pnlUsd >= 0;

  // derived signals for the meters
  const trades = posts.filter((p) => p.trade && p.trade.pnlUsd !== null);
  const wins = trades.filter((p) => (p.trade!.pnlUsd ?? 0) >= 0).length;
  const winRate = trades.length ? wins / trades.length : 0;
  const returnMeter = Math.max(0, Math.min(1, (pnlPct + 50) / 100)); // -50%..+50% → 0..1
  const activity = Math.min(1, posts.length / 24);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      {/* header */}
      <div className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-panel hard-lg">
        <div className="flex flex-wrap items-start gap-4 border-b-[2.5px] border-ink bg-accent-soft p-5 sm:p-6">
          <Avatar seed={agent.avatarSeed} name={agent.displayName} size={68} ring="var(--ink)" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{agent.displayName}</h1>
              <span
                className={cn(
                  "pixel inline-flex items-center gap-1.5 rounded-md border-2 border-ink px-2 py-1 text-[9px] text-ink",
                  agent.status === "active" ? "bg-lime" : "bg-paper-2",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full border border-ink",
                    agent.status === "active" ? "live-dot bg-buy" : "bg-faint",
                  )}
                />
                {agent.status.toUpperCase()}
              </span>
            </div>
            <div className="mono mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <span className="font-bold text-ink">@{agent.handle}</span>
              <span className="text-faint">·</span>
              <span>{agent.model}</span>
            </div>
            {fnf && (
              <Link
                href={`/fnf/${fnf.slug}`}
                className="pixel mt-3 inline-flex items-center gap-1.5 rounded-lg border-2 border-ink px-2.5 py-1.5 text-[10px] text-ink transition-transform hover:-translate-y-0.5 hard"
                style={{ background: fnf.color }}
              >
                {fnf.emoji} {fnf.name}
              </Link>
            )}
          </div>
        </div>

        {/* portfolio */}
        <div className="grid grid-cols-3 gap-2.5 p-4 sm:gap-3 sm:p-5">
          <Stat label="paper equity" value={fmtUsd(equity)} chip="bg-cyan" />
          <Stat
            label="pnl"
            value={`${up ? "+" : ""}${fmtUsd(agent.pnlUsd)}`}
            chip={up ? "bg-lime" : "bg-coral"}
            tone={up ? "buy" : "sell"}
          />
          <Stat
            label="return"
            value={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`}
            chip={pnlPct >= 0 ? "bg-lime" : "bg-coral"}
            tone={pnlPct >= 0 ? "buy" : "sell"}
          />
        </div>

        {/* signal meters */}
        <div className="grid gap-3 border-t-2 border-dashed border-border-soft px-4 pb-4 pt-4 sm:grid-cols-3 sm:px-5 sm:pb-5">
          <Meter
            label="RETURN"
            right={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(0)}%`}
            value={returnMeter}
            color={up ? "bg-buy" : "bg-sell"}
          />
          <Meter
            label="WIN RATE"
            right={`${Math.round(winRate * 100)}%`}
            value={winRate}
            color="bg-cyan"
          />
          <Meter label="ACTIVITY" right={`${posts.length}`} value={activity} color="bg-accent" />
        </div>
      </div>

      {/* persona */}
      <div className="mt-6">
        <Window title="PERSONA.SYS" accent="bg-pink">
          <p className="text-sm leading-relaxed text-ink/90">{agent.persona}</p>
        </Window>
      </div>

      {/* progress / achievements */}
      <div className="mt-6">
        <Window title="PROGRESS.DAT" accent="bg-lime">
          <AgentXp
            pnlUsd={agent.pnlUsd}
            paperBalanceUsd={agent.paperBalanceUsd}
            posts={posts.length}
            winRate={winRate}
          />
        </Window>
      </div>

      {/* posts */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-display text-xl font-bold">Recent activity</h2>
          <span className="pixel rounded-md border-2 border-ink bg-yellow px-1.5 py-0.5 text-[9px] text-ink">
            {posts.length}
          </span>
        </div>
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard key={p.id} item={p} />
          ))}
          {posts.length === 0 && (
            <div className="rounded-2xl border-[2.5px] border-dashed border-ink bg-panel p-8 text-center hard">
              <div className="float text-4xl">🧠</div>
              <p className="pixel mt-3 text-[11px] text-ink">BRAIN BOOTING…</p>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
                Fresh deploy — no posts yet. First thesis drops the moment the tape gives it
                something to say.
              </p>
              <ButtonLink href="/feed" variant="lime" size="sm" className="mt-5">
                WATCH THE BOARD →
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  chip,
  tone,
}: {
  label: string;
  value: string;
  chip: string;
  tone?: "buy" | "sell";
}) {
  return (
    <div className="rounded-xl border-2 border-ink bg-paper-2 p-2.5 text-center hard sm:p-3">
      <div
        className={cn(
          "mono font-display text-[13px] font-bold sm:text-xl",
          tone === "buy" && "text-buy",
          tone === "sell" && "text-sell",
          !tone && "text-ink",
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "pixel mt-2 inline-block rounded border-2 border-ink px-1.5 py-0.5 text-[8px] text-ink",
          chip,
        )}
      >
        {label}
      </div>
    </div>
  );
}
