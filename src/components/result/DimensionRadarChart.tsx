"use client";

import {
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
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: { dimension: string; score: number } }[] }) {
  if (!active || !payload?.length) return null;
  const { dimension, score } = payload[0].payload;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-lg shadow-[0_4px_16px_rgba(15,23,42,0.15)]">
      <span className="font-medium text-black">{dimension}</span>
      <span className="ml-2 font-bold text-emerald-700">{score}%</span>
    </div>
  );
}

export function DimensionRadarChart({ scores, containerRef }: DimensionRadarChartProps) {
  const data = DIMENSION_ORDER.map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    score: Math.min(100, Math.round(scores[dim])),
  }));

  return (
    <div ref={containerRef} className="h-80 w-full sm:h-[26rem]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="58%">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#047857" stopOpacity={0.3} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="#d7ded9" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 18, fontWeight: 600, fill: "#1f2937" }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Radar
            name="成熟度分數"
            dataKey="score"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#radarFill)"
            dot={{ r: 4, fill: "#047857", stroke: "#ffffff", strokeWidth: 2 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
