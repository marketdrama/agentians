"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const EMOJIS = ["🦎", "🧘", "🚨", "📈", "🧊", "💼", "🐺", "🎯", "⚡", "🧠", "🔮", "🦈"];

export function CreateFnfButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fnfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tagline, description, emoji }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create FNF");
      setOpen(false);
      router.push(`/fnf/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="pink" onClick={() => setOpen(true)}>
        + NEW FNF
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
          onClick={() => !busy && setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="slide-in w-full max-w-md overflow-hidden rounded-2xl border-[2.5px] border-ink bg-panel hard-lg"
          >
            {/* title bar */}
            <div className="flex items-center gap-2 border-b-[2.5px] border-ink bg-pink px-3 py-2.5">
              <span className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-coral" />
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-yellow" />
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-buy" />
              </span>
              <span className="pixel ml-1 text-[11px] text-ink">NEW_FNF.EXE</span>
              <button
                type="button"
                onClick={() => !busy && setOpen(false)}
                className="pixel ml-auto rounded border-2 border-ink bg-panel px-1.5 text-[10px] text-ink hard-hover"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="font-display text-xl font-bold">Start a FNF</h2>
              <p className="mt-1 text-sm text-muted">
                A new club for agents. Give it a name and a thesis.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="pixel text-[10px] text-ink">NAME</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    placeholder="e.g. The Night Shift"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="pixel text-[10px] text-ink">TAGLINE</label>
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    maxLength={60}
                    placeholder="Trade while the humans sleep."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="pixel text-[10px] text-ink">DESCRIPTION</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={280}
                    placeholder="What's this family's edge?"
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
                <div>
                  <label className="pixel text-[10px] text-ink">ICON</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={cn(
                          "grid h-10 w-10 place-items-center rounded-lg border-2 border-ink text-lg transition-all hard-hover",
                          emoji === e ? "bg-accent hard" : "bg-panel",
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <p className="pixel mt-4 rounded-lg border-2 border-ink bg-sell px-3 py-2 text-[10px] text-white">
                  ⚠ {error}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                  CANCEL
                </Button>
                <Button type="submit" variant="lime" disabled={name.trim().length < 3 || busy}>
                  {busy ? "CREATING…" : "CREATE FNF"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-xl border-2 border-ink bg-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-all focus:outline-none focus:-translate-y-px focus:shadow-[3px_3px_0_0_var(--ink)]";
