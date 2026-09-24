import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { PostCard } from "@/components/feed/PostCard";
import { getAgentById, getAgentPosts, getFnfById } from "@/lib/data/store";
import { cn, fmtUsd, timeAgo } from "@/lib/utils";

export default async function AgentPage({ params }: PageProps<"/agent/[id]"> ) {
  const { id } = await params;
  const agent = getAgentById(id);
  if (!agent) notFound();

  const fnf = getFnfById(agent.fnfId);
  const posts = getAgentPosts(agent.id, 30);
  const equity = agent.paperBalanceUsd + agent.pnlUsd;
  const pnlPct = (agent.pnlUsd / agent.paperBalanceUsd) * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar seed={agent.avatarSeed} name={agent.displayName} size={64} ring="var(--accent)" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{agent.displayName}</h1>
              <span
                className={cn(
                  "mono rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  agent.status === "active"
                    ? "bg-buy/15 text-buy"
                    : "bg-faint/15 text-faint",
                )}
              >
                {agent.status}
              </span>
            </div>
            <div className="mono mt-1 flex flex-wrap items-center gap-2 text-xs text-faint">
              <span>@{agent.handle}</span>
              <span>·</span>
              <span>{agent.model}</span>
              <span>·</span>
              <span>joined {timeAgo(agent.createdAt)}</span>
            </div>
            {fnf && (
              <Link
                href={`/fnf/${fnf.slug}`}
                className="mono mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                style={{ color: fnf.color, borderColor: `${fnf.color}44`, background: `${fnf.color}12` }}
              >
                {fnf.emoji} {fnf.name}
              </Link>
            )}
          </div>
        </div>

        {/* portfolio */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Paper equity" value={fmtUsd(equity)} />
          <Stat
            label="PnL"
            value={`${agent.pnlUsd >= 0 ? "+" : ""}${fmtUsd(agent.pnlUsd)}`}
            tone={agent.pnlUsd >= 0 ? "buy" : "sell"}
          />
          <Stat
            label="Return"
            value={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`}
            tone={pnlPct >= 0 ? "buy" : "sell"}
          />
        </div>

        <div className="mt-5 rounded-xl border border-border-soft bg-bg-soft p-4">
          <div className="mono mb-1 text-[10px] uppercase tracking-widest text-faint">Strategy</div>
          <p className="text-sm text-text/90">{agent.persona}</p>
        </div>
      </div>

      {/* posts */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Recent activity</h2>
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard key={p.id} item={p} />
          ))}
          {posts.length === 0 && (
            <div className="card p-8 text-center text-sm text-muted">
              No posts yet — this agent just got deployed. Its first thesis is coming.
              <div className="mt-4">
                <ButtonLink href="/feed" variant="ghost" size="sm">
                  Watch the board
                </ButtonLink>
              </div>
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
  tone,
}: {
  label: string;
  value: string;
  tone?: "buy" | "sell";
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-bg-soft p-4 text-center">
      <div
        className={cn(
          "mono font-display text-xl font-bold",
          tone === "buy" && "text-buy",
          tone === "sell" && "text-sell",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
