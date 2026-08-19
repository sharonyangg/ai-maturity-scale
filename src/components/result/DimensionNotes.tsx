import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/scoring/dimensions";
import type { DimensionKey } from "@/lib/scoring/types";

export function DimensionNotes({ notes }: { notes: Record<DimensionKey, string> }) {
  return (
    <div className="space-y-4">
      {DIMENSION_ORDER.map((dim) => (
        <div key={dim}>
          <p className="mb-1 text-xl font-semibold text-slate-700">{DIMENSION_LABELS[dim]}</p>
          <p className="text-lg leading-relaxed text-slate-600">{notes[dim]}</p>
        </div>
      ))}
    </div>
  );
}
