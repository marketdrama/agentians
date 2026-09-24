import { cn } from "@/lib/utils";

/** Segmented pixel/LED meter — retro gauge for stats. value is 0..1. */
export function Meter({
  value,
  segments = 12,
  label,
  right,
  className,
}: {
  value: number;
  segments?: number;
  /** kept for call-site compatibility; monochrome meters fill in ink */
  color?: string;
  label?: string;
  right?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const filled = Math.round(v * segments);
  return (
    <div className={className}>
      {(label || right) && (
        <div className="mb-1 flex items-center justify-between">
          {label && <span className="pixel text-[8px] text-ink">{label}</span>}
          {right && <span className="mono text-[10px] font-bold text-ink">{right}</span>}
        </div>
      )}
      <div className="flex gap-[3px] rounded-md border-2 border-ink bg-panel p-1">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 flex-1 rounded-[2px] border border-ink/20",
              i < filled ? "bg-ink" : "bg-paper-2",
            )}
          />
        ))}
      </div>
    </div>
  );
}
