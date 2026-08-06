import { thresholdScore } from "./curve";
import { DIMENSION_ORDER, DIMENSION_WEIGHTS, LEVEL_NAMES, levelFromWeightedScore } from "./dimensions";
import { QUESTIONS } from "./questions";
import type { Answers, DimensionKey, Question, QuizResult } from "./types";

function scoreQuestion(question: Question, answers: Answers): number {
  const answer = answers[question.id];
  if (!answer) return 0;

  if (question.type === "single") {
    const option = question.options.find((o) => o.value === answer);
    if (!option) return 0;
    return (option.score / 100) * question.weight;
  }

  if (question.type === "multi") {
    const selected = Array.isArray(answer) ? answer : [];
    return thresholdScore(
      selected.length,
      question.options.length,
      question.weight,
      question.baselineAtOne
    );
  }

  // matrix
  const selections = (typeof answer === "object" && !Array.isArray(answer) ? answer : {}) as Record<
    string,
    string
  >;
  const maxOptionValue = question.subItemOptions[question.subItemOptions.length - 1]?.value;
  const achievedCount = question.subItems.filter((sub) => selections[sub.id] === maxOptionValue).length;
  return thresholdScore(achievedCount, question.subItems.length, question.weight, question.baselineAtOne);
}

/** 計算五大構面各自分數（0-100，允許因四捨五入誤差略超過100，如實保留基礎數據構面101%的現象） */
export function computeDimensionScores(answers: Answers): Record<DimensionKey, number> {
  const totals: Record<DimensionKey, number> = {
    baseData: 0,
    inputResource: 0,
    strategy: 0,
    application: 0,
    diffusion: 0,
  };

  for (const question of QUESTIONS) {
    totals[question.dimension] += scoreQuestion(question, answers);
  }

  return totals;
}

export function computeWeightedScore(dimensionScores: Record<DimensionKey, number>): number {
  return DIMENSION_ORDER.reduce(
    (sum, dim) => sum + dimensionScores[dim] * DIMENSION_WEIGHTS[dim],
    0
  );
}

export function computeResult(answers: Answers): QuizResult {
  const dimensionScores = computeDimensionScores(answers);
  const weightedScore = computeWeightedScore(dimensionScores);
  const level = levelFromWeightedScore(weightedScore);
  return {
    dimensionScores,
    weightedScore,
    level,
    levelName: LEVEL_NAMES[level],
  };
}
