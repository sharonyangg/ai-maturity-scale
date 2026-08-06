"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Answers } from "./scoring/types";

/**
 * page0（公司基本資料）欄位。
 * companyName / taxId 已從原站截圖的正式填答結果 PDF 逐字確認（PDF 表頭直接印出
 * 「公司名稱：X　統編：Y　填答日期：Z」）。
 * subIndustry / respondentLevel / departments / email 這四個欄位——連同各自的完整
 * 選項清單——同樣是從那份 PDF 最後一頁「B.公司填答部門同仁」區塊逐字確認的。
 *
 * 之前這裡放的 identityType（身份類型）／purpose（申請用途）等欄位是從原站 JS 打包檔
 * 的表單驗證文字猜測來的，現在對照這份真實填答結果後發現猜錯了——那組文字實際上屬於
 * 網站另一個「下載製造業AI導入指引」的聯絡資訊彈窗，不是這裡的公司填答部門同仁欄位，
 * 已經移除。
 */
export const SUB_INDUSTRY_OPTIONS = [
  "非C類製造業",
  "C08 食品及飼品製造業",
  "C09 飲料製造業",
  "C10 菸草製造業",
  "C11 紡織業",
  "C12 成衣及服飾品製造業",
  "C13 皮革、毛皮及其製品製造業",
  "C14 木竹製品製造業",
  "C15 紙漿、紙及紙製品製造業",
  "C16 印刷及資料儲存媒體複製業",
  "C17 石油及煤製品製造業",
  "C18 化學材料及肥料製造業",
  "C19 其他化學製品製造業",
  "C20 藥品及醫用化學製品製造業",
  "C21 橡膠製品製造業",
  "C22 塑膠製品製造業",
  "C23 非金屬礦物製品製造業",
  "C24 基本金屬製造業",
  "C25 金屬製品製造業",
  "C26 電子零組件製造業",
  "C27 電腦、電子產品及光學製品製造業",
  "C28 電力設備及配備製造業",
  "C29 機械設備製造業",
  "C30 汽車及其零件製造業",
  "C31 其他運輸工具及其零件製造業",
  "C32 家具製造業",
  "C33 其他製造業",
  "C34 產業用機械設備維修及安裝業",
] as const;

export const RESPONDENT_LEVEL_OPTIONS = [
  "C-Level(執行長/技術長/營運長/行銷長...)",
  "部門中高階主管",
  "單位初階主管",
  "資深職員/一般職員(非管理職)",
  "非工作者(學生/軍警/退休等)",
] as const;

export const DEPARTMENT_OPTIONS = [
  "製造相關部門",
  "資訊相關部門",
  "研發相關部門",
  "業務相關部門",
  "行銷相關部門",
  "總經理/執行長一級主管辦公室",
  "AI推動相關部門",
  "行政管理部門",
] as const;

export interface CompanyInfo {
  companyName?: string;
  taxId?: string;
  subIndustry?: string;
  respondentLevel?: string;
  departments?: string[];
  departmentOther?: string;
  email?: string;
}

/** 依原站欄位順序排列，供 Word 報告等需要「欄位 key → 中文標籤」對照的地方共用 */
export const COMPANY_FIELD_LABELS: Record<Exclude<keyof CompanyInfo, "departments" | "departmentOther">, string> = {
  companyName: "公司名稱",
  taxId: "統編",
  subIndustry: "次產業別",
  respondentLevel: "填答職級",
  email: "E-mail",
};

/** page6 結尾兩題複選題（Q18、Q19），已驗證不影響計分，純資訊蒐集用途 */
export interface ClosingAnswers {
  q1: string[];
  q1Other: string;
  q2: string[];
  q2Other: string;
}

interface QuizState {
  companyInfo: CompanyInfo;
  answers: Answers;
  closing: ClosingAnswers;
}

const STORAGE_KEY = "ai-maturity-quiz-state";

