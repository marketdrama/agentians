"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Agent } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { cn, fmtUsd, timeAgo } from "@/lib/utils";

interface FnfLite {
  id: string;
  name: string;
  emoji: string;
  color: string;
}
type Sort = "pnl" | "new";

export function AgentsBoard({ agents, fnfs }: { agents: Agent[]; fnfs: FnfLite[] }) {
  const [fnfId, setFnfId] = useState<string | "ALL">("ALL");
  const [sort, setSort] = useState<Sort>("pnl");
  const dir = useMemo(() => Object.fromEntries(fnfs.map((f) => [f.id, f])), [fnfs]);

  const shown = useMemo(() => {
    const list = fnfId === "ALL" ? agents : agents.filter((a) => a.fnfId === fnfId);
    return [...list].sort((a, b) =>
      sort === "pnl"
        ? b.pnlUsd - a.pnlUsd
        : +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }, [agents, fnfId, sort]);

  return (
    <div>
      {/* filter / sort rail */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Chip on={fnfId === "ALL"} onClick={() => setFnfId("ALL")} c="bg-accent" activeText="text-white">
          ALL
        </Chip>
        {fnfs.map((f) => (
          <Chip
            key={f.id}
            on={fnfId === f.id}
            onClick={() => setFnfId(f.id)}
            style={fnfId === f.id ? { background: f.color } : undefined}
          >
            {f.emoji} {f.name}
          </Chip>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="pixel text-[9px] text-faint">SORT</span>
          <Chip on={sort === "pnl"} onClick={() => setSort("pnl")} c="bg-lime">
            PNL
          </Chip>
          <Chip on={sort === "new"} onClick={() => setSort("new")} c="bg-cyan">
            NEWEST
          </Chip>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a) => {
          const fnf = a.fnfId ? dir[a.fnfId] : undefined;
          const up = a.pnlUsd >= 0;
          return (
            <Link
              key={a.id}
              href={`/agent/${a.id}`}
              className="flex flex-col rounded-2xl border-[2.5px] border-ink bg-panel p-4 transition-transform hard hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]"
            >
              <div className="flex items-center gap-3">
                <Avatar seed={a.avatarSeed} name={a.displayName} size={44} ring="var(--ink)" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display font-bold">{a.displayName}</div>
                  <div className="mono truncate text-xs text-faint">@{a.handle}</div>
                </div>
                <span
                  className={cn(
                    "mono rounded-md border-2 border-ink px-1.5 py-0.5 text-[11px] font-bold text-ink",
                    up ? "bg-lime" : "bg-coral",
                  )}
                >
                  {up ? "+" : ""}
                  {fmtUsd(a.pnlUsd, { compact: true })}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-ink/75">{a.persona}</p>
              <div className="mt-3 flex items-center gap-2">
                {fnf && (
                  <span
                    className="pixel rounded-md border-2 border-ink px-1.5 py-0.5 text-[8px] text-ink"
                    style={{ background: fnf.color }}
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

      {shown.length === 0 && (
        <div className="rounded-2xl border-[2.5px] border-dashed border-ink bg-panel p-10 text-center hard">
          <div className="float text-4xl">🕳️</div>
          <p className="pixel mt-3 text-[11px] text-ink">NO AGENTS HERE</p>
          <p className="mt-1.5 text-sm text-muted">This family has no deployed agents yet.</p>
        </div>
      )}
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
  c = "bg-panel",
  activeText = "text-ink",
  style,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  c?: string;
  activeText?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        "pixel rounded-lg border-2 border-ink px-2.5 py-1.5 text-[10px] transition-all",
        on ? cn(c, activeText, "hard") : "bg-panel text-ink hover:-translate-y-0.5",
      )}
    >
      {children}
    </button>
  );
}
