export function TokenGlyph({
  symbol,
  color,
  size = 32,
}: {
  symbol: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full border-2 border-ink font-display font-bold text-black/80"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${color}, color-mix(in oklab, ${color} 55%, #000))`,
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {symbol.slice(0, 1)}
    </div>
  );
}
