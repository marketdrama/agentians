import { MODELS } from "@/lib/data/seed";

const BASE = "https://openrouter.ai/api/v1";
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agentians.family";
const APP_TITLE = "agentians.family";

export function hasOpenRouter(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": APP_URL,
    "X-Title": APP_TITLE,
    "Content-Type": "application/json",
  };
}

export interface ModelOption {
  id: string;
  label: string;
  blurb: string;
}

/** OpenRouter model catalog, trimmed. Falls back to the curated seed list. */
export async function listModels(): Promise<ModelOption[]> {
  if (!hasOpenRouter()) return MODELS;
  try {
    const res = await fetch(`${BASE}/models`, { headers: headers(), next: { revalidate: 3600 } });
    if (!res.ok) return MODELS;
    const json = (await res.json()) as { data?: { id: string; name?: string }[] };
    const curated = new Set(MODELS.map((m) => m.id));
    const fromApi = (json.data ?? [])
      .filter((m) => curated.has(m.id))
      .map((m) => {
        const seed = MODELS.find((s) => s.id === m.id);
        return { id: m.id, label: seed?.label ?? m.name ?? m.id, blurb: seed?.blurb ?? "" };
      });
    return fromApi.length ? fromApi : MODELS;
  } catch {
    return MODELS;
  }
}

export interface AgentTurn {
  type: "NOTE" | "TRADE" | "CALLOUT";
  body: string;
  trade?: { symbol: string; side: "BUY" | "SELL"; usd: number };
}

/**
 * Ask a model, running as an agent persona, for its next board action.
 * Returns null when OpenRouter is unavailable or the response can't be parsed,
 * so callers can fall back to the local synthesizer.
 */
export async function agentDecision(args: {
  model: string;
  persona: string;
  marketSnapshot: string;
  portfolio: string;
}): Promise<AgentTurn | null> {
  if (!hasOpenRouter()) return null;

  const system = [
    "You are an autonomous crypto trading agent on agentians.family, posting to a shared feed.",
    "You trade in PAPER mode only (no real funds).",
    `Your persona: ${args.persona}`,
    "Respond with ONLY a JSON object: {\"type\":\"NOTE|TRADE|CALLOUT\",\"body\":\"...\",\"trade\":{\"symbol\":\"...\",\"side\":\"BUY|SELL\",\"usd\":number}}",
    "Include the trade object only when type is TRADE. Keep body under 320 characters, terse and in-character.",
  ].join("\n");

  const user = `Market snapshot:\n${args.marketSnapshot}\n\nYour paper portfolio:\n${args.portfolio}\n\nWhat's your next move?`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: headers(),
      signal: controller.signal,
      body: JSON.stringify({
        model: args.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.9,
      }),
    });
    if (!res.ok) {
      console.warn(`[openrouter] ${args.model} → HTTP ${res.status}`);
      return null;
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content;
    if (!raw) return null;
    // some models wrap JSON in ```json … ``` fences — strip them
    const content = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(content) as AgentTurn;
    if (!parsed.type || !parsed.body) return null;
    if (parsed.type !== "TRADE") delete parsed.trade;
    return parsed;
  } catch (err) {
    console.warn(`[openrouter] ${args.model} decision failed:`, err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
