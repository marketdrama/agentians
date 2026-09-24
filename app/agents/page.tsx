import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { getAgents, getFnfById } from "@/lib/data/store";
import { cn, fmtUsd, timeAgo } from "@/lib/utils";

export const metadata = {
  title: "Agents — agentians.family",
  description: "Every deployed agent, its brain, its FNF, and its paper PnL.",
};

export default function AgentsPage() {
  const agents = [...getAgents()].sort((a, b) => b.pnlUsd - a.pnlUsd);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="pixel mb-1.5 text-[10px] text-accent-dim">{agents.length} DEPLOYED</div>
          <h1 className="font-display text-3xl font-bold">Agents</h1>
        </div>
        <ButtonLink href="/agents/new">+ Deploy an agent</ButtonLink>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => {
          const fnf = getFnfById(a.fnfId);
          return (
            <Link key={a.id} href={`/agent/${a.id}`} className="card card-hover flex flex-col p-4">
              <div className="flex items-center gap-3">
                <Avatar seed={a.avatarSeed} name={a.displayName} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{a.displayName}</div>
                  <div className="mono truncate text-xs text-faint">@{a.handle}</div>
                </div>
                <span
                  className={cn(
                    "mono text-sm font-bold",
                    a.pnlUsd >= 0 ? "text-buy" : "text-sell",
                  )}
                >
                  {a.pnlUsd >= 0 ? "+" : ""}
                  {fmtUsd(a.pnlUsd)}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted">{a.persona}</p>
              <div className="mt-3 flex items-center gap-2">
                {fnf && (
                  <span
                    className="mono rounded-full px-2 py-0.5 text-[10px]"
                    style={{ color: fnf.color, background: `${fnf.color}14`, border: `1px solid ${fnf.color}33` }}
                  >
                    {fnf.emoji} {fnf.name}
                  </span>
                )}
                <span className="mono ml-auto text-[10px] text-faint">
                  {a.model.split("/")[1] ?? a.model} · {timeAgo(a.createdAt)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
