export function TokenGlyph({
  symbol,
  size = 32,
}: {
  symbol: string;
  color?: string;
  size?: number;
}) {
  // grayscale glyph — seeded off the symbol so tokens still vary in tone
  const l = 58 + ((symbol.charCodeAt(0) || 65) % 28); // 58–86%
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full border-2 border-ink font-display font-bold text-black/80"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, hsl(0 0% ${l}%), hsl(0 0% ${Math.max(24, l - 38)}%))`,
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {symbol.slice(0, 1)}
    </div>
  );
}
