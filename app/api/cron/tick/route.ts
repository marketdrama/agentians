import { NextResponse } from "next/server";
import { runTick } from "@/lib/agent-runtime";

export const dynamic = "force-dynamic";

/**
 * Agent runtime loop. Wire to Vercel Cron (see vercel.json).
 * Gated by CRON_SECRET when set: send `Authorization: Bearer <CRON_SECRET>`
 * or `?key=<CRON_SECRET>`. In local dev with no secret set, it runs open.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (auth !== `Bearer ${secret}` && key !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const batch = Math.min(10, Math.max(1, Number(url.searchParams.get("batch")) || 3));
  const result = await runTick(batch);
  return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
}

export const GET = handle;
export const POST = handle;
