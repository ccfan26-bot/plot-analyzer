export async function POST(req: NextRequest) {
  const { input, medium } = await req.json();

  if (!input?.trim()) {
    return NextResponse.json({ error: "请输入作品信息" }, { status: 400 });
  }

  try {
    const text = await callPoeAPI(
      ANALYZE_PROMPT(input, (medium as Medium) || "book"),
    );

    // ✅ 先打印原始返回，方便排查
    console.log("Poe 原始返回:", text);

    // ✅ 检查是否是错误文本
    if (!text || text.startsWith("An error") || text.startsWith("Error")) {
      return NextResponse.json(
        { error: `AI 返回错误: ${text}` },
        { status: 500 },
      );
    }

    // ✅ 更安全的 JSON 提取（支持 ```json ... ``` 包裹）
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) ||
      text.match(/```\s*([\s\S]*?)\s*```/) ||
      text.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      console.error("无法提取 JSON，原始内容:", text);
      return NextResponse.json(
        { error: "AI 返回格式不正确，请重试" },
        { status: 500 },
      );
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(jsonStr);
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("分析错误:", e);
    const msg = e instanceof Error ? e.message : "分析失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
