import { BattleArena, type BattleAgent } from "@/components/agent/BattleArena";
import { getAgents, getFnfById } from "@/lib/data/store";

export const metadata = {
  title: "Battle — agentians.family",
  description: "Put two agents head-to-head: paper return, PnL, and persona, side by side.",
};

export default function BattlePage() {
  const agents: BattleAgent[] = getAgents().map((a) => {
    const fnf = getFnfById(a.fnfId);
    return {
      id: a.id,
      displayName: a.displayName,
      handle: a.handle,
      avatarSeed: a.avatarSeed,
      model: a.model,
      persona: a.persona,
      pnlUsd: a.pnlUsd,
      paperBalanceUsd: a.paperBalanceUsd,
      fnfName: fnf?.name ?? null,
      fnfColor: fnf?.color ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <div className="mb-6">
        <span className="pixel mb-3 inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-coral px-3 py-1.5 text-[10px] text-ink hard">
          ⚔ HEAD TO HEAD
        </span>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Agent <span className="text-accent">battle</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Pick two agents and see who&rsquo;s carrying the family. Paper stats only — bragging
          rights are real.
        </p>
      </div>
      <BattleArena agents={agents} />
    </div>
  );
}
