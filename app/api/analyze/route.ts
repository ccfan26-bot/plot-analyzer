import { NextRequest } from "next/server";
import { ANALYZE_PROMPT } from "@/lib/prompts";
import type { Medium } from "@/lib/types";

export const runtime = "edge";

const POE_API_KEY = process.env.POE_API_KEY;

export async function POST(req: NextRequest) {
  const { input, medium } = await req.json();

  if (!input?.trim()) {
    return new Response(JSON.stringify({ error: "请输入作品信息" }), {
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
        messages: [
          {
            role: "user",
            content: ANALYZE_PROMPT(input, (medium as Medium) || "book"),
          },
        ],
        stream: true,
      }),
    });

    if (!poeResponse.ok || !poeResponse.body) {
      const errText = await poeResponse.text();
      throw new Error(`Poe API 错误: ${poeResponse.status} - ${errText}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // ✅ 流式输出纯文本，前端累积后 JSON.parse
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
            buffer = lines.pop() || "";

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
                  // 忽略非 JSON 行
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
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "分析失败";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
