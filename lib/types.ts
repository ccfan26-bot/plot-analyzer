export type Medium = "book" | "movie" | "play" | "game";
export type ManuscriptStyle =
  | "storytelling"
  | "academic"
  | "casual"
  | "critical"
  | "teaching";
export type Stage = "opening" | "development" | "climax" | "ending";

export interface WorkInfo {
  title: string;
  // AI 自行判断是否找到正确作品
  // 用户用译名输入、AI 返回原文名 → 属正常翻译，填 true
  // 真正找不到、找错、存在歧义时才填 false
  titleConfirmed?: boolean;
  author?: string;
  publishYear?: string;
  director?: string;
  releaseDate?: string;
  mainActors?: string[];
  publisher?: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface Relationship {
  source: string;
  target: string;
  type: string;
  description: string;
}

export interface TimelineEvent {
  id: string;
  stage: Stage;
  title: string;
  description: string;
  order: number;
}

export interface PlotPoint {
  stage: Stage;
  title: string;
  events: string[];
}

export interface AnalysisResult {
  title: string;
  medium: Medium;
  genre: string;
  workInfo?: WorkInfo;
  characters: Character[];
  relationships: Relationship[];
  plotPoints: PlotPoint[];
  timeline: TimelineEvent[];
  themes: string[];
  setting: string;
  tone: string;
}

export interface ManuscriptResult {
  content: string;
  wordCount: number;
  style: string;
}
