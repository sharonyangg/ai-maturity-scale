export type DimensionKey =
  | "organization" // 組織能力
  | "service" // 服務能力
  | "businessModel" // 商業模式
  | "digital" // 數位能力
  | "sustainability"; // 永續能力

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  dimension: DimensionKey;
  title: string;
  options: ChoiceOption[];
}

export type AnswerValue = string;

export type Answers = Record<string, AnswerValue>;

export interface DimensionScore {
  dimension: DimensionKey;
  score: number;
}

export type Level = 1 | 2 | 3 | 4;

export interface QuizResult {
  dimensionScores: Record<DimensionKey, number>;
  weightedScore: number;
  level: Level;
  levelName: string;
}
