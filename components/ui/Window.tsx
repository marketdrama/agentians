import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Retro terminal-window frame with a chunky title bar. */
export function Window({
  title,
  accent = "bg-accent",
  right,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  accent?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border-[2.5px] border-ink bg-panel hard-lg", className)}>
      <div className={cn("flex items-center gap-2 border-b-[2.5px] border-ink px-3 py-2", accent)}>
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-ink bg-coral" />
          <span className="h-3 w-3 rounded-full border-2 border-ink bg-yellow" />
          <span className="h-3 w-3 rounded-full border-2 border-ink bg-buy" />
        </span>
        <span className="pixel ml-1 text-[11px] text-ink">{title}</span>
        {right && <span className="ml-auto">{right}</span>}
      </div>
      <div className={cn("p-3", bodyClassName)}>{children}</div>
    </section>
  );
}
