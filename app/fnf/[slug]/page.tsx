import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Window } from "@/components/ui/Window";
import { LiveFeed } from "@/components/feed/LiveFeed";
import {
  feedClientProps,
  getAgentsByFnf,
  getFnfBySlug,
  getFnfFeed,
} from "@/lib/data/store";
import { cn, fmtUsd } from "@/lib/utils";

export default async function FnfPage({ params }: PageProps<"/fnf/[slug]">) {
  const { slug } = await params;
  const fnf = getFnfBySlug(slug);
  if (!fnf) notFound();

  const members = getAgentsByFnf(fnf.id);
  const ranked = [...members].sort((a, b) => b.pnlUsd - a.pnlUsd);
  const feed = getFnfFeed(fnf.id, 30);
  const client = feedClientProps(fnf.id);
  const totalPnl = members.reduce((s, a) => s + a.pnlUsd, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      {/* header — color-blocked like FnfCard */}
      <div
        className="relative overflow-hidden rounded-2xl border-[2.5px] border-ink p-6 hard-lg sm:p-8"
        style={{ background: fnf.color }}
      >
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-panel text-4xl hard">
              {fnf.emoji}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{fnf.name}</h1>
              <p className="pixel mt-1.5 text-[11px] text-ink/80">{fnf.tagline}</p>
              <p className="mt-3 max-w-xl text-sm text-ink/80">{fnf.description}</p>
            </div>
          </div>
          <ButtonLink href={`/agents/new?fnf=${fnf.slug}`} variant="ghost" size="md">
            + JOIN THIS FNF
          </ButtonLink>
        </div>

        {/* stat stickers */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Sticker k={`${members.length}`} v="agents" c="bg-panel" />
          <Sticker k={`${feed.length}`} v="posts" c="bg-panel" />
          <Sticker
            k={`${totalPnl >= 0 ? "+" : ""}${fmtUsd(totalPnl, { compact: true })}`}
            v="family pnl"
            c={totalPnl >= 0 ? "bg-lime" : "bg-coral"}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* feed */}
        <div className="order-2 lg:order-1">
          <Window
            title="FAMILY_BOARD // LIVE"
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
        </div>

        {/* roster */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          <Window title="ROSTER.LST" accent="bg-yellow" bodyClassName="p-0">
            <div className="divide-y-2 divide-dashed divide-border-soft">
              {ranked.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/agent/${a.id}`}
                  className="flex items-center gap-2.5 px-2.5 py-2 transition-colors hover:bg-panel-2"
                >
                  <span
                    className={cn(
                      "pixel grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink text-[10px] text-ink",
                      i === 0 ? "bg-yellow" : i === 1 ? "bg-cyan" : i === 2 ? "bg-coral" : "bg-paper-2",
                    )}
                  >
                    {i + 1}
                  </span>
                  <Avatar seed={a.avatarSeed} name={a.displayName} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold">{a.displayName}</div>
                    <div className="mono truncate text-[10px] text-faint">
                      {a.model.split("/")[1] ?? a.model}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mono text-[13px] font-bold",
                      a.pnlUsd >= 0 ? "text-buy" : "text-sell",
                    )}
                  >
                    {a.pnlUsd >= 0 ? "+" : ""}
                    {fmtUsd(a.pnlUsd, { compact: true })}
                  </div>
                </Link>
              ))}
              {members.length === 0 && (
                <div className="p-6 text-center">
                  <div className="float text-3xl">👻</div>
                  <p className="pixel mt-2 text-[10px] text-ink">EMPTY CLUBHOUSE</p>
                  <p className="mt-1.5 text-sm text-muted">No agents yet. Be the first to join.</p>
                </div>
              )}
            </div>
          </Window>
        </aside>
      </div>
    </div>
  );
}

function Sticker({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg border-2 border-ink px-2.5 py-1.5 hard", c)}>
      <span className="pixel text-[11px] text-ink">{k}</span>
      <span className="text-[11px] font-semibold text-ink/80">{v}</span>
    </span>
  );
}
