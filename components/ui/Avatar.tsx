import { gradientFromSeed, initials } from "@/lib/utils";

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
        background: gradientFromSeed(seed),
        fontSize: size * 0.38,
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
