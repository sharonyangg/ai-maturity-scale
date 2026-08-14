"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Answers } from "./scoring/types";

export const CITY_OPTIONS = [
  "臺北市",
  "新北市",
  "桃園市",
  "臺中市",
  "臺南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義縣",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
] as const;

export const EMPLOYEE_SCALE_OPTIONS = [
  "9人以下，小微型企業",
  "10-200人，中小企業",
  "201-1000人，大型企業",
  "1001人以上，巨型企業",
] as const;

export interface CompanyInfo {
  companyName?: string;
  city?: string;
  employeeScale?: string;
  respondentName?: string;
  respondentTitle?: string;
  email?: string;
  phone?: string;
}

export const COMPANY_FIELD_LABELS: Record<keyof CompanyInfo, string> = {
  companyName: "公司/機構名稱",
  city: "登記地址所處縣市",
  employeeScale: "員工人數規模",
  respondentName: "姓名",
  respondentTitle: "職稱與職級",
  email: "E-mail",
  phone: "電話",
};

interface QuizState {
  companyInfo: CompanyInfo;
  answers: Answers;
  /** 後測流程中，從上傳的前測 Word 報告解析出的前測作答內容 */
  prevAnswers: Answers | null;
}

const STORAGE_KEY = "ai-maturity-quiz-state";

export function clearStoredQuizState() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEY);
}

export function getStoredCompanyInfo(): CompanyInfo {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
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
  prevAnswers: null,
};

type Action =
  | { type: "SET_COMPANY_FIELD"; field: keyof CompanyInfo; value: string }
  | { type: "SET_ANSWER"; questionId: string; value: Answers[string] }
  | { type: "SET_PREV_ANSWERS"; value: Answers | null }
  | { type: "HYDRATE"; state: QuizState }
  | { type: "RESET" };

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "SET_COMPANY_FIELD":
      return { ...state, companyInfo: { ...state.companyInfo, [action.field]: action.value } };
    case "SET_ANSWER":
      return { ...state, answers: { ...state.answers, [action.questionId]: action.value } };
    case "SET_PREV_ANSWERS":
      return { ...state, prevAnswers: action.value };
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
  setPrevAnswers: (value: Answers | null) => void;
  reset: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        dispatch({ type: "HYDRATE", state: JSON.parse(raw) as QuizState });
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<QuizContextValue>(
    () => ({
      ...state,
      setCompanyField: (field, value) => dispatch({ type: "SET_COMPANY_FIELD", field, value }),
      setAnswer: (questionId, value) => dispatch({ type: "SET_ANSWER", questionId, value }),
      setPrevAnswers: (value) => dispatch({ type: "SET_PREV_ANSWERS", value }),
      reset: () => {
        dispatch({ type: "RESET" });
        window.sessionStorage.removeItem(STORAGE_KEY);
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
