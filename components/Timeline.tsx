"use client";

import type { PlotPoint, TimelineEvent } from "@/lib/types";

const stageConfig = {
  opening: {
    label: "开端",
    dot: "bg-blue-400",
    tag: "bg-blue-50 text-blue-700",
    border: "border-blue-300",
  },
  development: {
    label: "发展",
    dot: "bg-yellow-400",
    tag: "bg-yellow-50 text-yellow-700",
    border: "border-yellow-300",
  },
  climax: {
    label: "高潮",
    dot: "bg-red-400",
    tag: "bg-red-50 text-red-700",
    border: "border-red-300",
  },
  ending: {
    label: "结局",
    dot: "bg-green-400",
    tag: "bg-green-50 text-green-700",
    border: "border-green-300",
  },
};

interface TimelineProps {
  plotPoints: PlotPoint[];
  timeline: TimelineEvent[];
}

export default function Timeline({ plotPoints, timeline }: TimelineProps) {
  const stages = ["opening", "development", "climax", "ending"] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((stage) => {
          const config = stageConfig[stage];
          const point = plotPoints.find((p) => p.stage === stage);
          return (
            <div
              key={stage}
              className={`border ${config.border} rounded-lg p-3`}
            >
              <div
                className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${config.tag}`}
              >
                {config.label}
              </div>
              <ul className="space-y-1">
                {point?.events.map((event, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${config.dot} mt-1.5 shrink-0`}
                    />{" "}
                    {/* ← shrink-0 */}
                    <span className="text-xs text-gray-600">{event}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500 mb-3">事件时间线</p>
        <div className="space-y-2">
          {[...timeline]
            .sort((a, b) => a.order - b.order)
            .map((event, idx, arr) => {
              const config = stageConfig[event.stage];
              return (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${config.dot} shrink-0 mt-1`}
                    />{" "}
                    {/* ← shrink-0 */}
                    {idx < arr.length - 1 && (
                      <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                    )}
                  </div>
                  <div className="pb-3 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${config.tag}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {event.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{event.description}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
