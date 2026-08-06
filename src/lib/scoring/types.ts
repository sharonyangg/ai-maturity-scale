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
  /** 該選項在「該題自身量尺」上的原始分數，範圍 0-100。尚未逐一實測的題目先以等差假設頂位。 */
  score: number;
}

export interface SingleChoiceQuestion {
  id: string;
  dimension: DimensionKey;
  type: "single";
  title: string;
  /** 該題在所屬構面中的固定權重（百分點，加總到構面滿分 100） */
  weight: number;
  options: ChoiceOption[];
  /** 此題選項分數是否已經過實測校正（false = 目前用等差假設佔位） */
  verified: boolean;
}

export interface MultiChoiceQuestion {
  id: string;
  dimension: DimensionKey;
  type: "multi";
  title: string;
  weight: number;
  /** 計入門檻式計分公式的選項（原站選項總數會扣掉「以上皆無」這類互斥選項） */
  options: { value: string; label: string }[];
  /**
   * 原站部分複選題有「以上皆無」這種互斥選項：勾選它會清空其他選項（反之亦然），
   * 且不計入 options.length 的門檻公式，分數固定為 0。
   */
  noneOption?: { value: string; label: string };
  /** 勾選 1 項時的分數（門檻式計分的基礎分），已實測或估算值，見 curve.ts 說明 */
  baselineAtOne: number;
  /** 基礎分是否為實測值（false = 依 Q10 之比例估算） */
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
  /** 每個子項共用的選項（例：低/中/高），最後一個視為「達標」選項 */
  subItemOptions: { value: string; label: string }[];
  baselineAtOne: number;
  baselineVerified: boolean;
}

export type Question = SingleChoiceQuestion | MultiChoiceQuestion | MatrixQuestion;

/** 單一題目的作答：single 存選項 value，multi 存 value[]，matrix 存 { [subItemId]: value } */
export type AnswerValue = string | string[] | Record<string, string>;

export type Answers = Record<string, AnswerValue>;

export interface DimensionScore {
  dimension: DimensionKey;
  /** 0-100，構面自身滿分 */
  score: number;
}

export type Level = 1 | 2 | 3 | 4;

export interface QuizResult {
  dimensionScores: Record<DimensionKey, number>;
  weightedScore: number;
  level: Level;
  levelName: string;
}
