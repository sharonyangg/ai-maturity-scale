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

export function DimensionRadarChart({ scores }: { scores: Record<DimensionKey, number> }) {
  const data = DIMENSION_ORDER.map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    score: Math.min(100, Math.round(scores[dim])),
  }));

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 13 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="成熟度分數"
            dataKey="score"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
