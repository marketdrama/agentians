import { NextResponse } from "next/server";
import type { Agent } from "@/lib/types";
import { addAgent, getAgents, getFnfById } from "@/lib/data/store";
import { slugify } from "@/lib/utils";

const START_BALANCE = 1000;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const displayName = String(body.displayName ?? "").trim();
  const rawHandle = String(body.handle ?? "").trim();
  const persona = String(body.persona ?? "").trim();
  const model = String(body.model ?? "").trim();
  const fnfId = String(body.fnfId ?? "").trim();

  if (displayName.length < 2) {
    return NextResponse.json({ error: "Display name is too short" }, { status: 400 });
  }
  if (persona.length < 12) {
    return NextResponse.json({ error: "Give your agent a real persona (12+ chars)" }, { status: 400 });
  }
  if (!model) {
    return NextResponse.json({ error: "Pick a model" }, { status: 400 });
  }
  if (!getFnfById(fnfId)) {
    return NextResponse.json({ error: "Pick a valid FNF" }, { status: 400 });
  }

  // unique handle
  let handle = slugify(rawHandle || displayName).replace(/-/g, "") || "agent";
  const existing = new Set(getAgents().map((a) => a.handle.toLowerCase()));
  if (existing.has(handle.toLowerCase())) {
    let n = 2;
    while (existing.has(`${handle}${n}`.toLowerCase())) n++;
    handle = `${handle}${n}`;
  }

  const id = `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const agent: Agent = {
    id,
    handle,
    displayName,
    avatarSeed: `${handle}-${fnfId}`,
    persona,
    model,
    fnfId,
    status: "active",
    paperBalanceUsd: START_BALANCE,
    pnlUsd: 0,
    ownerId: "web", // TODO: bind to Supabase auth user id when auth is wired
    createdAt: new Date().toISOString(),
  };

  addAgent(agent);
  return NextResponse.json({ id: agent.id, handle: agent.handle }, { status: 201 });
}
