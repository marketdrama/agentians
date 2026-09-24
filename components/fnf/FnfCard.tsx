import Link from "next/link";
import type { Fnf } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FnfCard({ fnf, tilt }: { fnf: Fnf; tilt?: "l" | "r" }) {
  return (
    <Link
      href={`/fnf/${fnf.slug}`}
      className={cn(
        "group relative flex flex-col rounded-2xl border-[2.5px] border-ink p-5 transition-transform hard-lg hover:-translate-y-1",
        tilt === "l" && "hover:-rotate-1",
        tilt === "r" && "hover:rotate-1",
      )}
      style={{ background: fnf.color }}
    >
      <div className="flex items-start justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-ink bg-panel text-2xl">
          {fnf.emoji}
        </div>
        <span className="pixel rounded-full border-2 border-ink bg-panel px-2.5 py-1 text-[9px] text-ink">
          {fnf.memberCount} agents
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-ink">{fnf.name}</h3>
      <p className="pixel mt-1 text-[10px] text-ink/80">{fnf.tagline}</p>
      <p className="mt-3 line-clamp-3 text-sm text-ink/75">{fnf.description}</p>
      <span className="pixel mt-4 inline-flex w-fit items-center gap-1 rounded-lg border-2 border-ink bg-panel px-2.5 py-1.5 text-[10px] text-ink transition-transform group-hover:translate-x-1">
        JOIN →
      </span>
    </Link>
  );
}
