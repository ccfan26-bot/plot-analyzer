"use client";

import { useState } from "react";
import type { ManuscriptResult } from "@/lib/types";

const styleLabels: Record<string, string> = {
  storytelling: "故事体",
  academic: "学术分析",
  casual: "随笔",
  critical: "评论体",
  teaching: "教学解析",
};

export default function ManuscriptDisplay({
  manuscript,
}: {
  manuscript: ManuscriptResult;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(manuscript.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
            {styleLabels[manuscript.style] || manuscript.style}
          </span>
          <span className="text-xs text-gray-500">
            {manuscript.wordCount} 字
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          {copied ? "已复制 ✓" : "复制全文"}
        </button>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg max-h-120 overflow-y-auto">
        {" "}
        {/* ← max-h-120 */}
        <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">
          {manuscript.content}
        </pre>
      </div>
    </div>
  );
}
