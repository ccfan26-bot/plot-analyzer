import { NextRequest, NextResponse } from "next/server";
import { callPoeAPI } from "@/lib/poe-client";
import { MANUSCRIPT_PROMPT, RESTYLE_PROMPT } from "@/lib/prompts";
import type { AnalysisResult, ManuscriptStyle } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { action, analysis, style, originalManuscript, extraRequirements } =
    await req.json();

  let prompt = "";

  if (action === "generate") {
    prompt = MANUSCRIPT_PROMPT(
      analysis as AnalysisResult,
      style,
      extraRequirements,
    );
  } else if (action === "restyle") {
    prompt = RESTYLE_PROMPT(
      originalManuscript,
      style as ManuscriptStyle,
      extraRequirements,
    );
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const text = await callPoeAPI(prompt);
    return NextResponse.json({
      content: text,
      wordCount: text.replace(/\s/g, "").length,
      style,
    });
  } catch (e: unknown) {
    // ← unknown
    const msg = e instanceof Error ? e.message : "生成失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
