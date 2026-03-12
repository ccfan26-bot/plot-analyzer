"use client";

import { useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Character, Relationship } from "@/lib/types";

interface CharacterGraphProps {
  characters: Character[];
  relationships: Relationship[];
}

const roleColors: Record<string, string> = {
  主角: "#DBEAFE",
  配角: "#D1FAE5",
  反派: "#FEE2E2",
  其他: "#F3F4F6",
};

export default function CharacterGraph({
  characters,
  relationships,
}: CharacterGraphProps) {
  const nodes: Node[] = useMemo(() => {
    const total = characters.length;
    const radius = Math.max(160, total * 40);
    return characters.map((char, i) => {
      const angle = (2 * Math.PI * i) / total - Math.PI / 2;
      return {
        id: char.id,
        position: {
          x: 300 + radius * Math.cos(angle),
          y: 250 + radius * Math.sin(angle),
        },
        data: {
          label: (
            <div className="text-center px-1">
              <div className="font-bold text-xs">{char.name}</div>
              <div className="text-gray-500 text-xs">{char.role}</div>
            </div>
          ),
        },
        style: {
          background: roleColors[char.role] || roleColors["其他"],
          border: "2px solid #93C5FD",
          borderRadius: "12px",
          padding: "6px 10px",
          minWidth: "70px",
          fontSize: "12px",
        },
      };
    });
  }, [characters]);

  const edges: Edge[] = useMemo(
    () =>
      relationships.map((rel, i) => ({
        id: `e${i}`,
        source: rel.source,
        target: rel.target,
        label: rel.type,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#9CA3AF" },
        style: { stroke: "#9CA3AF" },
        labelStyle: { fontSize: 10, fill: "#374151" },
        labelBgStyle: { fill: "#F9FAFB", opacity: 0.8 },
      })),
    [relationships],
  );

  if (characters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        暂无人物数据
      </div>
    );
  }

  return (
    <div
      style={{ height: 520 }}
      className="rounded-lg border border-gray-200 overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
      >
        <Background color="#F3F4F6" gap={20} />
        <Controls />
      </ReactFlow>
      {/* 图例 */}
      <div className="flex gap-4 px-4 py-2 bg-gray-50 border-t border-gray-200">
        {Object.entries(roleColors).map(([role, color]) => (
          <div key={role} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ background: color, border: "1px solid #93C5FD" }}
            />
            <span className="text-xs text-gray-600">{role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
