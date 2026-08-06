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

/**
 * 每個等級的漸層色（起訖兩色的 hex），用於結果頁 hero 卡片背景。
 * 四個等級是有序資料（Unknowing→Scaling），採用 dataviz skill 建議的「單一色相、
 * 由淺到深」序列漸層做法，而非四個不相關的色相：全部落在 Tailwind emerald 色階，
 * 等級越高，漸層整體越深，呈現遞進感，同時整站維持單一綠色主色調。
 */
export const LEVEL_COLORS: Record<Level, { from: string; to: string; glow: string }> = {
  1: { from: "#34d399", to: "#059669", glow: "rgba(5,150,105,0.4)" }, // emerald-400 → 600
  2: { from: "#10b981", to: "#047857", glow: "rgba(4,120,87,0.4)" }, // emerald-500 → 700
  3: { from: "#059669", to: "#065f46", glow: "rgba(6,95,70,0.4)" }, // emerald-600 → 800
  4: { from: "#047857", to: "#064e3b", glow: "rgba(6,78,59,0.45)" }, // emerald-700 → 900
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
