import { DIMENSION_LABELS, DIMENSION_ORDER, DIMENSION_WEIGHTS } from "@/lib/scoring/dimensions";
import type { DimensionKey } from "@/lib/scoring/types";

export function DimensionBreakdown({ scores }: { scores: Record<DimensionKey, number> }) {
  return (
    <div className="space-y-4">
      {DIMENSION_ORDER.map((dim) => {
        const score = Math.min(100, Math.round(scores[dim]));
        return (
          <div key={dim}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-black">
                {DIMENSION_LABELS[dim]}
                <span className="ml-1 text-xs text-gray-500">
                  （加權占比 {DIMENSION_WEIGHTS[dim] * 100}%）
                </span>
              </span>
              <span className="text-black">{score}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
