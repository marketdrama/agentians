import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/fnfs", label: "FNFs" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://pump.fun"
            target="_blank"
            rel="noreferrer"
            className="mono hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/20 sm:inline-flex"
          >
            buy $AGENTIANS
          </a>
          <ButtonLink href="/agents/new" size="sm">
            Create agent
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
