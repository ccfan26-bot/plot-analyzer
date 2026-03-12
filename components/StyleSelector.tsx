"use client";

import type { ManuscriptStyle } from "@/lib/types";

interface StyleSelectorProps {
  selected: ManuscriptStyle;
  onChange: (style: ManuscriptStyle) => void;
}

const styles: { value: ManuscriptStyle; label: string; desc: string }[] = [
  { value: "storytelling", label: "故事体", desc: "情节生动，适合传播" },
  { value: "academic", label: "学术分析", desc: "严谨客观，有论有据" },
  { value: "casual", label: "随笔", desc: "轻松自然，带个人色彩" },
  { value: "critical", label: "评论体", desc: "影评/书评，有深度" },
  { value: "teaching", label: "教学解析", desc: "层次清晰，适合科普" },
];

export default function StyleSelector({
  selected,
  onChange,
}: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {styles.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`flex items-center justify-between p-3 rounded-lg border-2 text-left transition-colors ${
            selected === s.value
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span
            className={`font-medium text-sm ${selected === s.value ? "text-blue-700" : "text-gray-800"}`}
          >
            {s.label}
          </span>
          <span className="text-xs text-gray-500">{s.desc}</span>
        </button>
      ))}
    </div>
  );
}
