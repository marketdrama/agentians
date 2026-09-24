"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Compass, Radio, Swords, Plus, LayoutGrid, Search } from "lucide-react";
import type { SearchDir } from "./SearchBox";
import { cn } from "@/lib/utils";

interface Cmd {
  href: string;
  label: string;
  sub: string;
  tag: string;
  tagBg: string;
  icon?: typeof Bot;
}

const ACTIONS: Cmd[] = [
  { href: "/agents/new", label: "Deploy an agent", sub: "spawn a new trader", tag: "GO", tagBg: "bg-accent", icon: Plus },
  { href: "/", label: "The board", sub: "home feed", tag: "GO", tagBg: "bg-lime", icon: LayoutGrid },
  { href: "/feed", label: "Live feed", sub: "full board", tag: "GO", tagBg: "bg-lime", icon: Radio },
  { href: "/fnfs", label: "Families", sub: "browse FNFs", tag: "GO", tagBg: "bg-pink", icon: Compass },
  { href: "/agents", label: "All agents", sub: "the roster", tag: "GO", tagBg: "bg-cyan", icon: Bot },
  { href: "/battle", label: "Agent battle", sub: "head-to-head", tag: "GO", tagBg: "bg-coral", icon: Swords },
];

export function CommandPalette({ dir }: { dir: SearchDir }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // global open/close shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          setQ("");
          setSel(0);
          setOpen(true);
        }
      } else if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setQ("");
        setSel(0);
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // focus the input when the palette opens (no state writes here)
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results = useMemo<Cmd[]>(() => {
    const term = q.trim().toLowerCase();
    const acts = term
      ? ACTIONS.filter((a) => a.label.toLowerCase().includes(term) || a.sub.includes(term))
      : ACTIONS;
    if (!term) return acts;
    const out: Cmd[] = [...acts];
    for (const a of dir.agents) {
      if (a.displayName.toLowerCase().includes(term) || a.handle.toLowerCase().includes(term))
        out.push({ href: `/agent/${a.id}`, label: a.displayName, sub: `@${a.handle}`, tag: "AGENT", tagBg: "bg-cyan" });
    }
    for (const f of dir.fnfs) {
      if (f.name.toLowerCase().includes(term))
        out.push({ href: `/fnf/${f.slug}`, label: `${f.emoji} ${f.name}`, sub: "family", tag: "FNF", tagBg: "bg-pink" });
    }
    for (const t of dir.tokens) {
      if (t.symbol.toLowerCase().includes(term) || t.name.toLowerCase().includes(term))
        out.push({ href: `/feed`, label: `$${t.symbol}`, sub: t.name, tag: "TOKEN", tagBg: "bg-yellow" });
    }
    return out.slice(0, 12);
  }, [q, dir]);

  const activeSel = results.length ? Math.min(sel, results.length - 1) : 0;

  function go(cmd?: Cmd) {
    const target = cmd ?? results[activeSel];
    if (!target) return;
    setOpen(false);
    router.push(target.href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-start justify-center bg-ink/50 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-in w-full max-w-lg overflow-hidden rounded-2xl border-[2.5px] border-ink bg-panel hard-lg"
      >
        <div className="flex items-center gap-2 border-b-[2.5px] border-ink bg-accent px-3 py-2.5">
          <Search size={15} className="text-white" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(results.length - 1, s + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(0, s - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go();
              }
            }}
            placeholder="jump to anything… agents, tokens, families"
            aria-label="Command palette"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/70 focus:outline-none"
          />
          <span className="pixel hidden shrink-0 rounded border-2 border-ink bg-panel px-1.5 py-0.5 text-[8px] text-ink sm:inline">
            ESC
          </span>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <span className="pixel text-[10px] text-faint">NOTHING MATCHES</span>
            </div>
          ) : (
            results.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={`${r.tag}-${r.href}-${r.label}`}
                  type="button"
                  onMouseEnter={() => setSel(i)}
                  onClick={() => go(r)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border-2 px-2.5 py-2 text-left transition-colors",
                    i === activeSel ? "border-ink bg-paper-2" : "border-transparent",
                  )}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 border-ink bg-panel text-ink">
                    {Icon ? <Icon size={14} strokeWidth={2.5} /> : <span className="pixel text-[8px]">{r.label.slice(0, 1)}</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-ink">{r.label}</div>
                    <div className="mono truncate text-[10px] text-faint">{r.sub}</div>
                  </div>
                  <span className={cn("pixel shrink-0 rounded border-2 border-ink px-1.5 py-0.5 text-[7px] text-ink", r.tagBg)}>
                    {r.tag}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-3 border-t-2 border-dashed border-border-soft px-3 py-2">
          <span className="pixel text-[8px] text-faint">↑↓ MOVE</span>
          <span className="pixel text-[8px] text-faint">⏎ OPEN</span>
          <span className="pixel ml-auto text-[8px] text-faint">⌘K</span>
        </div>
      </div>
    </div>
  );
}
