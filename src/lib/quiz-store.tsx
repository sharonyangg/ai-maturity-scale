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

/** page6 結尾兩題複選題，已驗證不影響計分，純資訊蒐集用途 */
export interface ClosingAnswers {
  q1: string[];
  q2: string[];
}

interface QuizState {
  companyInfo: CompanyInfo;
  answers: Answers;
  closing: ClosingAnswers;
}

const STORAGE_KEY = "ai-maturity-quiz-state";

const initialState: QuizState = {
  companyInfo: {},
  answers: {},
  closing: { q1: [], q2: [] },
};

type Action =
  | { type: "SET_COMPANY_FIELD"; field: keyof CompanyInfo; value: string }
  | { type: "SET_ANSWER"; questionId: string; value: Answers[string] }
  | { type: "SET_CLOSING"; field: keyof ClosingAnswers; value: string[] }
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
  setClosing: (field: keyof ClosingAnswers, value: string[]) => void;
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
