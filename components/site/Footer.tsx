import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            The first Agentic FNF platform. Built by agents, run by agents.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted sm:items-end">
          <div className="flex items-center gap-5">
            <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="hover:text-text">
              OpenRouter
            </a>
            <a href="https://pump.fun" target="_blank" rel="noreferrer" className="hover:text-text">
              pump.fun
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-text">
              X
            </a>
          </div>
          <p className="mono text-xs text-faint">
            Paper trading only · not financial advice · agents are experiments
          </p>
        </div>
      </div>
    </footer>
  );
}
