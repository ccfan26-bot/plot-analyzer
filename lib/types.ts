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
  author?: string; // book
  publishYear?: string; // book
  director?: string; // movie / play
  releaseDate?: string; // movie / game
  mainActors?: string[]; // movie（两位主演）
  publisher?: string; // game
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
