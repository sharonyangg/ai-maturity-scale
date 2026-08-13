import type { ChoiceOption, Question } from "./types";

const LIKERT_LABELS = ["非常不同意", "不同意", "普通", "同意", "非常同意"];

const LIKERT_OPTIONS: ChoiceOption[] = LIKERT_LABELS.map((label, i) => ({
  value: String(i + 1),
  label,
  score: i * 25,
}));

/** 每構面 4 題，每題等權重 25 分，滿分加總為該構面 0～100 分 */
const QUESTION_WEIGHT = 25;

function likert(id: string, dimension: Question["dimension"], title: string): Question {
  return {
    id,
    dimension,
    title,
    weight: QUESTION_WEIGHT,
    options: LIKERT_OPTIONS,
  };
}

const A1 = likert("A1", "organization", "本組織具備清楚的決策流程與分工，重大決策有明確負責人。");
const A2 = likert("A2", "organization", "本組織有系統性的教育訓練及人才培育計畫(含身障員工)。");
const A3 = likert("A3", "organization", "本組織有固定編製財務報表並定期檢視收支狀況。");
const A4 = likert("A4", "organization", "本組織已建置身心障礙者友善之工作環境與溝通機制。");

const B1 = likert("B1", "service", "本組織的服務/產品設計有明確流程並定期檢討品質。");
const B2 = likert("B2", "service", "本組織會定期蒐集服務對象(含身障者)意見並回應調整。");
const B3 = likert("B3", "service", "本組織的核心服務流程已建立標準作業程序(SOP)。");
const B4 = likert("B4", "service", "本組織定期進行客戶滿意度調查並據以改善服務。");

const C1 = likert("C1", "businessModel", "本組織能清楚說明產品/服務的獨特價值與目標客群。");
const C2 = likert("C2", "businessModel", "本組織已發展出穩定且多元的收入來源與獲利模式。");
const C3 = likert("C3", "businessModel", "本組織具備清楚的行銷推廣策略與多元銷售通路。");
const C4 = likert("C4", "businessModel", "本組織之自主財源(非補助)佔總收入比率逐年提升。");

const D1 = likert("D1", "digital", "本組織已導入數位化工具協助日常營運與管理。");
const D2 = likert("D2", "digital", "本組織有效運用官網/社群/電商平台進行行銷或銷售。");
const D3 = likert("D3", "digital", "本組織會蒐集並分析營運數據，作為決策參考依據。");
const D4 = likert("D4", "digital", "本組織之數位系統或網站具備基本資安防護與無障礙設計。");

const E1 = likert("E1", "sustainability", "本組織能具備衡量並呈現對身心障礙者的社會影響力成果。");
const E2 = likert("E2", "sustainability", "本組織已將 ESG 或社會責任理念納入日常營運實踐。");
const E3 = likert("E3", "sustainability", "本組織已建立跨部門或異業合作網以擴大服務量能。");
const E4 = likert("E4", "sustainability", "本組織具備因應突發風險(如資金短缺、人力異動)之應變機制。");

export const QUESTIONS: Question[] = [
  A1, A2, A3, A4,
  B1, B2, B3, B4,
  C1, C2, C3, C4,
  D1, D2, D3, D4,
  E1, E2, E3, E4,
];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q])
);

export const QUESTION_PAGES: {
  page: string;
  dimension: Question["dimension"];
  sectionTitle: string;
  questionIds: string[];
}[] = [
  { page: "page1", dimension: "organization", sectionTitle: "第一構面：組織能力", questionIds: ["A1", "A2", "A3", "A4"] },
  { page: "page2", dimension: "service", sectionTitle: "第二構面：服務能力", questionIds: ["B1", "B2", "B3", "B4"] },
  { page: "page3", dimension: "businessModel", sectionTitle: "第三構面：商業模式", questionIds: ["C1", "C2", "C3", "C4"] },
  { page: "page4", dimension: "digital", sectionTitle: "第四構面：數位能力", questionIds: ["D1", "D2", "D3", "D4"] },
  { page: "page5", dimension: "sustainability", sectionTitle: "第五構面：永續能力", questionIds: ["E1", "E2", "E3", "E4"] },
];

export const REPORT_SECTION_TITLES: Record<Question["dimension"], string> = {
  organization: "一、組織能力",
  service: "二、服務能力",
  businessModel: "三、商業模式",
  digital: "四、數位能力",
  sustainability: "五、永續能力",
};
