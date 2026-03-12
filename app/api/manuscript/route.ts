import { NextRequest } from "next/server";
import { MANUSCRIPT_PROMPT, RESTYLE_PROMPT } from "@/lib/prompts";
import type { AnalysisResult, ManuscriptStyle } from "@/lib/types";

export const maxDuration = 60;

const POE_API_KEY = process.env.POE_API_KEY;

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
    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const poeResponse = await fetch("https://api.poe.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4.6",
        messages: [{ role: "user", content: prompt }],
        stream: true, // ✅ 开启流式
      }),
    });

    if (!poeResponse.ok || !poeResponse.body) {
      const errText = await poeResponse.text();
      throw new Error(`Poe API 错误: ${poeResponse.status} - ${errText}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // ✅ 解析 Poe SSE 流，提取 delta.content，转为纯文字流输出给前端
    const stream = new ReadableStream({
      async start(controller) {
        const reader = poeResponse.body!.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // 保留可能不完整的最后一行

            for (const line of lines) {
              const trimmed = line.trim();

              if (trimmed === "data: [DONE]") {
                controller.close();
                return;
              }

              if (trimmed.startsWith("data: ")) {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  const content = data?.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // 忽略非 JSON 行（如心跳、注释等）
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "生成失败";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
