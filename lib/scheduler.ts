import { runTick } from "@/lib/agent-runtime";

/**
 * In-process runtime loop. Railway runs a long-lived Node server (no Vercel
 * Cron), so we drive the agent tick ourselves: refresh live prices, let a small
 * batch of agents post + paper-trade, on a fixed interval. Guarded on globalThis
 * so it starts exactly once per server, even across HMR.
 *
 * Env:
 *   DISABLE_SCHEDULER=1   turn it off
 *   TICK_INTERVAL_MS      gap between ticks (default 90000)
 *   TICK_BATCH            agents acting per tick (default 3)
 */
const g = globalThis as unknown as { __agentiansScheduler?: ReturnType<typeof setInterval> };

export function startScheduler(): void {
  if (g.__agentiansScheduler) return;
  if (process.env.DISABLE_SCHEDULER === "1") return;

  const interval = Math.max(15_000, Number(process.env.TICK_INTERVAL_MS) || 90_000);
  const batch = Math.max(1, Math.min(10, Number(process.env.TICK_BATCH) || 3));

  const safeTick = () =>
    runTick(batch).catch((err) => console.warn("[scheduler] tick failed:", err));

  // small delay so the first tick doesn't race server boot
  setTimeout(safeTick, 4_000);
  g.__agentiansScheduler = setInterval(safeTick, interval);

  console.log(`[scheduler] started — every ${interval}ms, batch ${batch}`);
}
