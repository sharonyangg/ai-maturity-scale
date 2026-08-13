import Link from "next/link";
import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  DIMENSION_WEIGHTS,
  LEVEL_COLORS,
  LEVEL_DESCRIPTIONS,
  LEVEL_NAMES,
  LEVEL_THRESHOLDS,
} from "@/lib/scoring/dimensions";
import type { Level } from "@/lib/scoring/types";

const CARD_CLASS =
  "animate-fade-up rounded-2xl bg-[#f7faf8] p-5 shadow-[0_2px_16px_rgba(15,23,42,0.08)] sm:p-6";

const LEVELS: Level[] = [1, 2, 3, 4];
const MAX_WEIGHT = Math.max(...Object.values(DIMENSION_WEIGHTS));

/** 依 LEVEL_THRESHOLDS 換算成給使用者看的分數區間 */
function levelScoreRange(level: Level): string {
  const [t1, t2, t3] = LEVEL_THRESHOLDS;
  if (level === 1) return `0 ~ ${Math.round(t1)} 分`;
  if (level === 2) return `${Math.round(t1) + 1} ~ ${Math.round(t2)} 分`;
  if (level === 3) return `${Math.round(t2) + 1} ~ ${Math.round(t3)} 分`;
  return `${Math.round(t3) + 1} ~ 100 分`;
}

export default function ScoringGuidePage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-fade-up text-center">
          <h1 className="text-4xl font-bold text-slate-900">評分說明</h1>
          <p className="mt-2 text-lg text-slate-500">了解本量表如何從您的作答算出分數與等級</p>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "80ms" }}>
          <h2 className="mb-3 text-2xl font-semibold text-black">五大構面與權重</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-600">
            問卷的 20 道題目平均分屬五個構面（每構面 4 題），每個構面各自算出 0～100 分，再依權重加總成最終的「加權分數」。
          </p>
          <div className="space-y-3">
            {DIMENSION_ORDER.map((dim) => (
              <div key={dim} className="flex items-center justify-between">
                <span className="text-lg font-medium text-black">{DIMENSION_LABELS[dim]}</span>
                <div className="flex flex-1 items-center gap-3 pl-6">
                  <div className="h-2.5 flex-1 rounded-full bg-[#e1e0d9]">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700"
                      style={{ width: `${(DIMENSION_WEIGHTS[dim] / MAX_WEIGHT) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-lg font-bold tabular-nums text-emerald-700">
                    {DIMENSION_WEIGHTS[dim] * 100}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "160ms" }}>
          <h2 className="mb-3 text-2xl font-semibold text-black">計分方式</h2>
          <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed text-gray-600">
            <li>每題採「非常不同意」到「非常同意」5 級量表作答，每題最高 5%，換算成 0、25、50、75、100 分。</li>
            <li>同構面底下的 4 題分數加總，得到該構面 0～100 分的「構面分數」（每構面權重 20%）。</li>
            <li>五個構面分數依上方權重加權平均，得到 0～100 分的「加權分數」。</li>
            <li>加權分數對應到四個成熟度等級之一，分數越高代表組織在各項能力上越成熟。</li>
          </ul>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "240ms" }}>
          <h2 className="mb-4 text-2xl font-semibold text-black">四個成熟度等級</h2>
          <div className="space-y-4">
            {LEVELS.map((level) => {
              const color = LEVEL_COLORS[level];
              return (
                <div
                  key={level}
                  className="flex flex-col gap-3 rounded-xl p-5 text-white sm:flex-row sm:items-center sm:justify-between"
                  style={{ backgroundImage: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                >
                  <div>
                    <p className="text-sm font-medium text-white/80">Level {level}</p>
                    <p className="text-2xl font-bold">{LEVEL_NAMES[level]}</p>
                    <p className="text-lg text-white/90">{LEVEL_DESCRIPTIONS[level]}</p>
                  </div>
                  <div className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-lg font-semibold sm:text-right">
                    {levelScoreRange(level)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="animate-fade-up flex justify-center pt-2" style={{ animationDelay: "320ms" }}>
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-3 text-lg font-medium text-white shadow-[0_8px_30px_rgba(5,150,105,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(5,150,105,0.5)] active:scale-[0.97]"
          >
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
