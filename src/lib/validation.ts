import type { CompanyInfo } from "./quiz-store";
import type { Answers, Question } from "./scoring/types";

export type CompanyInfoErrors = Partial<Record<keyof CompanyInfo, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{7,20}$/;

/**
 * 目前先不強制必填（方便測試），只在有填寫時檢查 email／電話格式。
 * 之後要恢復必填檢查時，把對應欄位的 `if (!info.xxx) errors.xxx = "..."` 加回來即可。
 */
export function validateCompanyInfo(info: CompanyInfo): CompanyInfoErrors {
  const errors: CompanyInfoErrors = {};

  if (info.email?.trim() && !EMAIL_RE.test(info.email.trim())) {
    errors.email = "格式錯誤，請輸入正確的 E-mail";
  }
  if (info.phone?.trim() && !PHONE_RE.test(info.phone.trim())) {
    errors.phone = "格式錯誤，請輸入正確的電話號碼";
  }

  return errors;
}

export function isCompanyInfoValid(info: CompanyInfo): boolean {
  return Object.keys(validateCompanyInfo(info)).length === 0;
}

export function validateQuestionAnswer(_question: Question, answer: Answers[string] | undefined): string | null {
  return typeof answer === "string" && answer ? null : "請選擇一個選項";
}
