"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Meter } from "@/components/ui/Meter";
import { cn, fmtUsd } from "@/lib/utils";

export interface BattleAgent {
  id: string;
  displayName: string;
  handle: string;
  avatarSeed: string;
  model: string;
  persona: string;
  pnlUsd: number;
  paperBalanceUsd: number;
  fnfName: string | null;
  fnfColor: string | null;
}

function returnPct(a: BattleAgent) {
  return (a.pnlUsd / a.paperBalanceUsd) * 100;
}

export function BattleArena({ agents }: { agents: BattleAgent[] }) {
  const [aId, setAId] = useState(agents[0]?.id ?? "");
  const [bId, setBId] = useState(agents[1]?.id ?? agents[0]?.id ?? "");

  const a = agents.find((x) => x.id === aId) ?? agents[0];
  const b = agents.find((x) => x.id === bId) ?? agents[1] ?? agents[0];

  const maxAbsPnl = useMemo(
    () => Math.max(1, Math.abs(a?.pnlUsd ?? 0), Math.abs(b?.pnlUsd ?? 0)),
    [a, b],
  );

  if (!a || !b) {
    return (
      <div className="rounded-2xl border-[2.5px] border-dashed border-ink bg-panel p-10 text-center hard">
        <div className="text-4xl">🥊</div>
        <p className="pixel mt-3 text-[11px] text-ink">NEED TWO FIGHTERS</p>
        <p className="mt-1.5 text-sm text-muted">Deploy more agents to run a battle.</p>
      </div>
    );
  }

  const rA = returnPct(a);
  const rB = returnPct(b);
  const winner = rA === rB ? null : rA > rB ? "a" : "b";

  function swap() {
    setAId(bId);
    setBId(aId);
  }

  return (
    <div>
      <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Fighter
          agent={a}
          onPick={setAId}
          agents={agents}
          maxAbsPnl={maxAbsPnl}
          win={winner === "a"}
          accent="bg-cyan"
        />

        <div className="flex items-center justify-center sm:flex-col sm:gap-3">
          <span className="pixel grid h-14 w-14 place-items-center rounded-full border-[2.5px] border-ink bg-yellow text-[13px] text-ink hard-lg wiggle">
            VS
          </span>
          <button
            type="button"
            onClick={swap}
            className="pixel ml-3 rounded-lg border-2 border-ink bg-panel px-2.5 py-1.5 text-[9px] text-ink hard-hover sm:ml-0"
          >
            ⇄ SWAP
          </button>
        </div>

        <Fighter
          agent={b}
          onPick={setBId}
          agents={agents}
          maxAbsPnl={maxAbsPnl}
          win={winner === "b"}
          accent="bg-pink"
        />
      </div>

      <div className="mt-4 rounded-xl border-2 border-ink bg-panel p-4 text-center hard">
        {winner === null ? (
          <p className="pixel text-[11px] text-ink">DEAD HEAT — pick different agents</p>
        ) : (
          <p className="text-sm text-ink">
            <span className="pixel text-[11px]">WINNER:</span>{" "}
            <span className="font-display text-lg font-bold text-accent">
              {(winner === "a" ? a : b).displayName}
            </span>{" "}
            <span className="text-muted">
              by {Math.abs(rA - rB).toFixed(1)} points of paper return.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function Fighter({
  agent,
  agents,
  onPick,
  maxAbsPnl,
  win,
  accent,
}: {
  agent: BattleAgent;
  agents: BattleAgent[];
  onPick: (id: string) => void;
  maxAbsPnl: number;
  win: boolean;
  accent: string;
}) {
  const r = returnPct(agent);
  const up = agent.pnlUsd >= 0;
  const equity = agent.paperBalanceUsd + agent.pnlUsd;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border-[2.5px] border-ink bg-panel transition-transform hard-lg",
        win && "-translate-y-1 ring-4 ring-lime",
      )}
    >
      <div className={cn("flex items-center gap-2 border-b-[2.5px] border-ink px-3 py-2", accent)}>
        <span className="pixel text-[10px] text-ink">{win ? "👑 LEADER" : "FIGHTER"}</span>
        <select
          value={agent.id}
          onChange={(e) => onPick(e.target.value)}
          aria-label="Pick agent"
          className="pixel ml-auto max-w-[130px] cursor-pointer truncate rounded border-2 border-ink bg-panel px-1.5 py-1 text-[8px] text-ink focus:outline-none"
        >
          {agents.map((x) => (
            <option key={x.id} value={x.id}>
              {x.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/agent/${agent.id}`} className="flex items-center gap-3 hover:opacity-90">
          <Avatar seed={agent.avatarSeed} name={agent.displayName} size={52} ring="var(--ink)" />
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-bold text-ink">{agent.displayName}</div>
            <div className="mono truncate text-xs text-faint">@{agent.handle}</div>
          </div>
        </Link>

        {agent.fnfName && (
          <span
            className="pixel mt-3 w-fit rounded-md border-2 border-ink px-2 py-0.5 text-[8px] text-ink"
            style={{ background: agent.fnfColor ?? undefined }}
          >
            {agent.fnfName}
          </span>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border-2 border-ink bg-paper-2 p-2 text-center">
            <div className="mono text-sm font-bold text-ink">{fmtUsd(equity, { compact: true })}</div>
            <div className="pixel mt-1 text-[7px] text-muted">EQUITY</div>
          </div>
          <div className="rounded-lg border-2 border-ink bg-paper-2 p-2 text-center">
            <div className={cn("mono text-sm font-bold", up ? "text-buy" : "text-sell")}>
              {up ? "+" : ""}
              {r.toFixed(1)}%
            </div>
            <div className="pixel mt-1 text-[7px] text-muted">RETURN</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Meter
            label="RETURN"
            right={`${up ? "+" : ""}${r.toFixed(0)}%`}
            value={Math.max(0, Math.min(1, (r + 50) / 100))}
            color={up ? "bg-buy" : "bg-sell"}
          />
          <Meter
            label="PNL WEIGHT"
            right={`${agent.pnlUsd >= 0 ? "+" : ""}${fmtUsd(agent.pnlUsd, { compact: true })}`}
            value={Math.abs(agent.pnlUsd) / maxAbsPnl}
            color={up ? "bg-lime" : "bg-coral"}
          />
        </div>

        <p className="mt-4 line-clamp-3 border-t-2 border-dashed border-border-soft pt-3 text-xs leading-relaxed text-ink/75">
          {agent.persona}
        </p>
      </div>
    </div>
  );
}
