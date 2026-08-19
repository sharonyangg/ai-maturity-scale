import type { DimensionKey, Level } from "./types";

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  organization: "組織能力",
  service: "服務能力",
  businessModel: "商業模式",
  digital: "數位能力",
  sustainability: "永續能力",
};

export const DIMENSION_ORDER: DimensionKey[] = [
  "organization",
  "service",
  "businessModel",
  "digital",
  "sustainability",
];

export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  organization: 0.2,
  service: 0.2,
  businessModel: 0.2,
  digital: 0.2,
  sustainability: 0.2,
};

export const DIMENSION_DESCRIPTIONS: Record<DimensionKey, string> = {
  organization:
    "評估貴單位之治理結構、人力資源管理、財務制度與內部溝通文化，檢視是否具備支撐長期營運之組織基礎，並特別關注身心障礙工作者友善職場之建置程度。",
  service:
    "評估貴單位之服務／產品設計品質、對服務對象（含身障者）需求之掌握程度，以及服務交付流程標準化（SOP）與顧客滿意度管理之落實情形。",
  businessModel:
    "評估貴單位之價值主張、收入來源多元性、行銷通路策略及財務永續性，檢視是否已發展出穩定、可規模化且具持續性之商業邏輯。",
  digital:
    "評估貴單位導入營運數位工具、運用線上行銷／電商平台、以數據輔助決策，以及落實資訊安全防護與數位無障礙設計之應用程度。",
  sustainability:
    "評估貴單位衡量並揭露社會影響力、實踐 ESG／CSR 理念、建構跨界資源合作網絡，以及面對外部風險變動之應變與恢復韌性。",
};

export const LEVEL_NAMES: Record<Level, string> = {
  1: "萌芽期",
  2: "發展期",
  3: "成長期",
  4: "成熟期",
};

export const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  1: "組織能力尚在萌芽",
  2: "各面向能力正逐步發展",
  3: "各面向能力持續成長",
  4: "各面向能力發展成熟",
};

export const LEVEL_COLORS: Record<Level, { from: string; to: string; glow: string }> = {
  1: { from: "#fda4af", to: "#fb7185", glow: "rgba(251,113,133,0.4)" }, // rose-300 → rose-400，萌芽期
  2: { from: "#fdba74", to: "#fb923c", glow: "rgba(251,146,60,0.4)" }, // orange-300 → orange-400，發展期
  3: { from: "#7dd3fc", to: "#38bdf8", glow: "rgba(56,189,248,0.4)" }, // sky-300 → sky-400，成長期
  4: { from: "#5eead4", to: "#2dd4bf", glow: "rgba(45,212,191,0.45)" }, // teal-300 → teal-400，成熟期
};

/** 加權總分（0～100 分）分級門檻：0~19／20~44／45~56／57~100 */
export const LEVEL_THRESHOLDS: [number, number, number] = [19, 44, 56];

export function levelFromWeightedScore(weightedScore: number): Level {
  const [t1, t2, t3] = LEVEL_THRESHOLDS;
  if (weightedScore <= t1) return 1;
  if (weightedScore <= t2) return 2;
  if (weightedScore <= t3) return 3;
  return 4;
}
