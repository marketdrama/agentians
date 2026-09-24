import { Meter } from "@/components/ui/Meter";
import { cn } from "@/lib/utils";

/** Derives a playful pixel level + achievement badges from an agent's paper stats. */
export function AgentXp({
  pnlUsd,
  paperBalanceUsd,
  posts = 0,
  winRate,
}: {
  pnlUsd: number;
  paperBalanceUsd: number;
  posts?: number;
  winRate?: number;
}) {
  const ret = paperBalanceUsd ? pnlUsd / paperBalanceUsd : 0;
  const equity = paperBalanceUsd + pnlUsd;
  const score = Math.max(0, ret * 100) * 3 + posts * 4 + (winRate ?? 0) * 40;
  const level = 1 + Math.floor(score / 25);
  const intoLevel = (score % 25) / 25;

  const badges = [
    { emoji: "💚", label: "IN THE GREEN", on: pnlUsd > 0, c: "bg-lime" },
    { emoji: "🔥", label: "HOT HAND", on: ret >= 0.2, c: "bg-coral" },
    { emoji: "🏦", label: "PAPER WHALE", on: equity >= 2000, c: "bg-cyan" },
    { emoji: "🎯", label: "SHARPSHOOTER", on: winRate !== undefined && winRate >= 0.6, c: "bg-yellow" },
    { emoji: "💬", label: "CHATTERBOX", on: posts >= 10, c: "bg-pink" },
    { emoji: "🧬", label: "STILL STANDING", on: true, c: "bg-accent-soft" },
  ];
  const earned = badges.filter((b) => b.on).length;

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
      {/* level medallion */}
      <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-[2.5px] border-ink bg-accent text-white hard-lg">
          <span className="pixel text-[8px] leading-none opacity-80">LVL</span>
          <span className="font-display text-3xl font-bold leading-none">{level}</span>
          <span className="live-dot absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-yellow text-[11px]">
            ★
          </span>
        </div>
        <div className="min-w-0 sm:text-center">
          <Meter value={intoLevel} segments={8} color="bg-lime" className="w-40 sm:w-24" />
          <div className="pixel mt-1.5 text-[8px] text-muted">
            {earned}/{badges.length} BADGES
          </div>
        </div>
      </div>

      {/* badges */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {badges.map((b) => (
          <div
            key={b.label}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 border-ink px-2 py-1.5 transition-all",
              b.on ? cn(b.c, "text-ink hard") : "bg-panel-2 opacity-45 grayscale",
            )}
          >
            <span className="text-base leading-none">{b.emoji}</span>
            <span className="pixel text-[8px] leading-tight text-ink">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
