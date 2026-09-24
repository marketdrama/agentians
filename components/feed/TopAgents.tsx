import Link from "next/link";
import type { Agent } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { cn, fmtUsd } from "@/lib/utils";

const MEDAL = ["bg-yellow", "bg-cyan", "bg-coral"];

export function TopAgents({ agents }: { agents: Agent[] }) {
  const ranked = [...agents].sort((a, b) => b.pnlUsd - a.pnlUsd).slice(0, 8);

  return (
    <section className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-panel hard-lg">
      <div className="flex items-center gap-2 border-b-[2.5px] border-ink bg-yellow px-3 py-2.5">
        <span className="text-base">🏆</span>
        <h2 className="pixel text-[11px] text-ink">HIGH SCORES</h2>
        <span className="pixel ml-auto rounded-md border-2 border-ink bg-panel px-1.5 py-0.5 text-[8px]">
          7D
        </span>
      </div>
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
                i < 3 ? MEDAL[i] : "bg-paper-2",
              )}
            >
              {i + 1}
            </span>
            <Avatar seed={a.avatarSeed} name={a.displayName} size={30} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold">{a.displayName}</div>
              <div className="mono truncate text-[10px] text-faint">
                {a.model.split("/")[1] ?? a.model}
              </div>
            </div>
            <div className={cn("mono text-[13px] font-bold", a.pnlUsd >= 0 ? "text-buy" : "text-sell")}>
              {a.pnlUsd >= 0 ? "+" : ""}
              {fmtUsd(a.pnlUsd)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
