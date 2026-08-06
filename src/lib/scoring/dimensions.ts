import type { DimensionKey, Level } from "./types";

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  baseData: "基礎數據",
  inputResource: "投入資源",
  strategy: "策略管理",
  application: "應用落地",
  diffusion: "效益擴散",
};

export const DIMENSION_ORDER: DimensionKey[] = [
  "baseData",
  "inputResource",
  "strategy",
  "application",
  "diffusion",
];

/**
 * 五大構面對「加權分數」的權重。
 * 來源：逆向工程測試（隔離測試法 + 差異化驗證，26 筆數據零矛盾）。
 * 基礎數據／投入資源／效益擴散權重是策略管理／應用落地的兩倍（比例 2:2:1:1:2）。
 */
export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  baseData: 0.25,
  inputResource: 0.25,
  strategy: 0.125,
  application: 0.125,
  diffusion: 0.25,
};

export const LEVEL_NAMES: Record<Level, string> = {
  1: "Unknowing AI",
  2: "Conscious AI",
  3: "Ready AI",
  4: "Scaling AI",
};

export const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  1: "尚未意識",
  2: "初步意識",
  3: "準備就緒",
  4: "規模化擴散",
};

/** Tailwind 色系名稱，用於結果頁依等級呈現不同主色調 */
export const LEVEL_COLORS: Record<Level, { text: string; bg: string; ring: string }> = {
  1: { text: "text-slate-600", bg: "bg-slate-500", ring: "ring-slate-200" },
  2: { text: "text-blue-600", bg: "bg-blue-500", ring: "ring-blue-200" },
  3: { text: "text-indigo-600", bg: "bg-indigo-500", ring: "ring-indigo-200" },
  4: { text: "text-emerald-600", bg: "bg-emerald-500", ring: "ring-emerald-200" },
};

/**
 * 三個等級邊界，取實測夾出區間的中點作為判定門檻：
 *  - Unknowing / Conscious 實測區間 (20.25, 21]，取 20.625
 *  - Conscious / Ready     實測區間 (44.75, 45.5]，取 45.125
 *  - Ready / Scaling       實測區間 (59, 59.875]，取 59.4375
 * 加權分數 <= 門檻值 判為較低一級。真正邊界仍有 <1 分的不確定帶，
 * 若要更精確可繼續用二分法夾測試。
 */
export const LEVEL_THRESHOLDS: [number, number, number] = [20.625, 45.125, 59.4375];

export function levelFromWeightedScore(weightedScore: number): Level {
  const [t1, t2, t3] = LEVEL_THRESHOLDS;
  if (weightedScore <= t1) return 1;
  if (weightedScore <= t2) return 2;
  if (weightedScore <= t3) return 3;
  return 4;
}
