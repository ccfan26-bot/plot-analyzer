"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import PlotInput from "@/components/PlotInput";
import StyleSelector from "@/components/StyleSelector";
import AnalysisDisplay from "@/components/AnalysisDisplay";
import ManuscriptDisplay from "@/components/ManuscriptDisplay";
import Timeline from "@/components/Timeline";
import type { Medium } from "@/lib/types";

const CharacterGraph = dynamic(() => import("@/components/CharacterGraph"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      加载中...
    </div>
  ),
});

type TabId = "analysis" | "timeline" | "characters" | "manuscript";

const tabs: { id: TabId; label: string }[] = [
  { id: "analysis", label: "📋 分析概览" },
  { id: "timeline", label: "📅 时间线" },
  { id: "characters", label: "🕸️ 人物关系" },
  { id: "manuscript", label: "✍️ 生成稿件" },
];

const mediumIcons: Record<Medium, string> = {
  book: "📕",
  movie: "🎬",
  game: "🎮",
  play: "🎭",
};

export default function Home() {
  const {
    analysis,
    setAnalysis,
    manuscript,
    setManuscript,
    medium,
    style,
    setStyle,
    extraRequirements,
    setExtraRequirements,
    analysisLoading,
    setAnalysisLoading,
    manuscriptLoading,
    setManuscriptLoading,
    error,
    setError,
    activeTab,
    setActiveTab,
  } = useAppStore();

  // 补充信息相关状态
  const [lastInput, setLastInput] = useState("");
  const [showCorrection, setShowCorrection] = useState(false);
  const [correction, setCorrection] = useState("");

  const handleAnalyze = async (input: string) => {
    setAnalysisLoading(true);
    setError("");
    setAnalysis(null);
    setManuscript(null);
    setActiveTab("analysis");
    setShowCorrection(false);
    setLastInput(input);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, medium }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
      }

      const cleaned = fullText.replace(/```json\n?|\n?```/g, "").trim();
      const result = JSON.parse(cleaned);
      setAnalysis(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "分析失败，请重试";
      setError(msg);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 用户补充信息后重新分析
  const handleCorrect = () => {
    if (!correction.trim()) return;
    const combined = `${lastInput}\n\n[用户补充信息]: ${correction}`;
    setCorrection("");
    handleAnalyze(combined);
  };

  const handleGenerate = async () => {
    if (!analysis) return;
    setManuscriptLoading(true);
    setError("");
    setManuscript(null);
    setActiveTab("manuscript");

    try {
      const res = await fetch("/api/manuscript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          analysis,
          style,
          extraRequirements,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      setManuscriptLoading(false);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setManuscript({
            content: fullText,
            wordCount: fullText.replace(/\s/g, "").length,
            style,
          });
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "生成失败，请重试";
      setError(msg);
    } finally {
      setManuscriptLoading(false);
    }
  };

  const handleRestyle = async () => {
    if (!manuscript) return;
    setManuscriptLoading(true);
    setError("");

    try {
      const res = await fetch("/api/manuscript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restyle",
          originalManuscript: manuscript.content,
          style,
          extraRequirements,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      setManuscriptLoading(false);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setManuscript({
            content: fullText,
            wordCount: fullText.replace(/\s/g, "").length,
            style,
          });
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "改写失败，请重试";
      setError(msg);
    } finally {
      setManuscriptLoading(false);
    }
  };

  // 渲染作品基本信息行
  const renderWorkInfoLine = () => {
    if (!analysis?.workInfo) return null;
    const w = analysis.workInfo;
    const icon = mediumIcons[analysis.medium] || "📖";

    const parts: string[] = [];
    if (w.author) parts.push(`作者：${w.author}`);
    if (w.publishYear) parts.push(`${w.publishYear} 年`);
    if (w.director) parts.push(`导演：${w.director}`);
    if (w.releaseDate) parts.push(`${w.releaseDate}`);
    if (w.mainActors?.length) parts.push(`主演：${w.mainActors.join("、")}`);
    if (w.publisher) parts.push(`出品：${w.publisher}`);

    return (
      <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
        {/* 作品信息行 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-blue-900">
              <span className="mr-1">{icon}</span>
              <span className="font-semibold">{w.title}</span>
              {parts.length > 0 && (
                <span className="text-blue-600 ml-2">{parts.join(" · ")}</span>
              )}
            </p>
            <p className="text-xs text-blue-500 mt-0.5">
              以上为 AI 识别到的作品信息，请确认是否正确
            </p>
          </div>
          <button
            onClick={() => setShowCorrection(!showCorrection)}
            className="shrink-0 text-xs px-2.5 py-1 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            {showCorrection ? "取消" : "不是这部作品？"}
          </button>
        </div>

        {/* 补充信息输入区 */}
        {showCorrection && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700 mb-2">
              请补充更多信息帮助 AI
              找到正确作品，例如：出版年份、作者名、导演、主演、原著名等
            </p>
            <textarea
              value={correction}
              onChange={(e) => setCorrection(e.target.value)}
              placeholder="如：是2019年上映的，导演是诺兰 / 作者是村上春树，1987年出版 / 是FromSoftware开发的..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCorrect}
                disabled={!correction.trim() || analysisLoading}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🔍 重新查找
              </button>
              <button
                onClick={() => {
                  setShowCorrection(false);
                  setCorrection("");
                }}
                className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            剧情分析 & 稿件生成
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            输入作品信息，AI 自动分析人物关系、时间线并生成多风格稿件
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左栏 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                输入作品信息
              </h2>
              <PlotInput onAnalyze={handleAnalyze} />
            </div>

            {analysis && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                  稿件设置
                </h2>
                <StyleSelector selected={style} onChange={setStyle} />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    额外要求（可选）
                  </label>
                  <textarea
                    value={extraRequirements}
                    onChange={(e) => setExtraRequirements(e.target.value)}
                    placeholder="如：多用对话、增加悬念感..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={manuscriptLoading}
                  className="mt-4 w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {manuscriptLoading ? "生成中..." : "✍️ 生成稿件"}
                </button>
              </div>
            )}
          </div>

          {/* 右栏 */}
          <div className="lg:col-span-2">
            {analysisLoading && (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 text-sm">正在分析作品，请稍候...</p>
              </div>
            )}

            {!analysisLoading && analysis && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* 作品基本信息 + 纠错区 */}
                {renderWorkInfoLine()}

                {/* Tabs */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "analysis" && (
                    <AnalysisDisplay analysis={analysis} />
                  )}
                  {activeTab === "timeline" && (
                    <Timeline
                      plotPoints={analysis.plotPoints}
                      timeline={analysis.timeline}
                    />
                  )}
                  {activeTab === "characters" && (
                    <CharacterGraph
                      characters={analysis.characters}
                      relationships={analysis.relationships}
                    />
                  )}
                  {activeTab === "manuscript" && (
                    <div className="space-y-4">
                      {manuscriptLoading && (
                        <div className="text-center py-8">
                          <div className="inline-block w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-gray-500 text-sm">稿件生成中...</p>
                        </div>
                      )}
                      {!manuscriptLoading && manuscript && (
                        <>
                          <ManuscriptDisplay manuscript={manuscript} />
                          <button
                            onClick={handleRestyle}
                            disabled={manuscriptLoading}
                            className="w-full py-2 border-2 border-blue-500 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
                          >
                            🔄 换当前风格重新改写
                          </button>
                        </>
                      )}
                      {!manuscriptLoading && !manuscript && (
                        <div className="text-center py-12 text-gray-400 text-sm">
                          在左侧选择风格后点击「生成稿件」
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!analysisLoading && !analysis && (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">📖</div>
                <p className="text-sm">在左侧输入作品信息，开始分析</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
