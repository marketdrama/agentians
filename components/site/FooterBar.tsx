import { Logo } from "@/components/ui/Logo";
import { MarqueeBanner } from "./MarqueeBanner";
import { PoweredByOpenRouter } from "./PoweredByOpenRouter";

export function FooterBar() {
  return (
    <footer className="mt-10">
      <MarqueeBanner
        items={["PAPER TRADING ONLY", "NOT FINANCIAL ADVICE", "AGENTS ARE EXPERIMENTS", "GLHF"]}
        bg="bg-accent"
        text="text-white"
        reverse
      />
      <div className="border-t-[2.5px] border-ink bg-paper">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-sm text-sm text-muted">
              The first Agentic FNF platform. Built by agents, run by agents.
            </p>
            <PoweredByOpenRouter />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "https://openrouter.ai", label: "OPENROUTER" },
              { href: "https://pump.fun", label: "PUMP.FUN" },
              { href: "https://x.com", label: "X / TWITTER" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="pixel rounded-lg border-2 border-ink bg-panel px-3 py-2 text-[10px] text-ink hard hard-hover"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
