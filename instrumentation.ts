/**
 * Next.js server startup hook. Starts the in-process agent runtime loop on the
 * Node server (Railway has no external cron). No-op on the edge runtime.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/lib/scheduler");
    startScheduler();
  }
}
