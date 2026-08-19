import Link from "next/link";
import { DIMENSION_LABELS, DIMENSION_ORDER, LEVEL_COLORS, LEVEL_DESCRIPTIONS, LEVEL_NAMES } from "@/lib/scoring/dimensions";
import { getEffectiveConfig } from "@/lib/scoring/config-store";
import type { Level } from "@/lib/scoring/types";

// 權重會被後台改動，這頁不能在 build time 就把數字烤死成靜態頁面。
export const dynamic = "force-dynamic";

const CARD_CLASS =
  "animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-[0_8px_32px_rgba(148,163,223,0.15)] backdrop-blur-xl transition-all duration-300 sm:p-6";

const LEVELS: Level[] = [1, 2, 3, 4];

export default async function ScoringGuidePage() {
  // 這頁是 server component，可以直接讀後台設定檔，不用額外打 API。
  const { dimensionWeights, levelRanges } = await getEffectiveConfig();
  const maxWeight = Math.max(...Object.values(dimensionWeights));
  const weightedFormula = DIMENSION_ORDER.map(
    (dim) => `${DIMENSION_LABELS[dim]}×${Math.round(dimensionWeights[dim] * 100)}%`
  ).join(" ＋ ");

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-fade-up text-center">
          <h1 className="text-3xl font-bold text-slate-700 sm:text-4xl">評分說明</h1>
          <p className="mt-2 text-lg leading-relaxed text-slate-600">了解本量表如何從您的作答算出分數與等級</p>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "80ms" }}>
          <h2 className="mb-3 text-2xl font-semibold text-slate-700">五大構面與權重</h2>
          <p className="mb-4 text-lg leading-relaxed text-slate-600">
            問卷共 20 道題目，對應五大構面各 4 項指標。每個構面各自算出 0～100 分，再依權重加總成最終的「加權分數」。
          </p>
          <div className="space-y-3">
            {DIMENSION_ORDER.map((dim) => (
              <div key={dim} className="flex items-center justify-between">
                <span className="text-lg font-medium text-slate-700">{DIMENSION_LABELS[dim]}</span>
                <div className="flex flex-1 items-center gap-3 pl-6">
                  <div className="h-4 flex-1 rounded-full border border-white/60 bg-white/50 shadow-inner backdrop-blur-md">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-rose-300 via-sky-300 to-violet-300 shadow-[inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out"
                      style={{ width: `${(dimensionWeights[dim] / maxWeight) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-lg font-bold tabular-nums text-sky-600">
                    {Math.round(dimensionWeights[dim] * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "160ms" }}>
          <h2 className="mb-3 text-2xl font-semibold text-slate-700">計分方式</h2>
          <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed text-slate-600">
            <li>每題採「非常不同意」到「非常同意」5 級量表作答，換算成 0、25、50、75、100 分。</li>
            <li>構面分數：該構面 4 題換算後分數之算術平均數（0～100 分）。</li>
            <li>加權分數 ＝ {weightedFormula}，滿分 100 分。</li>
            <li>加權分數對應到四個成熟度等級之一，分數越高代表組織在各項能力上越成熟。</li>
          </ul>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "240ms" }}>
          <h2 className="mb-4 text-2xl font-semibold text-slate-700">四個成熟度等級</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {LEVELS.map((level) => {
              const color = LEVEL_COLORS[level];
              return (
                <div
                  key={level}
                  className="flex flex-col items-center gap-2 rounded-[2rem] border border-white/60 bg-white/50 p-6 text-center shadow-[0_8px_24px_rgba(148,163,223,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <span
                    className="font-heading flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-[0_8px_20px_-4px_rgba(0,0,0,0.25),inset_0_2px_3px_rgba(255,255,255,0.6)]"
                    style={{ backgroundImage: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                  >
                    Lv.{level}
                  </span>
                  <p className="text-2xl font-bold text-slate-700">{LEVEL_NAMES[level]}</p>
                  <p className="text-lg leading-relaxed text-slate-600">{LEVEL_DESCRIPTIONS[level]}</p>
                  <span
                    className="mt-1 inline-block w-fit rounded-full border px-3 py-1 text-base font-semibold backdrop-blur-md"
                    style={{ backgroundColor: `${color.to}1a`, borderColor: `${color.to}40`, color: color.to }}
                  >
                    {levelRanges[level].min} ~ {levelRanges[level].max} 分
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "300ms" }}>
          <h2 className="mb-3 text-2xl font-semibold text-slate-700">前測與後測</h2>
          <p className="text-lg leading-relaxed text-slate-600">
            首次填答請選擇「開始前測」，完成後可下載 Word
            報告作為輔導前之基準值。完成一對一輔導後，回到首頁選擇「開始後測」，並在填答前上傳先前的前測
            Word 報告，系統會自動比對前後測分數，以雷達圖疊加呈現成長軌跡，並標示最大進步與仍待強化的構面。
          </p>
        </div>

        <div className="animate-fade-up flex justify-center pt-2" style={{ animationDelay: "360ms" }}>
          <Link
            href="/"
            className="rounded-full bg-gradient-to-br from-sky-300 to-sky-400 px-8 py-3 text-lg font-semibold text-slate-700 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
          >
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
