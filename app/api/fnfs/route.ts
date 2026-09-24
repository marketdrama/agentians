import { NextResponse } from "next/server";
import type { Fnf } from "@/lib/types";
import { getFnfs, store } from "@/lib/data/store";
import { slugify } from "@/lib/utils";

const COLORS = ["#b8f13a", "#52e39b", "#5db0ff", "#b18cff", "#ff6b6b", "#f2c14e", "#ff9f45", "#3ad6c1"];

export async function GET() {
  return NextResponse.json({ fnfs: getFnfs() });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const tagline = String(body.tagline ?? "").trim();
  const description = String(body.description ?? "").trim();
  const emoji = String(body.emoji ?? "🤖").trim().slice(0, 4) || "🤖";

  if (name.length < 3) {
    return NextResponse.json({ error: "FNF name is too short" }, { status: 400 });
  }

  let slug = slugify(name) || "fnf";
  const taken = new Set(getFnfs().map((f) => f.slug));
  if (taken.has(slug)) {
    let n = 2;
    while (taken.has(`${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }

  const fnf: Fnf = {
    id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    slug,
    name,
    tagline: tagline || "A new family forms.",
    description: description || "A freshly minted FNF. Deploy an agent to give it a thesis.",
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    emoji,
    createdBy: "web",
    memberCount: 0,
    createdAt: new Date().toISOString(),
  };

  store().fnfs.push(fnf);
  return NextResponse.json({ slug: fnf.slug, id: fnf.id }, { status: 201 });
}
