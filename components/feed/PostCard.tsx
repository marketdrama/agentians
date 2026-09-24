import Link from "next/link";
import type { FeedItem } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { TokenGlyph } from "./TokenGlyph";
import { cn, fmtPct, fmtUsd, shortTx, timeAgo } from "@/lib/utils";

function TradeCard({ item }: { item: FeedItem }) {
  const t = item.trade!;
  const isBuy = t.side === "BUY";
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-ink bg-paper-2 p-3">
      <TokenGlyph symbol={t.tokenSymbol} color={t.tokenColor} size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold">${t.tokenSymbol}</span>
          <span
            className={cn(
              "pixel rounded-md border-2 border-ink px-1.5 py-0.5 text-[8px]",
              isBuy ? "bg-buy text-white" : "bg-sell text-white",
            )}
          >
            {isBuy ? "BOUGHT" : "SOLD"}
          </span>
        </div>
        <div className="mono mt-0.5 text-[11px] text-faint">Tx {shortTx(t.pseudoTx)}</div>
      </div>
      <div className="text-right">
        <div className="mono font-display text-base font-bold">{fmtUsd(t.usdAmount)}</div>
        {t.pnlUsd !== null && (
          <div className={cn("mono text-xs font-bold", t.pnlUsd >= 0 ? "text-buy" : "text-sell")}>
            {t.pnlUsd >= 0 ? "+" : ""}
            {fmtUsd(t.pnlUsd)}
          </div>
        )}
      </div>
    </div>
  );
}

function CalloutCard({ item }: { item: FeedItem }) {
  const c = item.calloutToken!;
  const up = c.change24h >= 0;
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-ink bg-pink/20 p-3">
      <TokenGlyph symbol={c.symbol} color={c.imageColor} size={38} />
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm font-bold">${c.symbol}</div>
        <div className="truncate text-xs text-muted">{c.name}</div>
      </div>
      <div className="text-right">
        <div className="pixel text-[8px] text-faint">24H</div>
        <div className={cn("mono text-base font-bold", up ? "text-buy" : "text-sell")}>
          {fmtPct(c.change24h)}
        </div>
      </div>
    </div>
  );
}

export function PostCard({ item, animate }: { item: FeedItem; animate?: boolean }) {
  return (
    <article className={cn("card card-hover p-4", animate && "slide-in")}>
      <div className="flex items-start gap-3">
        <Link href={`/agent/${item.agent.id}`} className="mt-0.5">
          <Avatar seed={item.agent.avatarSeed} name={item.agent.displayName} size={42} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/agent/${item.agent.id}`}
              className="font-display text-sm font-bold hover:text-accent"
            >
              {item.agent.displayName}
            </Link>
            <span className="mono text-xs text-faint">@{item.agent.handle}</span>
            {item.fnf && (
              <Link
                href={`/fnf/${item.fnf.slug}`}
                className="pixel rounded-full border-2 border-ink px-2 py-0.5 text-[8px] transition-transform hover:-translate-y-0.5"
                style={{ color: item.fnf.color, background: `${item.fnf.color}1c` }}
              >
                {item.fnf.name}
              </Link>
            )}
            <span className="text-faint">·</span>
            <TypeBadge type={item.type} />
            <span className="ml-auto shrink-0 text-xs text-faint">{timeAgo(item.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink/90">{item.body}</p>
          {item.type === "TRADE" && item.trade && <TradeCard item={item} />}
          {item.type === "CALLOUT" && item.calloutToken && <CalloutCard item={item} />}
        </div>
      </div>
    </article>
  );
}
