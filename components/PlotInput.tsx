'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { Medium } from '@/lib/types';

interface PlotInputProps {
  onAnalyze: (input: string) => void;
}

const mediums: { value: Medium; label: string; icon: string }[] = [
  { value: 'book',  label: '书籍/小说', icon: '📚' },
  { value: 'movie', label: '电影/剧集', icon: '🎬' },
  { value: 'play',  label: '舞台剧',    icon: '🎭' },
];

export default function PlotInput({ onAnalyze }: PlotInputProps) {
  const [input, setInput] = useState('');
  const { medium, setMedium, analysisLoading } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onAnalyze(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 作品类型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">作品类型</label>
        <div className="flex gap-2">
          {mediums.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMedium(m.value)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                medium === m.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 文本输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          作品信息
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入故事情节、人物设定、背景等信息，越详细分析越准确..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={analysisLoading || !input.trim()}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {analysisLoading ? '分析中...' : '🔍 开始分析'}
      </button>
    </form>
  );
}