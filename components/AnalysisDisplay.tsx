"use client";

import type { AnalysisResult } from "@/lib/types";

const mediumLabels = {
  book: "书籍/小说",
  movie: "电影/剧集",
  play: "舞台剧",
  game: "游戏/视觉小说",
};

export default function AnalysisDisplay({
  analysis,
}: {
  analysis: AnalysisResult;
}) {
  return (
    <div className="space-y-5">
      {/* 标题行 */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold text-gray-900">{analysis.title}</h2>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
          {analysis.genre}
        </span>
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
          {mediumLabels[analysis.medium]}
        </span>
      </div>

      {/* 背景 & 基调 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">故事背景</p>
          <p className="text-sm text-gray-700">{analysis.setting}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">叙事基调</p>
          <p className="text-sm text-gray-700">{analysis.tone}</p>
        </div>
      </div>

      {/* 核心主题 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">核心主题</p>
        <div className="flex flex-wrap gap-2">
          {analysis.themes.map((theme, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* 主要角色 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">主要角色</p>
        <div className="space-y-2">
          {analysis.characters.map((char) => (
            <div key={char.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-800">
                  {char.name}
                </span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {char.role}
                </span>
              </div>
              <p className="text-xs text-gray-600">{char.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
