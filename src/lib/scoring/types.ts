export type DimensionKey =
  | "baseData" // 基礎數據
  | "inputResource" // 投入資源
  | "strategy" // 策略管理
  | "application" // 應用落地
  | "diffusion"; // 效益擴散

export type QuestionType = "single" | "multi" | "matrix";

export interface ChoiceOption {
  value: string;
  label: string;
  score: number;
}

export interface SingleChoiceQuestion {
  id: string;
  dimension: DimensionKey;
  type: "single";
  title: string;
  weight: number;
  options: ChoiceOption[];
  verified: boolean;
}

export interface MultiChoiceQuestion {
  id: string;
  dimension: DimensionKey;
  type: "multi";
  title: string;
  weight: number;
  options: { value: string; label: string }[];
  noneOption?: { value: string; label: string };
  baselineAtOne: number;
  baselineVerified: boolean;
}

export interface MatrixSubItem {
  id: string;
  label: string;
}

export interface MatrixQuestion {
  id: string;
  dimension: DimensionKey;
  type: "matrix";
  title: string;
  weight: number;
  subItems: MatrixSubItem[];
  subItemOptions: { value: string; label: string }[];
  baselineAtOne: number;
  baselineVerified: boolean;
}

export type Question = SingleChoiceQuestion | MultiChoiceQuestion | MatrixQuestion;

export type AnswerValue = string | string[] | Record<string, string>;

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
