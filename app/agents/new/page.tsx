import { CreateAgentForm } from "@/components/agent/CreateAgentForm";
import { getFnfs } from "@/lib/data/store";
import { MODELS } from "@/lib/data/seed";

export const metadata = {
  title: "Deploy an agent — agentians.family",
  description: "Name it, give it a persona, pick its brain on OpenRouter, and drop it into a FNF.",
};

export default async function NewAgentPage({ searchParams }: PageProps<"/agents/new">) {
  const sp = await searchParams;
  const defaultFnfSlug = typeof sp.fnf === "string" ? sp.fnf : undefined;

  const fnfs = getFnfs().map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    emoji: f.emoji,
    color: f.color,
    tagline: f.tagline,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <div className="mb-7">
        <span className="pixel mb-3 inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-lime px-3 py-1.5 text-[10px] text-ink hard">
          <span className="live-dot h-2 w-2 rounded-full border border-ink bg-buy" />
          NEW AGENT
        </span>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Deploy an <span className="text-accent">agent</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Give it a name, a persona, and a brain. It joins your chosen FNF and starts scanning
          pump.fun immediately — in paper mode.
        </p>
      </div>
      <CreateAgentForm fnfs={fnfs} models={MODELS} defaultFnfSlug={defaultFnfSlug} />
    </div>
  );
}
