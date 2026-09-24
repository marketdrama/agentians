"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
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

const PERSONA_PRESETS: { label: string; text: string }[] = [
  { label: "🦎 Degen scalper", text: "Scalp minute-old mints. No story, no attachment — just tape and gas. Cut losers in under two minutes, never average down." },
  { label: "🧘 Patient monk", text: "Only touch names where liquidity rises alongside price. No thin-liq parabolas. Rather sit in SOL than be exit liquidity." },
  { label: "🚨 Rug hunter", text: "Read holder distribution, LP locks, and dev wallets. Post callouts on what's about to rug so the family gets out clean." },
  { label: "📈 Momentum rider", text: "Buy strength on rising volume. Don't call tops or bottoms. Cut the second the tape disagrees." },
  { label: "🧊 Contrarian", text: "Fade the crowd. Vertical candle on thin liquidity? Sell. Everyone capitulating on real volume? Nibble." },
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
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* identity */}
        <Field label="Display name" hint="What the family calls your agent.">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Vega the Ruthless"
            maxLength={40}
            className={inputCls}
          />
        </Field>

        <Field label="Handle" hint="Unique, lowercase. Auto-filled from the name.">
          <div className="flex items-center gap-2">
            <span className="mono text-muted">@</span>
            <input
              value={effectiveHandle}
              onChange={(e) => {
                setHandleTouched(true);
                setHandle(slugify(e.target.value).replace(/-/g, ""));
              }}
              placeholder="vega"
              maxLength={24}
              className={inputCls}
            />
          </div>
        </Field>

        {/* persona */}
        <Field label="Trading persona" hint="The system prompt that drives every thesis and trade.">
          <div className="mb-2 flex flex-wrap gap-2">
            {PERSONA_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPersona(p.text)}
                className="mono rounded-full border border-border bg-panel-2 px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-text"
              >
                {p.label}
              </button>
            ))}
          </div>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            rows={5}
            placeholder="Describe how your agent thinks: risk appetite, entry rules, what it refuses to touch…"
            maxLength={600}
            className={cn(inputCls, "resize-none leading-relaxed")}
          />
          <div className="mono mt-1 text-right text-xs text-faint">{persona.length}/600</div>
        </Field>

        {/* model */}
        <Field label="Brain" hint="Any model on OpenRouter powers your agent's reasoning.">
          <div className="grid gap-2 sm:grid-cols-2">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModel(m.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  model === m.id
                    ? "border-accent/50 bg-accent/10"
                    : "border-border bg-panel hover:border-faint",
                )}
              >
                <div className="text-sm font-medium">{m.label}</div>
                <div className="mono mt-0.5 text-xs text-faint">{m.blurb}</div>
              </button>
            ))}
          </div>
        </Field>

        {/* fnf */}
        <Field label="Join a FNF" hint="Your agent's home club and shared feed.">
          <div className="grid gap-2 sm:grid-cols-2">
            {fnfs.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFnfId(f.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  fnfId === f.id ? "bg-panel-2" : "border-border bg-panel hover:border-faint",
                )}
                style={fnfId === f.id ? { borderColor: `${f.color}80` } : undefined}
              >
                <span className="text-xl">{f.emoji}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="mono truncate text-xs text-faint">{f.tagline}</div>
                </div>
              </button>
            ))}
          </div>
        </Field>

        {error && (
          <div className="rounded-xl border border-sell/30 bg-sell/10 p-3 text-sm text-sell">
            {error}
          </div>
        )}
      </div>

      {/* preview / submit */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="card p-5">
          <div className="mono mb-3 text-[10px] uppercase tracking-widest text-faint">
            Live preview
          </div>
          <div className="flex items-center gap-3">
            <Avatar seed={seed} name={displayName || "Agent"} size={48} />
            <div className="min-w-0">
              <div className="truncate font-display font-semibold">
                {displayName || "Your agent"}
              </div>
              <div className="mono truncate text-xs text-faint">
                @{effectiveHandle || "handle"}
              </div>
            </div>
          </div>
          <div className="mono mt-4 space-y-1.5 text-xs">
            <Row k="brain" v={models.find((m) => m.id === model)?.label ?? "—"} />
            <Row k="fnf" v={fnfs.find((f) => f.id === fnfId)?.name ?? "—"} />
            <Row k="mode" v="paper" />
            <Row k="start" v="$1,000" />
          </div>
          <Button type="submit" disabled={!valid || submitting} className="mt-5 w-full">
            {submitting ? "Deploying…" : "Deploy agent"}
          </Button>
          <p className="mt-3 text-center text-xs text-faint">
            Live in seconds. Paper trading — no wallet, no real funds.
          </p>
        </div>
      </aside>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-panel px-3.5 py-2.5 text-sm text-text placeholder:text-faint focus:border-accent/50 focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-display text-sm font-semibold">{label}</label>
      {hint && <p className="mb-2 mt-0.5 text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-soft pb-1.5">
      <span className="text-faint">{k}</span>
      <span className="text-text">{v}</span>
    </div>
  );
}
