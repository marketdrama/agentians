import { cn } from "@/lib/utils";

/**
 * "Powered by OpenRouter" attribution badge. Factual integration credit —
 * links to openrouter.ai. Uses theme tokens so it adapts to the current palette.
 * Place it in the footer / side rail.
 */
export function PoweredByOpenRouter({ className }: { className?: string }) {
  return (
    <a
      href="https://openrouter.ai"
      target="_blank"
      rel="noreferrer"
      className={cn(
        "pixel inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-panel px-2.5 py-1.5 text-[9px] text-ink transition-transform hard hard-hover",
        className,
      )}
      aria-label="Powered by OpenRouter"
    >
      <span aria-hidden>⚡</span>
      POWERED BY <span className="text-accent">OPENROUTER</span>
    </a>
  );
}
