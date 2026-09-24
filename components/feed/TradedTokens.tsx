"use client";

import { useState } from "react";
import type { Token } from "@/lib/types";
import { TokenGlyph } from "./TokenGlyph";
import { cn, fmtPct, fmtPrice, fmtUsd } from "@/lib/utils";

export function TradedTokens({ tokens }: { tokens: Token[] }) {
  const sorted = [...tokens].sort((a, b) => b.volume24h - a.volume24h);
  const [active, setActive] = useState<Token | null>(null);

  return (
    <>
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
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t)}
                className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-panel-2"
              >
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
              </button>
            );
          })}
        </div>
      </section>

      {active && <TokenPopover token={active} onClose={() => setActive(null)} />}
    </>
  );
}

function TokenPopover({ token, onClose }: { token: Token; onClose: () => void }) {
  const up = token.change24h >= 0;
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-in w-full max-w-sm overflow-hidden rounded-2xl border-[2.5px] border-ink bg-panel hard-lg"
      >
        {/* title bar */}
        <div className="flex items-center gap-2 border-b-[2.5px] border-ink bg-cyan px-3 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-coral" />
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-yellow" />
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-buy" />
          </span>
          <span className="pixel ml-1 text-[11px] text-ink">TOKEN.INFO</span>
          <button
            type="button"
            onClick={onClose}
            className="pixel ml-auto rounded border-2 border-ink bg-panel px-1.5 text-[10px] text-ink hard-hover"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3">
            <TokenGlyph symbol={token.symbol} color={token.imageColor} size={48} />
            <div className="min-w-0">
              <div className="truncate font-display text-xl font-bold text-ink">${token.symbol}</div>
              <div className="mono truncate text-xs text-faint">{token.name}</div>
            </div>
            <span
              className={cn(
                "mono ml-auto shrink-0 rounded-md border-2 border-ink px-2 py-1 text-sm font-bold text-ink",
                up ? "bg-lime" : "bg-coral",
              )}
            >
              {fmtPct(token.change24h)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat k="price" v={fmtPrice(token.priceUsd)} c="bg-accent-soft" />
            <Stat k="24h vol" v={fmtUsd(token.volume24h, { compact: true })} c="bg-yellow" />
            <Stat k="liquidity" v={fmtUsd(token.liquidityUsd, { compact: true })} c="bg-pink" />
          </div>

          <div className="mono mt-4 flex items-center justify-between rounded-lg border-2 border-dashed border-border-soft bg-paper-2 px-3 py-2 text-[10px] text-muted">
            <span className="truncate">mint {token.mint.slice(0, 4)}…{token.mint.slice(-4)}</span>
            <span className="pixel text-[8px] text-faint">PAPER</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-panel p-2.5 text-center hard">
      <div className="mono text-[13px] font-bold text-ink">{v}</div>
      <div className={cn("pixel mt-1.5 inline-block rounded border-2 border-ink px-1 py-0.5 text-[7px] text-ink", c)}>
        {k}
      </div>
    </div>
  );
}