/**
 * 結果頁不在 QuizProvider 底下（它是獨立路由，答案已經編碼進 URL 了），
 * 所以「回到首頁」要清掉暫存進度時，直接操作 localStorage，而不是透過 context。
 */
export function clearStoredQuizState() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * 結果頁下載 Word 報告時想帶上公司資訊，但結果頁本身不在 QuizProvider 底下，
 * 所以一樣直接讀 localStorage。只在剛完成問卷、同一台裝置的情境下才讀得到；
 * 純靠 URL 分享出去的結果連結不會有這份資料，屬預期行為。
 */
export function getStoredCompanyInfo(): CompanyInfo {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const state = JSON.parse(raw) as QuizState;
    return state.companyInfo ?? {};
  } catch {
    return {};
  }
}

const EMPTY_CLOSING: ClosingAnswers = { q1: [], q1Other: "", q2: [], q2Other: "" };

/** 同上，取回結尾兩題（Q18、Q19）的暫存作答，供 Word 報告的完整逐題清單使用 */
export function getStoredClosingAnswers(): ClosingAnswers {
  if (typeof window === "undefined") return EMPTY_CLOSING;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CLOSING;
    const state = JSON.parse(raw) as QuizState;
    return state.closing ?? EMPTY_CLOSING;
  } catch {
    return EMPTY_CLOSING;
  }
}

const initialState: QuizState = {
  companyInfo: {},
  answers: {},
  closing: { q1: [], q1Other: "", q2: [], q2Other: "" },
};

type CompanyTextField = Exclude<keyof CompanyInfo, "departments">;

type Action =
  | { type: "SET_COMPANY_FIELD"; field: CompanyTextField; value: string }
  | { type: "SET_COMPANY_DEPARTMENTS"; value: string[] }
  | { type: "SET_ANSWER"; questionId: string; value: Answers[string] }
  | { type: "SET_CLOSING"; field: "q1" | "q2"; value: string[] }
  | { type: "SET_CLOSING_OTHER"; field: "q1Other" | "q2Other"; value: string }
  | { type: "HYDRATE"; state: QuizState }
  | { type: "RESET" };

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "SET_COMPANY_FIELD":
      return { ...state, companyInfo: { ...state.companyInfo, [action.field]: action.value } };
    case "SET_COMPANY_DEPARTMENTS":
      return { ...state, companyInfo: { ...state.companyInfo, departments: action.value } };
    case "SET_ANSWER":
      return { ...state, answers: { ...state.answers, [action.questionId]: action.value } };
    case "SET_CLOSING":
      return { ...state, closing: { ...state.closing, [action.field]: action.value } };
    case "SET_CLOSING_OTHER":
      return { ...state, closing: { ...state.closing, [action.field]: action.value } };
    case "HYDRATE":
      return action.state;
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface QuizContextValue extends QuizState {
  setCompanyField: (field: CompanyTextField, value: string) => void;
  setCompanyDepartments: (value: string[]) => void;
  setAnswer: (questionId: string, value: Answers[string]) => void;
  setClosing: (field: "q1" | "q2", value: string[]) => void;
  setClosingOther: (field: "q1Other" | "q2Other", value: string) => void;
  reset: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        dispatch({ type: "HYDRATE", state: JSON.parse(raw) as QuizState });
      } catch {
        // 忽略壞掉的暫存資料
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<QuizContextValue>(
    () => ({
      ...state,
      setCompanyField: (field, value) => dispatch({ type: "SET_COMPANY_FIELD", field, value }),
      setCompanyDepartments: (value) => dispatch({ type: "SET_COMPANY_DEPARTMENTS", value }),
      setAnswer: (questionId, value) => dispatch({ type: "SET_ANSWER", questionId, value }),
      setClosing: (field, value) => dispatch({ type: "SET_CLOSING", field, value }),
      setClosingOther: (field, value) => dispatch({ type: "SET_CLOSING_OTHER", field, value }),
      reset: () => {
        dispatch({ type: "RESET" });
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [state]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuizStore(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuizStore must be used within QuizProvider");
  return ctx;
}
