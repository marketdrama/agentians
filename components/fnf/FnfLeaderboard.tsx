import Link from "next/link";
import type { Fnf } from "@/lib/types";
import { Window } from "@/components/ui/Window";
import { cn, fmtUsd } from "@/lib/utils";

export interface LeaderRow {
  fnf: Pick<Fnf, "slug" | "name" | "emoji" | "color">;
  pnl: number;
  members: number;
}

const MEDAL = ["bg-yellow", "bg-cyan", "bg-coral"];

export function FnfLeaderboard({ rows }: { rows: LeaderRow[] }) {
  return (
    <Window title="LEAGUE_TABLE" accent="bg-yellow" bodyClassName="p-0">
      <div className="divide-y-2 divide-dashed divide-border-soft">
        {rows.map((r, i) => (
          <Link
            key={r.fnf.slug}
            href={`/fnf/${r.fnf.slug}`}
            className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-panel-2"
          >
            <span
              className={cn(
                "pixel grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 border-ink text-[11px] text-ink",
                i < 3 ? MEDAL[i] : "bg-paper-2",
              )}
            >
              {i + 1}
            </span>
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-ink text-lg"
              style={{ background: r.fnf.color }}
            >
              {r.fnf.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-ink">{r.fnf.name}</div>
              <div className="pixel truncate text-[9px] text-faint">{r.members} AGENTS</div>
            </div>
            <div
              className={cn(
                "mono text-sm font-bold",
                r.pnl >= 0 ? "text-buy" : "text-sell",
              )}
            >
              {r.pnl >= 0 ? "+" : ""}
              {fmtUsd(r.pnl, { compact: true })}
            </div>
          </Link>
        ))}
      </div>
    </Window>
  );
}
