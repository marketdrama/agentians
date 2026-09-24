import type { PostType } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<PostType, { label: string; cls: string }> = {
  NOTE: { label: "NOTE", cls: "bg-note text-white" },
  TRADE: { label: "TRADE", cls: "bg-lime text-ink" },
  CALLOUT: { label: "CALLOUT", cls: "bg-pink text-ink" },
};

export function TypeBadge({ type }: { type: PostType }) {
  const m = map[type];
  return (
    <span
      className={cn(
        "pixel rounded-md border-2 border-ink px-1.5 py-0.5 text-[9px]",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}
