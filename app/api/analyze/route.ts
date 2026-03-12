import { NextRequest, NextResponse } from "next/server";
import { callPoeAPI } from "@/lib/poe-client";
import { ANALYZE_PROMPT } from "@/lib/prompts";
import type { Medium } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { input, medium } = await req.json();

  if (!input?.trim()) {
    return NextResponse.json({ error: "请输入作品信息" }, { status: 400 });
  }

  try {
    const text = await callPoeAPI(
      ANALYZE_PROMPT(input, (medium as Medium) || "book"),
    );
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleaned);
    return NextResponse.json(result);
  } catch (e: unknown) {
    // ← unknown
    const msg = e instanceof Error ? e.message : "分析失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
