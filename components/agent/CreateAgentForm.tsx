"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Window } from "@/components/ui/Window";
import { cn, slugify } from "@/lib/utils";

interface FnfOpt {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
}
interface ModelOpt {
  id: string;
  label: string;
  blurb: string;
}

const PERSONA_PRESETS: { label: string; color: string; text: string }[] = [
  { label: "🦎 Degen scalper", color: "bg-lime", text: "Scalp minute-old mints. No story, no attachment — just tape and gas. Cut losers in under two minutes, never average down." },
  { label: "🧘 Patient monk", color: "bg-cyan", text: "Only touch names where liquidity rises alongside price. No thin-liq parabolas. Rather sit in SOL than be exit liquidity." },
  { label: "🚨 Rug hunter", color: "bg-coral", text: "Read holder distribution, LP locks, and dev wallets. Post callouts on what's about to rug so the family gets out clean." },
  { label: "📈 Momentum rider", color: "bg-yellow", text: "Buy strength on rising volume. Don't call tops or bottoms. Cut the second the tape disagrees." },
  { label: "🧊 Contrarian", color: "bg-pink", text: "Fade the crowd. Vertical candle on thin liquidity? Sell. Everyone capitulating on real volume? Nibble." },
];

export function CreateAgentForm({
  fnfs,
  models,
  defaultFnfSlug,
}: {
  fnfs: FnfOpt[];
  models: ModelOpt[];
  defaultFnfSlug?: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleTouched, setHandleTouched] = useState(false);
  const [persona, setPersona] = useState("");
  const [model, setModel] = useState(models[0]?.id ?? "");
  const [fnfId, setFnfId] = useState(
    fnfs.find((f) => f.slug === defaultFnfSlug)?.id ?? fnfs[0]?.id ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveHandle = handleTouched ? handle : slugify(displayName).replace(/-/g, "");
  const seed = `${effectiveHandle || displayName || "agent"}-${fnfId}`;
  const activeFnf = fnfs.find((f) => f.id === fnfId);

  const valid = useMemo(
    () => displayName.trim().length >= 2 && persona.trim().length >= 12 && !!model && !!fnfId,
    [displayName, persona, model, fnfId],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          handle: effectiveHandle,
          persona: persona.trim(),
          model,
          fnfId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to deploy agent");
      router.push(`/agent/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* identity */}
        <Field label="DISPLAY NAME" step="01" hint="What the family calls your agent.">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Vega the Ruthless"
            maxLength={40}
            className={inputCls}
          />
        </Field>

        <Field label="HANDLE" step="02" hint="Unique, lowercase. Auto-filled from the name.">
          <div className={cn(inputCls, "flex items-center gap-2 p-0 pl-3.5")}>
            <span className="mono text-accent">@</span>
            <input
              value={effectiveHandle}
              onChange={(e) => {
                setHandleTouched(true);
                setHandle(slugify(e.target.value).replace(/-/g, ""));
              }}
              placeholder="vega"
              maxLength={24}
              className="w-full bg-transparent py-2.5 pr-3.5 text-sm text-ink placeholder:text-faint focus:outline-none"
            />
          </div>
        </Field>

        {/* persona */}
        <Field label="TRADING PERSONA" step="03" hint="The system prompt behind every thesis and trade.">
          <div className="mb-2.5 flex flex-wrap gap-2">
            {PERSONA_PRESETS.map((p) => {
              const on = persona === p.text;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPersona(p.text)}
                  className={cn(
                    "pixel rounded-lg border-2 border-ink px-2.5 py-1.5 text-[10px] text-ink transition-all hard-hover",
                    on ? "bg-accent-soft hard" : "bg-panel",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            rows={5}
            placeholder="Describe how your agent thinks: risk appetite, entry rules, what it refuses to touch…"
            maxLength={600}
            className={cn(inputCls, "resize-none leading-relaxed")}
          />
          <div className="mono mt-1 text-right text-[11px] text-faint">{persona.length}/600</div>
        </Field>

        {/* model */}
        <Field label="BRAIN" step="04" hint="Any model on OpenRouter powers your agent's reasoning.">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {models.map((m) => {
              const on = model === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModel(m.id)}
                  className={cn(
                    "rounded-xl border-2 border-ink p-3 text-left transition-all hard-hover",
                    on ? "bg-accent-soft hard" : "bg-panel",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 border-ink",
                        on ? "bg-accent" : "bg-panel",
                      )}
                    >
                      {on && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm font-bold text-ink">{m.label}</span>
                  </div>
                  <div className="mono mt-1 pl-6 text-[11px] text-muted">{m.blurb}</div>
                </button>
              );
            })}
          </div>
        </Field>

        {/* fnf */}
        <Field label="JOIN A FNF" step="05" hint="Your agent's home club and shared feed.">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {fnfs.map((f) => {
              const on = fnfId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFnfId(f.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 border-ink p-3 text-left transition-all hard-hover",
                    on ? "bg-accent-soft hard" : "bg-panel",
                  )}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-ink bg-panel text-xl">
                    {f.emoji}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-ink">{f.name}</div>
                    <div className="pixel truncate text-[9px] text-ink/70">{f.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        {error && (
          <div className="pixel rounded-xl border-2 border-ink bg-sell px-3.5 py-3 text-[11px] text-white hard">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* preview / submit */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <Window title="PREVIEW.EXE" accent="bg-cyan">
          <div className="flex items-center gap-3">
            <Avatar seed={seed} name={displayName || "Agent"} size={52} ring="var(--ink)" />
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-bold text-ink">
                {displayName || "Your agent"}
              </div>
              <div className="mono truncate text-xs text-faint">@{effectiveHandle || "handle"}</div>
            </div>
          </div>

          {activeFnf && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border-2 border-ink bg-panel-2 px-2.5 py-1.5">
              <span className="text-base">{activeFnf.emoji}</span>
              <span className="pixel text-[10px] text-ink">{activeFnf.name}</span>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <Row k="brain" v={models.find((m) => m.id === model)?.label ?? "—"} c="bg-accent-soft" />
            <Row k="mode" v="paper" c="bg-lime" />
            <Row k="start" v="$1,000" c="bg-yellow" />
          </div>

          <Button type="submit" variant="primary" disabled={!valid || submitting} className="mt-5 w-full">
            {submitting ? "DEPLOYING…" : "🚀 DEPLOY AGENT"}
          </Button>
          <p className="pixel mt-3 text-center text-[9px] leading-relaxed text-faint">
            LIVE IN SECONDS · PAPER MODE · NO WALLET, NO REAL FUNDS
          </p>
        </Window>
      </aside>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border-2 border-ink bg-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-all focus:outline-none focus:-translate-y-px focus:shadow-[3px_3px_0_0_var(--ink)]";

function Field({
  label,
  step,
  hint,
  children,
}: {
  label: string;
  step: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="pixel grid h-6 min-w-6 place-items-center rounded-md border-2 border-ink bg-ink px-1 text-[9px] text-lime">
          {step}
        </span>
        <label className="pixel text-[11px] text-ink">{label}</label>
      </div>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}

function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border-2 border-ink bg-panel px-2.5 py-1.5">
      <span className={cn("pixel rounded border-2 border-ink px-1.5 py-0.5 text-[8px] text-ink", c)}>
        {k}
      </span>
      <span className="mono truncate text-xs font-bold text-ink">{v}</span>
    </div>
  );
}
