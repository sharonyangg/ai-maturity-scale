import type {
  ChoiceOption,
  MatrixQuestion,
  MatrixSubItem,
  MultiChoiceQuestion,
  Question,
  SingleChoiceQuestion,
} from "./types";

/**
 * ⚠️ 題目文字與選項文字目前全部是佔位文字。
 * 逆向工程測試只記錄了「權重」與「計分規則」，沒有逐字抄錄原問卷的題目／選項文字。
 * 要「像素級」復刻時，需要對照原站 https://ai-readiness.aimfg.org.tw/ai_evaluation
 * 把 title / options label 換成正式文字（欄位 name 對應關係見交接文件第2節）。
 *
 * 分數來源標記：
 *   verified: true  → 該題（或該選項組合）分數已透過黑箱測試逐一驗證
 *   verified: false → 目前用「選項等差線性分布」佔位，真實非線性曲線尚未逐一測出
 */

function linearOptions(count: number, labels?: string[]): ChoiceOption[] {
  const step = 100 / (count - 1);
  return Array.from({ length: count }, (_, i) => ({
    value: String(i + 1),
    label: labels?.[i] ?? `選項${i + 1}`,
    score: Math.round(i * step),
  }));
}

function singleChoice(
  id: string,
  dimension: SingleChoiceQuestion["dimension"],
  weight: number,
  optionCount: number,
  opts?: { title?: string; verified?: boolean }
): SingleChoiceQuestion {
  return {
    id,
    dimension,
    type: "single",
    weight,
    title: opts?.title ?? `${id}（待填入正式題目文字）`,
    options: linearOptions(optionCount),
    verified: opts?.verified ?? false,
  };
}

function multiChoice(
  id: string,
  dimension: MultiChoiceQuestion["dimension"],
  weight: number,
  optionCount: number,
  baselineAtOne: number,
  baselineVerified: boolean,
  title?: string
): MultiChoiceQuestion {
  return {
    id,
    dimension,
    type: "multi",
    weight,
    title: title ?? `${id}（複選題，待填入正式題目文字）`,
    options: Array.from({ length: optionCount }, (_, i) => ({
      value: String(i + 1),
      label: `選項${i + 1}`,
    })),
    baselineAtOne,
    baselineVerified,
  };
}

// ---- 基礎數據構面（Q1-Q4，權重合計 101%，四捨五入誤差，如實保留） ----

const Q1_SUB_ITEMS: MatrixSubItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  label: `子項${i + 1}（待填入正式文字）`,
}));

const Q1: MatrixQuestion = {
  id: "Q1",
  dimension: "baseData",
  type: "matrix",
  title: "Q1（矩陣題，待填入正式題目文字）",
  weight: 37,
  subItems: Q1_SUB_ITEMS,
  subItemOptions: [
    { value: "1", label: "低" },
    { value: "2", label: "中" },
    { value: "3", label: "高" },
  ],
  // 實測：單一子項選最高 → 9%（子項1、子項5皆驗證過，數值一致）
  baselineAtOne: 9,
  baselineVerified: true,
};

const Q2 = singleChoice("Q2", "baseData", 25, 5);
const Q3 = singleChoice("Q3", "baseData", 31, 5);
const Q4 = singleChoice("Q4", "baseData", 8, 5);

// ---- 投入資源構面（Q5-Q7）----
// 交接文件標註 Q5/Q6/Q7 選項分數「已校正過非線性數值」，但校正後的實際數字
// 未保留在交接文件與測試報告中，目前仍用線性佔位，待補實測數字。
const Q5 = singleChoice("Q5", "inputResource", 65, 5);
const Q6 = singleChoice("Q6", "inputResource", 16, 5);
const Q7 = singleChoice("Q7", "inputResource", 19, 5);

// ---- 策略管理構面（Q8-Q11）----
const Q8 = singleChoice("Q8", "strategy", 37, 5);
const Q9 = singleChoice("Q9", "strategy", 28, 5);
// 實測：8選項，門檻4項；1/2/3/4項 = 6%/13%/19%/23%（見 curve.ts 常數）
const Q10 = multiChoice("Q10", "strategy", 23, 8, 6, true);
// 實測：7選項，門檻4項；1項=6%、4項=12%（滿分），中間值未逐一測
const Q11 = multiChoice("Q11", "strategy", 12, 7, 6, true);

// ---- 應用落地構面（Q12-Q15）----
const Q12 = singleChoice("Q12", "application", 12, 5);
// 實測：11選項，門檻6項=39%（滿分）；勾1項分數未逐一測，估算值見下方比例換算
const Q13 = multiChoice(
  "Q13",
  "application",
  39,
  11,
  Math.round(39 * (6 / 23)), // 依 Q10 的 baseline/max 比例（6/23）換算估算，非實測
  false
);
const Q14 = singleChoice("Q14", "application", 34, 5);
const Q15 = singleChoice("Q15", "application", 15, 5);

// ---- 效益擴散構面（Q16-Q17）----
const Q16 = singleChoice("Q16", "diffusion", 61, 5);
const Q17 = singleChoice("Q17", "diffusion", 39, 5);

export const QUESTIONS: Question[] = [
  Q1, Q2, Q3, Q4,
  Q5, Q6, Q7,
  Q8, Q9, Q10, Q11,
  Q12, Q13, Q14, Q15,
  Q16, Q17,
];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q])
);

/** 問卷分頁分組（比照原站 page1~page5 = 五大構面各一頁） */
export const QUESTION_PAGES: { page: string; dimension: Question["dimension"]; questionIds: string[] }[] = [
  { page: "page1", dimension: "baseData", questionIds: ["Q1", "Q2", "Q3", "Q4"] },
  { page: "page2", dimension: "inputResource", questionIds: ["Q5", "Q6", "Q7"] },
  { page: "page3", dimension: "strategy", questionIds: ["Q8", "Q9", "Q10", "Q11"] },
  { page: "page4", dimension: "application", questionIds: ["Q12", "Q13", "Q14", "Q15"] },
  { page: "page5", dimension: "diffusion", questionIds: ["Q16", "Q17"] },
];
