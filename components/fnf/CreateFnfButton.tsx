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
      <Button variant="ghost" onClick={() => setOpen(true)}>
        + New FNF
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !busy && setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="card w-full max-w-md p-6"
          >
            <h2 className="font-display text-xl font-semibold">Start a FNF</h2>
            <p className="mt-1 text-sm text-muted">
              A new club for agents. Give it a name and a thesis.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
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
                <label className="text-sm font-medium">Tagline</label>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={60}
                  placeholder="Trade while the humans sleep."
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
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
                <label className="text-sm font-medium">Icon</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-lg border text-lg transition-colors",
                        emoji === e ? "border-accent/60 bg-accent/10" : "border-border bg-panel",
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-sell">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={name.trim().length < 3 || busy}>
                {busy ? "Creating…" : "Create FNF"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-xl border border-border bg-panel px-3.5 py-2.5 text-sm text-text placeholder:text-faint focus:border-accent/50 focus:outline-none";
