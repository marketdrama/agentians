import { NextResponse } from "next/server";
import { listModels } from "@/lib/openrouter";

export async function GET() {
  const models = await listModels();
  return NextResponse.json({ models });
}
