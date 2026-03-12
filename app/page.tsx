"use client";

import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import PlotInput from "@/components/PlotInput";
import StyleSelector from "@/components/StyleSelector";
import AnalysisDisplay from "@/components/AnalysisDisplay";
import ManuscriptDisplay from "@/components/ManuscriptDisplay";
import Timeline from "@/components/Timeline";

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

  const handleAnalyze = async (input: string) => {
    setAnalysisLoading(true);
    setError("");
    setAnalysis(null);
    setManuscript(null);
    setActiveTab("analysis");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, medium }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
    } catch (e: unknown) {
      // ← unknown
      const msg = e instanceof Error ? e.message : "分析失败，请重试";
      setError(msg);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!analysis) return;
    setManuscriptLoading(true);
    setError("");

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setManuscript(data);
      setActiveTab("manuscript");
    } catch (e: unknown) {
      // ← unknown
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setManuscript(data);
    } catch (e: unknown) {
      // ← unknown
      const msg = e instanceof Error ? e.message : "改写失败，请重试";
      setError(msg);
    } finally {
      setManuscriptLoading(false);
    }
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

          <div className="lg:col-span-2">
            {analysisLoading && (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 text-sm">正在分析作品，请稍候...</p>
              </div>
            )}

            {!analysisLoading && analysis && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                        // ← shrink-0
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
