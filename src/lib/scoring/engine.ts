import { DIMENSION_ORDER, DIMENSION_WEIGHTS, LEVEL_NAMES, levelFromWeightedScore } from "./dimensions";
import { QUESTIONS } from "./questions";
import type { Answers, DimensionKey, Question, QuizResult } from "./types";

function scoreQuestion(question: Question, answers: Answers): number {
  const answer = answers[question.id];
  if (!answer) return 0;
  const option = question.options.find((o) => o.value === answer);
  if (!option) return 0;
  return (option.score / 100) * question.weight;
}

export function computeDimensionScores(answers: Answers): Record<DimensionKey, number> {
  const totals: Record<DimensionKey, number> = {
    organization: 0,
    service: 0,
    businessModel: 0,
    digital: 0,
    sustainability: 0,
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
