"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/scoring/dimensions";
import type { DimensionKey } from "@/lib/scoring/types";

interface DimensionRadarChartProps {
  scores: Record<DimensionKey, number>;
  prevScores?: Record<DimensionKey, number>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

interface TooltipPayloadEntry {
  name: string;
  color: string;
  value: number;
  payload: { dimension: string };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const dimension = payload[0].payload.dimension;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-lg shadow-[0_4px_16px_rgba(15,23,42,0.15)]">
      <span className="font-medium text-black">{dimension}</span>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="text-base" style={{ color: entry.color }}>
            {entry.name}
          </span>
          <span className="font-bold" style={{ color: entry.color }}>
            {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function DimensionRadarChart({ scores, prevScores, containerRef }: DimensionRadarChartProps) {
  const data = DIMENSION_ORDER.map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    current: Math.min(100, Math.round(scores[dim])),
    prev: prevScores ? Math.min(100, Math.round(prevScores[dim])) : undefined,
  }));

  return (
    <div ref={containerRef} className="h-80 w-full sm:h-[26rem]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="58%">
          <PolarGrid stroke="#ddd6b8" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 18, fontWeight: 600, fill: "#1f2937" }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend height={32} wrapperStyle={{ fontSize: 14, color: "#3d4e17" }} />
          {prevScores && (
            <Radar
              name="前測（Baseline）"
              dataKey="prev"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="4 3"
              fill="#9ca3af"
              fillOpacity={0.15}
              dot={{ r: 3, fill: "#9ca3af", stroke: "#ffffff", strokeWidth: 1.5 }}
              animationDuration={900}
              animationEasing="ease-out"
            />
          )}
          <Radar
            name={prevScores ? "後測（Post-test）" : "前測（Baseline）"}
            dataKey="current"
            stroke="#3d4e17"
            strokeWidth={2.5}
            fill="#c7a003"
            fillOpacity={0.35}
            dot={{ r: 4, fill: "#3d4e17", stroke: "#ffffff", strokeWidth: 2 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
