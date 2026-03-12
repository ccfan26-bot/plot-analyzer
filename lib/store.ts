import { create } from 'zustand';
import type { AnalysisResult, ManuscriptResult, ManuscriptStyle, Medium } from './types';

type ActiveTab = 'analysis' | 'timeline' | 'characters' | 'manuscript';

interface AppState {
  // 数据
  analysis: AnalysisResult | null;
  manuscript: ManuscriptResult | null;

  // 设置
  medium: Medium;
  style: ManuscriptStyle;
  extraRequirements: string;

  // UI
  analysisLoading: boolean;
  manuscriptLoading: boolean;
  error: string;
  activeTab: ActiveTab;

  // Actions
  setAnalysis: (v: AnalysisResult | null) => void;
  setManuscript: (v: ManuscriptResult | null) => void;
  setMedium: (v: Medium) => void;
  setStyle: (v: ManuscriptStyle) => void;
  setExtraRequirements: (v: string) => void;
  setAnalysisLoading: (v: boolean) => void;
  setManuscriptLoading: (v: boolean) => void;
  setError: (v: string) => void;
  setActiveTab: (v: ActiveTab) => void;
}

export const useAppStore = create<AppState>((set) => ({
  analysis: null,
  manuscript: null,
  medium: 'book',
  style: 'storytelling',
  extraRequirements: '',
  analysisLoading: false,
  manuscriptLoading: false,
  error: '',
  activeTab: 'analysis',

  setAnalysis: (analysis) => set({ analysis }),
  setManuscript: (manuscript) => set({ manuscript }),
  setMedium: (medium) => set({ medium }),
  setStyle: (style) => set({ style }),
  setExtraRequirements: (extraRequirements) => set({ extraRequirements }),
  setAnalysisLoading: (analysisLoading) => set({ analysisLoading }),
  setManuscriptLoading: (manuscriptLoading) => set({ manuscriptLoading }),
  setError: (error) => set({ error }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));