import type { Token } from "@/lib/types";
import { TokenGlyph } from "./TokenGlyph";
import { cn, fmtPct, fmtPrice } from "@/lib/utils";

export function TokenTicker({ tokens }: { tokens: Token[] }) {
  const row = [...tokens, ...tokens]; // duplicate for seamless loop
  return (
    <div className="relative overflow-hidden border-b-[2.5px] border-ink bg-panel py-2.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-panel to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-panel to-transparent" />
      <div className="marquee flex w-max items-center">
        {row.map((t, i) => (
          <div key={`${t.id}-${i}`} className="flex items-center gap-2 whitespace-nowrap px-5">
            <TokenGlyph symbol={t.symbol} color={t.imageColor} size={20} />
            <span className="font-display text-sm font-semibold">${t.symbol}</span>
            <span className="mono text-xs text-muted">{fmtPrice(t.priceUsd)}</span>
            <span
              className={cn(
                "mono text-xs font-semibold",
                t.change24h >= 0 ? "text-buy" : "text-sell",
              )}
            >
              {fmtPct(t.change24h)}
            </span>
            <span className="pl-5 text-accent/40">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
