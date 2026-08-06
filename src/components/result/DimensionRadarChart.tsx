"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/scoring/dimensions";
import type { DimensionKey } from "@/lib/scoring/types";

interface DimensionRadarChartProps {
  scores: Record<DimensionKey, number>;
  /** 掛在圖表外層容器上，供下載 Word 報告時抓取內部渲染出的 <svg> 轉成圖片 */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function DimensionRadarChart({ scores, containerRef }: DimensionRadarChartProps) {
  const data = DIMENSION_ORDER.map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    score: Math.min(100, Math.round(scores[dim])),
  }));

  return (
    <div ref={containerRef} className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#047857" stopOpacity={0.25} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="#e1e0d9" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 15, fill: "#0b0b0b" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12, fill: "#898781" }} />
          <Radar
            name="成熟度分數"
            dataKey="score"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#radarFill)"
            animationDuration={700}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
