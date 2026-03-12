import type { AnalysisResult, Medium, ManuscriptStyle } from "./types";

function getMediumLabel(medium: Medium): string {
  const labels = { book: "书籍/小说", movie: "电影/剧集", play: "舞台剧/话剧" };
  return labels[medium];
}

function getStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    storytelling: "故事体，情节生动，适合传播和阅读，注重代入感",
    academic: "学术分析体，客观严谨，有论点论据，适合研究报告",
    casual: "随笔风格，轻松自然，带有个人情感和口语化表达",
    critical: "评论体（影评/书评），有观点有深度，兼顾分析与评价",
    teaching: "教学解析体，层次清晰，适合课堂讲解或科普读物",
  };
  return descriptions[style] || style;
}

export const ANALYZE_PROMPT = (input: string, medium: Medium) => `
你是一位专业的文学分析师。请深度分析以下作品，以纯 JSON 格式输出。
禁止使用 markdown 代码块，禁止任何额外说明，直接输出 JSON。

作品类型：${getMediumLabel(medium)}
作品信息：
${input}

输出格式：
{
  "title": "作品标题（若未提供则根据内容推断）",
  "medium": "${medium}",
  "genre": "作品类型（如悬疑、言情、科幻、历史等）",
  "characters": [
    { "id": "c1", "name": "姓名", "role": "主角/配角/反派/其他", "description": "人物简介50字内" }
  ],
  "relationships": [
    { "source": "c1", "target": "c2", "type": "关系类型（朋友/敌人/恋人/亲人/师徒/同事）", "description": "关系说明" }
  ],
  "plotPoints": [
    { "stage": "opening",     "title": "开端", "events": ["事件1", "事件2"] },
    { "stage": "development", "title": "发展", "events": ["事件1", "事件2"] },
    { "stage": "climax",      "title": "高潮", "events": ["事件1", "事件2"] },
    { "stage": "ending",      "title": "结局", "events": ["事件1", "事件2"] }
  ],
  "timeline": [
    { "id": "e1", "stage": "opening", "title": "事件标题", "description": "事件详情", "order": 1 }
  ],
  "themes": ["主题1", "主题2"],
  "setting": "时代背景与地理环境",
  "tone": "叙事风格与情感基调"
}

要求：
- relationships 中 source/target 必须是 characters 中已有的 id
- timeline 按时间顺序排列，共 8-12 个事件，覆盖全部4个阶段
- plotPoints 必须包含全部4个阶段
`;

export const MANUSCRIPT_PROMPT = (
  analysis: AnalysisResult,
  style: string,
  extraRequirements?: string,
) => `
你是一位专业的文学创作者。请根据以下分析结果，以「${getStyleDescription(style)}」风格创作一篇稿件。

作品信息：
- 标题：${analysis.title}
- 类型：${analysis.genre}（${getMediumLabel(analysis.medium)}）
- 背景：${analysis.setting}
- 基调：${analysis.tone}
- 核心主题：${analysis.themes.join("、")}
- 主要人物：${analysis.characters.map((c) => `${c.name}（${c.role}）：${c.description}`).join("；")}
- 情节脉络：
  ${analysis.plotPoints.map((p) => `【${p.title}】${p.events.join("，")}`).join("\n  ")}

风格要求：${getStyleDescription(style)}
${extraRequirements ? `额外要求：${extraRequirements}` : ""}

请直接输出稿件正文，不需要标题和任何说明。
`;

export const RESTYLE_PROMPT = (
  originalManuscript: string,
  style: ManuscriptStyle,
  extraRequirements?: string,
) => `
你是一位专业的文学改编者。请将以下稿件改写为「${getStyleDescription(style)}」风格。

原稿：
${originalManuscript}

风格要求：${getStyleDescription(style)}
${extraRequirements ? `额外要求：${extraRequirements}` : ""}

请直接输出改写后的正文，不需要任何说明。
`;
