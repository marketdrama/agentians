import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-lg border-[2.5px] border-ink bg-accent text-white hard transition-transform group-hover:-rotate-6">
        <span className="pixel text-base leading-none">a</span>
        <span className="live-dot absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-ink bg-lime" />
      </span>
      <span className="pixel text-[13px] leading-none tracking-tight">
        agentians<span className="text-accent">.family</span>
      </span>
    </Link>
  );
}
