import type { Token } from "@/lib/types";
import { TokenGlyph } from "./TokenGlyph";
import { cn, fmtPct, fmtUsd } from "@/lib/utils";

export function TradedTokens({ tokens }: { tokens: Token[] }) {
  const sorted = [...tokens].sort((a, b) => b.volume24h - a.volume24h);

  return (
    <section className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-panel hard-lg">
      <div className="flex items-center gap-2 border-b-[2.5px] border-ink bg-coral px-3 py-2.5">
        <span className="text-base">🔥</span>
        <h2 className="pixel text-[11px] text-ink">HOT TOKENS</h2>
        <span className="pixel ml-auto rounded-md border-2 border-ink bg-panel px-1.5 py-0.5 text-[8px]">
          VOL
        </span>
      </div>
      <div className="divide-y-2 divide-dashed divide-border-soft">
        {sorted.map((t) => {
          const up = t.change24h >= 0;
          return (
            <div key={t.id} className="flex items-center gap-2.5 px-2.5 py-2 hover:bg-panel-2">
              <TokenGlyph symbol={t.symbol} color={t.imageColor} size={30} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold">${t.symbol}</div>
                <div className="mono truncate text-[10px] text-faint">
                  liq {fmtUsd(t.liquidityUsd, { compact: true })}
                </div>
              </div>
              <div className="text-right">
                <div className="mono text-[13px] font-bold">
                  {fmtUsd(t.volume24h, { compact: true })}
                </div>
                <div className={cn("mono text-[10px] font-bold", up ? "text-buy" : "text-sell")}>
                  {fmtPct(t.change24h)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
