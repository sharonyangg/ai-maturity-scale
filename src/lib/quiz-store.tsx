"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Answers } from "./scoring/types";

/**
 * page0（公司基本資料）在原站共有 q1~q13 共 13 個欄位，且不影響計分。
 * role / companyName / taxId / identityType / identityTypeOther / purpose / purposeOther
 * 這幾個欄位的名稱與選項，已從原站 JS 打包檔內的表單驗證文字逐字確認過。
 * address / industry / city / employeeScale / department 目前仍沿用交接文件測試假資料的欄位猜測，
 * 未在原站程式碼中逐一驗證。
 */
export const IDENTITY_TYPE_OPTIONS = [
  "製造業廠商",
  "服務業廠商",
  "公協會",
  "法人機構",
  "政府機關",
  "學界機構",
  "顧問公司",
  "技術方案業者",
  "其他",
] as const;

export const PURPOSE_OPTIONS = [
  "企業導入參考",
  "教育或教育訓練用",
  "產業研究需要",
  "個人興趣想了解",
  "其他",
] as const;

export interface CompanyInfo {
  role?: string;
  companyName?: string;
  taxId?: string;
  identityType?: string;
  identityTypeOther?: string;
  purpose?: string;
  purposeOther?: string;
  address?: string;
  industry?: string;
  city?: string;
  employeeScale?: string;
  department?: string;
}

/** 依原站欄位順序排列，供 Word 報告等需要「欄位 key → 中文標籤」對照的地方共用 */
export const COMPANY_FIELD_LABELS: Record<keyof CompanyInfo, string> = {
  role: "職稱",
  companyName: "公司名稱",
  taxId: "公司統編",
  identityType: "身份類型",
  identityTypeOther: "其他身份類別",
  purpose: "申請用途",
  purposeOther: "其他用途",
  address: "地址",
  industry: "產業別",
  city: "縣市",
  employeeScale: "員工規模",
  department: "部門",
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

const initialState: QuizState = {
  companyInfo: {},
  answers: {},
  closing: { q1: [], q1Other: "", q2: [], q2Other: "" },
};

type Action =
  | { type: "SET_COMPANY_FIELD"; field: keyof CompanyInfo; value: string }
  | { type: "SET_ANSWER"; questionId: string; value: Answers[string] }
  | { type: "SET_CLOSING"; field: "q1" | "q2"; value: string[] }
  | { type: "SET_CLOSING_OTHER"; field: "q1Other" | "q2Other"; value: string }
  | { type: "HYDRATE"; state: QuizState }
  | { type: "RESET" };

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "SET_COMPANY_FIELD":
      return { ...state, companyInfo: { ...state.companyInfo, [action.field]: action.value } };
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
  setCompanyField: (field: keyof CompanyInfo, value: string) => void;
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
