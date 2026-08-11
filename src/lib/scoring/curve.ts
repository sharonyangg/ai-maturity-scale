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
