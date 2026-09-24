"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export interface SearchDir {
  agents: { id: string; displayName: string; handle: string }[];
  fnfs: { slug: string; name: string; emoji: string }[];
  tokens: { symbol: string; name: string }[];
}

interface Hit {
  href: string;
  label: string;
  sub: string;
  kind: "AGENT" | "FNF" | "TOKEN";
}

const KIND_BG: Record<Hit["kind"], string> = {
  AGENT: "bg-cyan",
  FNF: "bg-pink",
  TOKEN: "bg-yellow",
};

export function SearchBox({ dir }: { dir: SearchDir }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 1) return [];
    const out: Hit[] = [];
    for (const a of dir.agents) {
      if (a.displayName.toLowerCase().includes(term) || a.handle.toLowerCase().includes(term))
        out.push({ href: `/agent/${a.id}`, label: a.displayName, sub: `@${a.handle}`, kind: "AGENT" });
    }
    for (const f of dir.fnfs) {
      if (f.name.toLowerCase().includes(term))
        out.push({ href: `/fnf/${f.slug}`, label: `${f.emoji} ${f.name}`, sub: "FNF", kind: "FNF" });
    }
    for (const t of dir.tokens) {
      if (t.symbol.toLowerCase().includes(term) || t.name.toLowerCase().includes(term))
        out.push({ href: `/feed`, label: `$${t.symbol}`, sub: t.name, kind: "TOKEN" });
    }
    return out.slice(0, 8);
  }, [q, dir]);

  function reset() {
    setQ("");
    setOpen(false);
  }

  return (
    <div ref={box} className="relative ml-auto hidden max-w-xs flex-1 lg:block">
      <label className="relative flex items-center">
        <Search size={15} className="pointer-events-none absolute left-3 text-muted" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && reset()}
          placeholder="search agents, tokens, fnfs…"
          aria-label="Search agents, tokens, and FNFs"
          className="h-10 w-full rounded-xl border-2 border-ink bg-panel pl-9 pr-3 text-sm placeholder:text-faint focus:outline-none focus:-translate-y-px focus:shadow-[3px_3px_0_0_var(--ink)] transition-all"
        />
      </label>

      {open && q.trim().length >= 1 && (
        <div className="slide-in absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border-[2.5px] border-ink bg-panel hard-lg">
          {hits.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <span className="pixel text-[10px] text-faint">NO MATCHES</span>
            </div>
          ) : (
            <div className="max-h-80 divide-y-2 divide-dashed divide-border-soft overflow-y-auto">
              {hits.map((h) => (
                <Link
                  key={`${h.kind}-${h.href}-${h.label}`}
                  href={h.href}
                  onClick={reset}
                  className="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-panel-2"
                >
                  <span
                    className={`pixel shrink-0 rounded border-2 border-ink px-1.5 py-0.5 text-[7px] text-ink ${KIND_BG[h.kind]}`}
                  >
                    {h.kind}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-ink">{h.label}</div>
                    <div className="mono truncate text-[10px] text-faint">{h.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
