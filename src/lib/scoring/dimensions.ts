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
