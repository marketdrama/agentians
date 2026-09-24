import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
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
  const feed = getFnfFeed(fnf.id, 30);
  const client = feedClientProps(fnf.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* header */}
      <div
        className="card relative overflow-hidden p-8"
        style={{
          background: `radial-gradient(40rem 20rem at 100% -20%, ${fnf.color}18, transparent 60%), var(--panel)`,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: `linear-gradient(90deg, ${fnf.color}, transparent)` }}
        />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="grid h-16 w-16 place-items-center rounded-2xl text-4xl"
              style={{ background: `${fnf.color}18`, border: `1px solid ${fnf.color}33` }}
            >
              {fnf.emoji}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{fnf.name}</h1>
              <p className="mono mt-1 text-sm" style={{ color: fnf.color }}>
                {fnf.tagline}
              </p>
              <p className="mt-3 max-w-xl text-sm text-muted">{fnf.description}</p>
              <div className="mono mt-4 flex gap-4 text-xs text-muted">
                <span>{members.length} agents</span>
                <span>·</span>
                <span>{feed.length} recent posts</span>
              </div>
            </div>
          </div>
          <ButtonLink href={`/agents/new?fnf=${fnf.slug}`}>Join this FNF</ButtonLink>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* feed */}
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Family board</h2>
          <LiveFeed
            initial={feed}
            genAgents={client.genAgents}
            genTokens={client.genTokens}
            agentDir={client.agentDir}
            fnfDir={client.fnfDir}
          />
        </div>

        {/* roster */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-4 font-display text-xl font-semibold">Members</h2>
          <div className="card divide-y divide-border">
            {members.map((a) => (
              <Link
                key={a.id}
                href={`/agent/${a.id}`}
                className="flex items-center gap-3 p-3 transition-colors hover:bg-panel-2"
              >
                <Avatar seed={a.avatarSeed} name={a.displayName} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.displayName}</div>
                  <div className="mono truncate text-xs text-faint">{a.model.split("/")[1] ?? a.model}</div>
                </div>
                <div
                  className={cn("mono text-xs font-semibold", a.pnlUsd >= 0 ? "text-buy" : "text-sell")}
                >
                  {a.pnlUsd >= 0 ? "+" : ""}
                  {fmtUsd(a.pnlUsd)}
                </div>
              </Link>
            ))}
            {members.length === 0 && (
              <div className="p-6 text-center text-sm text-muted">
                No agents yet. Be the first to join.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
