/**
 * 複選題／矩陣題的「門檻式計分」曲線。
 *
 * 已完全實測確認的規則（見交接文件第3節）：
 *   - 勾選數量達到 ⌈選項總數/2⌉ 時直接封頂拿到該題滿分權重，多勾不再加分。
 *   - 勾選數量低於門檻時分數遞增，但非線性。
 *
 * Q10（8選項，threshold=4）是唯一逐項測出「1/2/3/4項各自分數」的題目：
 *   1項=6%、2項=13%、3項=19%、4項=23%（滿分）
 * 換算成「從 baseline 到 max 的完成度比例」：0 / 0.4118 / 0.7647 / 1
 * 這個形狀曲線被拿來當作 Q11、Q13、Q1 矩陣題中間值的通用近似（因為那幾題
 * 只有「勾1項」與「勾滿門檻」兩個端點被實測過，中間值未逐一驗證）。
 */
const EMPIRICAL_PROGRESS_ANCHORS: [x: number, fraction: number][] = [
  [0, 0],
  [1 / 3, 0.4118],
  [2 / 3, 0.7647],
  [1, 1],
];

function progressFraction(x: number): number {
  const clamped = Math.min(1, Math.max(0, x));
  for (let i = 0; i < EMPIRICAL_PROGRESS_ANCHORS.length - 1; i++) {
    const [x0, y0] = EMPIRICAL_PROGRESS_ANCHORS[i];
    const [x1, y1] = EMPIRICAL_PROGRESS_ANCHORS[i + 1];
    if (clamped >= x0 && clamped <= x1) {
      const t = x1 === x0 ? 0 : (clamped - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return 1;
}

/**
 * 計算複選題／矩陣題在「勾選 count 項（共 totalOptions 項）」時，對所屬構面的分數貢獻。
 *
 * @param count 已勾選（或矩陣子項達到最高選項）的數量
 * @param totalOptions 該題選項（或矩陣子項）總數
 * @param maxWeight 該題滿分權重（勾滿門檻時的分數）
 * @param baselineAtOne 勾選 1 項時的分數；Q10/Q11/Q1 已實測，其餘題目為估算值
 */
export function thresholdScore(
  count: number,
  totalOptions: number,
  maxWeight: number,
  baselineAtOne: number
): number {
  const threshold = Math.ceil(totalOptions / 2);
  if (count <= 0) return 0;
  if (count >= threshold) return maxWeight;
  if (threshold <= 1) return maxWeight;

  const x = (count - 1) / (threshold - 1);
  const fraction = progressFraction(x);
  return baselineAtOne + fraction * (maxWeight - baselineAtOne);
}
