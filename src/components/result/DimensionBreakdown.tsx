import { DIMENSION_LABELS, DIMENSION_ORDER, DIMENSION_WEIGHTS } from "@/lib/scoring/dimensions";
import type { DimensionKey } from "@/lib/scoring/types";

export function DimensionBreakdown({ scores }: { scores: Record<DimensionKey, number> }) {
  return (
    <div className="space-y-4">
      {DIMENSION_ORDER.map((dim, i) => {
        const score = Math.min(100, Math.round(scores[dim]));
        return (
          <div key={dim} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="mb-1 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
              <span className="flex items-baseline gap-1.5">
                <span className="text-lg font-medium text-black">{DIMENSION_LABELS[dim]}</span>
                <span className="rounded-full bg-emerald-900/5 px-1.5 py-0.5 text-base text-gray-500">
                  權重 {DIMENSION_WEIGHTS[dim] * 100}%
                </span>
              </span>
              <span className="text-3xl leading-none font-bold tabular-nums text-emerald-700">
                {score}
                <span className="text-base font-medium text-gray-400">%</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[#e1e0d9]">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700 transition-all duration-700 ease-out"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
