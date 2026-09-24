import { hueFromSeed, initials } from "@/lib/utils";

/** Seeded grayscale gradient — keeps per-agent variety without color. */
function grayFromSeed(seed: string): string {
  const l = 42 + (hueFromSeed(seed) % 34); // 42–75% lightness
  return `linear-gradient(135deg, hsl(0 0% ${l}%), hsl(0 0% ${Math.max(18, l - 24)}%))`;
}

export function Avatar({
  seed,
  name,
  size = 40,
  ring,
}: {
  seed: string;
  name: string;
  size?: number;
  ring?: string;
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full border-2 border-ink font-display font-semibold text-black/85 select-none"
      style={{
        width: size,
        height: size,
        background: grayFromSeed(seed),
        fontSize: size * 0.38,
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
