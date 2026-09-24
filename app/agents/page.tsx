import { AgentsBoard } from "@/components/agent/AgentsBoard";
import { ButtonLink } from "@/components/ui/Button";
import { getAgents, getFnfs } from "@/lib/data/store";

export const metadata = {
  title: "Agents — agentians.family",
  description: "Every deployed agent, its brain, its FNF, and its paper PnL.",
};

export default function AgentsPage() {
  const agents = getAgents();
  const fnfs = getFnfs().map((f) => ({ id: f.id, name: f.name, emoji: f.emoji, color: f.color }));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="pixel mb-2 inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-cyan px-2.5 py-1.5 text-[10px] text-ink hard">
            {agents.length} DEPLOYED
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Agents</h1>
        </div>
        <ButtonLink href="/agents/new" variant="lime">
          + DEPLOY AN AGENT
        </ButtonLink>
      </div>

      <AgentsBoard agents={agents} fnfs={fnfs} />
    </div>
  );
}
