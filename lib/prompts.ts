import type { AnalysisResult, Medium, ManuscriptStyle } from "./types";

function getMediumLabel(medium: Medium): string {
  const labels = {
    book: "书籍/小说",
    movie: "电影/剧集",
    play: "舞台剧/话剧",
    game: "游戏/视觉小说",
  };
  return labels[medium];
}

function getWorkInfoSchema(medium: Medium): string {
  const schemas = {
    book: `{"title":"该书原文标题（英文原著填英文名）","author":"作者全名","publishYear":"出版年份如1971","titleConfirmed":true}`,
    movie: `{"title":"该片原文标题","director":"导演姓名","releaseDate":"上映日期如2019-03","mainActors":["主演1","主演2"],"titleConfirmed":true}`,
    game: `{"title":"该游戏原文标题","publisher":"开发/发行商名称","releaseDate":"发行日期如2023-06","titleConfirmed":true}`,
    play: `{"title":"该剧原文标题","director":"导演姓名","titleConfirmed":true}`,
  };
  return schemas[medium];
}

function getStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    storytelling: "故事体，情节生动，适合传播和阅读，注重代入感",
    academic: "学术分析体，客观严谨，有论点论据，适合研究报告",
    casual: "随笔风格，读来自然，富有个人情感和口语化表达",
    critical: "评论体（差评/好评），有观点有深度，兼顾分析与评价",
    teaching: "教学解析体，层次清晰，适合课堂讲解或科普读物",
  };
  return descriptions[style] || style;
}

export const ANALYZE_PROMPT = (input: string, medium: Medium) =>
  `
分析以下${getMediumLabel(medium)}，直接输出JSON，不要markdown或任何说明。

${input}

{"title":"该作品最常用的名称（有中文译名则填中文译名，如《豺的日子》；无则填原文标题；绝对不能填用户的输入描述）","medium":"${medium}","genre":"类型","workInfo":${getWorkInfoSchema(medium)},"characters":[{"id":"c1","name":"姓名","role":"主角/配角/反派/其他","description":"简介50字内"}],"relationships":[{"source":"c1","target":"c2","type":"朋友/敌人/情人/亲人/师徒/同僚","description":"说明"}],"plotPoints":[{"stage":"opening","title":"开篇","events":["事件"]},{"stage":"development","title":"发展","events":["事件"]},{"stage":"climax","title":"高潮","events":["事件"]},{"stage":"ending","title":"结局","events":["事件"]}],"timeline":[{"id":"e1","stage":"opening","title":"标题","description":"详情","order":1}],"themes":["主题"],"setting":"背景","tone":"基调"}

严格规则：
1. relationships的source/target必须使用characters中的id字段值
2. timeline按时间顺序输出8-12个事件，须覆盖全部4个阶段
3. workInfo必须对应用户所描述/指定的这部作品本身，禁止替换为同作者/同系列的其他作品
4. workInfo.title填写该作品的原文标题（英文/日文等原语言），publishYear/releaseDate必须与该作品一致
5. title字段规则（重要）：
   - 用户输入的是标题（如"肖申克的救赎"、"The Shawshank Redemption"）→ 填该作品最通用的中文译名或原文标题
   - 用户输入的是描述性文字（如"关于一个杀手的故事，英国作者..."）→ AI根据描述识别作品后，填该作品的通用标题
   - 无论如何，title字段必须是一个干净的作品名称，绝对不能把用户输入的描述性文字原样填入
6. titleConfirmed判断规则：
   - 成功识别到用户所指作品 → true（不论用户用何种语言输入，不论title与用户输入语言是否相同）
   - 真正找不到、找错、或存在严重歧义无法确定时 → false
`.trim();

export const MANUSCRIPT_PROMPT = (
  analysis: AnalysisResult,
  style: string,
  extraRequirements?: string,
) => `
你是一位专业的文字创作者。请根据以下分析结果，以「${getStyleDescription(style)}」风格创作一篇稿件。

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
你是一位专业的文字改编者。请将以下稿件改写为「${getStyleDescription(style)}」风格。

原稿：
${originalManuscript}

风格要求：${getStyleDescription(style)}
${extraRequirements ? `额外要求：${extraRequirements}` : ""}

请直接输出改写后的正文，不需要任何说明。
`;
