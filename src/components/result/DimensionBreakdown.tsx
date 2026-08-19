import { DIMENSION_LABELS, DIMENSION_ORDER, DIMENSION_WEIGHTS } from "@/lib/scoring/dimensions";
import type { DimensionKey } from "@/lib/scoring/types";

function DeltaBadge({ delta }: { delta: number }) {
  const rounded = Math.round(delta);
  if (Math.abs(rounded) < 1) {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-500">持平</span>;
  }
  const positive = rounded > 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-sm font-medium ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-red-100 text-red-600"
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
                <span className="text-lg font-medium text-slate-700">{DIMENSION_LABELS[dim]}</span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-base text-slate-500">
                  權重 {Math.round(weights[dim] * 100)}%
                </span>
              </span>
              <span className="flex items-baseline gap-2">
                {prevScores && <DeltaBadge delta={score - Math.min(100, Math.round(prevScores[dim]))} />}
                <span className="text-3xl leading-none font-bold tabular-nums text-sky-700">
                  {score}
                  <span className="text-base font-medium text-slate-400">%</span>
                </span>
              </span>
            </div>
            <div className="h-4 rounded-full border border-white/60 bg-white/50 shadow-inner backdrop-blur-md">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-rose-300 via-sky-300 to-violet-300 shadow-[inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
