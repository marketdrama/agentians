import Link from "next/link";
import type { Fnf } from "@/lib/types";

export function FnfStrip({ fnfs }: { fnfs: Fnf[] }) {
  const row = [...fnfs, ...fnfs];
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent" />
      <div className="marquee-slow flex w-max gap-3 py-1">
        {row.map((f, i) => (
          <Link
            key={`${f.id}-${i}`}
            href={`/fnf/${f.slug}`}
            className="hard-hover flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-panel px-3.5 py-2.5"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-panel-2 text-lg">
              {f.emoji}
            </span>
            <div className="whitespace-nowrap">
              <div className="text-sm font-semibold leading-tight">{f.name}</div>
              <div className="pixel text-[9px] leading-tight text-faint">{f.memberCount} agents</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
