import type { CompanyInfo } from "./quiz-store";
import type { Answers, Question } from "./scoring/types";

export type CompanyInfoErrors = Partial<Record<keyof CompanyInfo, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{7,20}$/;

export function validateCompanyInfo(info: CompanyInfo): CompanyInfoErrors {
  const errors: CompanyInfoErrors = {};

  if (!info.companyName?.trim()) errors.companyName = "請填寫公司/機構名稱";
  if (!info.city?.trim()) errors.city = "請選擇登記地址所處縣市";
  if (!info.employeeScale?.trim()) errors.employeeScale = "請選擇員工人數規模";
  if (!info.respondentName?.trim()) errors.respondentName = "請填寫姓名";
  if (!info.respondentTitle?.trim()) errors.respondentTitle = "請填寫職稱與職級";

  if (!info.email?.trim()) {
    errors.email = "請填寫 E-mail";
  } else if (!EMAIL_RE.test(info.email.trim())) {
    errors.email = "格式錯誤，請輸入正確的 E-mail";
  }

  if (!info.phone?.trim()) {
    errors.phone = "請填寫電話";
  } else if (!PHONE_RE.test(info.phone.trim())) {
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
