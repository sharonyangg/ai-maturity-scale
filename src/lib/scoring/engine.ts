import { DIMENSION_ORDER, DIMENSION_WEIGHTS, LEVEL_NAMES, levelFromWeightedScore } from "./dimensions";
import { QUESTIONS } from "./questions";
import type { Answers, DimensionKey, QuizResult } from "./types";

/** 1～5 分的原始作答換算成 0～100 分（1→0、2→25、3→50、4→75、5→100） */
function toPercent(rawValue: number): number {
  return ((rawValue - 1) / 4) * 100;
}

/**
 * 構面分數（0～100 分）= 該構面 4 題答案換算成百分制後之算術平均數。
 * 加權總分（0～100 分）= 各構面分數 × 對應權重後加總（五大構面權重均為 20%）。
 */
export function computeDimensionScores(answers: Answers): Record<DimensionKey, number> {
  const totals: Record<DimensionKey, number> = {
    organization: 0,
    service: 0,
    businessModel: 0,
    digital: 0,
    sustainability: 0,
  };
  const counts: Record<DimensionKey, number> = {
    organization: 0,
    service: 0,
    businessModel: 0,
    digital: 0,
    sustainability: 0,
  };

  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    if (!answer) continue;
    const value = Number(answer);
    if (!Number.isFinite(value)) continue;
    totals[question.dimension] += toPercent(value);
    counts[question.dimension] += 1;
  }

  const averages: Record<DimensionKey, number> = { ...totals };
  for (const dim of DIMENSION_ORDER) {
    averages[dim] = counts[dim] > 0 ? totals[dim] / counts[dim] : 0;
  }
  return averages;
}

export function computeWeightedScore(
  dimensionScores: Record<DimensionKey, number>,
  weights: Record<DimensionKey, number> = DIMENSION_WEIGHTS
): number {
  return DIMENSION_ORDER.reduce((sum, dim) => sum + dimensionScores[dim] * weights[dim], 0);
}

export function computeResult(
  answers: Answers,
  weights: Record<DimensionKey, number> = DIMENSION_WEIGHTS
): QuizResult {
  const dimensionScores = computeDimensionScores(answers);
  const weightedScore = computeWeightedScore(dimensionScores, weights);
  const level = levelFromWeightedScore(weightedScore);
  return {
    dimensionScores,
    weightedScore,
    level,
    levelName: LEVEL_NAMES[level],
  };
}

/**
 * 找出本次評估相對最弱的 1～2 個構面（0～100 分尺度）：
 * - 五個構面分數若差距很小（<5 分），視為發展均衡，不點名弱項
 * - 否則抓分數最低的構面；若次低構面與最低構面差距在 8 分以內，一併列入（並列最弱）
 */
export function getWeakestDimensions(dimensionScores: Record<DimensionKey, number>): DimensionKey[] {
  const sorted = [...DIMENSION_ORDER].sort((a, b) => dimensionScores[a] - dimensionScores[b]);
  const values = DIMENSION_ORDER.map((d) => dimensionScores[d]);
  const spread = Math.max(...values) - Math.min(...values);
  if (spread < 5) return [];

  const [worst, second] = sorted;
  if (dimensionScores[second] - dimensionScores[worst] <= 8) return [worst, second];
  return [worst];
}

/**
 * 找出兩次評估之間進步最多／仍待強化的構面，供前測後測比較彙總表使用。
 */
export function compareDimensionScores(
  prevScores: Record<DimensionKey, number>,
  currentScores: Record<DimensionKey, number>
): { mostImproved: DimensionKey; stillWeak: DimensionKey; deltas: Record<DimensionKey, number> } {
  const deltas: Record<DimensionKey, number> = {
    organization: 0,
    service: 0,
    businessModel: 0,
    digital: 0,
    sustainability: 0,
  };
  for (const dim of DIMENSION_ORDER) {
    deltas[dim] = currentScores[dim] - prevScores[dim];
  }
  const mostImproved = [...DIMENSION_ORDER].sort((a, b) => deltas[b] - deltas[a])[0];
  const stillWeak = [...DIMENSION_ORDER].sort((a, b) => currentScores[a] - currentScores[b])[0];
  return { mostImproved, stillWeak, deltas };
}
