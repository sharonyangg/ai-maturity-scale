import { DIMENSION_LABELS, DIMENSION_ORDER, DIMENSION_WEIGHTS } from "@/lib/scoring/dimensions";
import type { DimensionKey } from "@/lib/scoring/types";

function DeltaBadge({ delta }: { delta: number }) {
  const rounded = Math.round(delta);
  if (Math.abs(rounded) < 1) {
    return <span className="rounded-full bg-gray-200 px-2 py-0.5 text-sm font-medium text-gray-500">持平</span>;
  }
  const positive = rounded > 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-sm font-medium ${
        positive ? "bg-olive-900/10 text-olive-700" : "bg-red-100 text-red-600"
      }`}
    >
      {positive ? "▲" : "▼"} {Math.abs(rounded)}
    </span>
  );
}

export function DimensionBreakdown({
  scores,
  prevScores,
  weights = DIMENSION_WEIGHTS,
}: {
  scores: Record<DimensionKey, number>;
  prevScores?: Record<DimensionKey, number>;
  weights?: Record<DimensionKey, number>;
}) {
  return (
    <div className="space-y-4">
      {DIMENSION_ORDER.map((dim, i) => {
        const score = Math.min(100, Math.round(scores[dim]));
        return (
          <div key={dim} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="mb-1 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
              <span className="flex items-baseline gap-1.5">
                <span className="text-lg font-medium text-black">{DIMENSION_LABELS[dim]}</span>
                <span className="rounded-full bg-olive-900/5 px-1.5 py-0.5 text-base text-gray-500">
                  權重 {Math.round(weights[dim] * 100)}%
                </span>
              </span>
              <span className="flex items-baseline gap-2">
                {prevScores && <DeltaBadge delta={score - Math.min(100, Math.round(prevScores[dim]))} />}
                <span className="text-3xl leading-none font-bold tabular-nums text-olive-700">
                  {score}
                  <span className="text-base font-medium text-gray-400">%</span>
                </span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[#eae4c8]">
              <div
                className="h-2.5 rounded-full bg-gold-500 transition-all duration-700 ease-out"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
