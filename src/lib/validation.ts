import type { CompanyInfo } from "./quiz-store";
import type { Answers, Question } from "./scoring/types";

export type CompanyInfoErrors = Partial<Record<keyof CompanyInfo, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAX_ID_RE = /^\d{8}$/;
const PHONE_RE = /^[0-9+\-() ]{7,20}$/;

export const OTHER_DEPARTMENT = "其他部門";

export function validateCompanyInfo(info: CompanyInfo): CompanyInfoErrors {
  const errors: CompanyInfoErrors = {};

  if (!info.companyName?.trim()) errors.companyName = "請填寫公司名稱";

  if (!info.taxId?.trim()) errors.taxId = "請填寫統一編號";
  else if (!TAX_ID_RE.test(info.taxId.trim())) errors.taxId = "格式錯誤，統一編號須為 8 碼數字";

  if (!info.subIndustry) errors.subIndustry = "請選擇次產業別";
  if (!info.city) errors.city = "請選擇縣市";
  if (!info.address?.trim()) errors.address = "請填寫地址";
  if (!info.employeeScale) errors.employeeScale = "請選擇員工人數規模";
  if (!info.respondentName?.trim()) errors.respondentName = "請填寫姓名";
  if (!info.respondentLevel) errors.respondentLevel = "請選擇職稱職級";

  if (!info.departments || info.departments.length === 0) {
    errors.departments = "請至少選擇一個部門";
  } else if (info.departments.includes(OTHER_DEPARTMENT) && !info.departmentOther?.trim()) {
    errors.departmentOther = "請填寫其他部門名稱";
  }

  if (!info.departmentTitle?.trim()) errors.departmentTitle = "請填寫部門/職稱";

  if (!info.email?.trim()) errors.email = "請填寫 E-mail";
  else if (!EMAIL_RE.test(info.email.trim())) errors.email = "格式錯誤，請輸入正確的 E-mail";

  if (!info.phone?.trim()) errors.phone = "請填寫電話";
  else if (!PHONE_RE.test(info.phone.trim())) errors.phone = "格式錯誤，請輸入正確的電話號碼";

  return errors;
}

export function isCompanyInfoValid(info: CompanyInfo): boolean {
  return Object.keys(validateCompanyInfo(info)).length === 0;
}

export function validateQuestionAnswer(question: Question, answer: Answers[string] | undefined): string | null {
  if (question.type === "single") {
    return typeof answer === "string" && answer ? null : "請選擇一個選項";
  }
  if (question.type === "multi") {
    return Array.isArray(answer) && answer.length > 0 ? null : "請至少選擇一個選項";
  }
  const selections = (
    answer && typeof answer === "object" && !Array.isArray(answer) ? answer : {}
  ) as Record<string, string>;
  const allAnswered = question.subItems.every((sub) => Boolean(selections[sub.id]));
  return allAnswered ? null : "請完成每個項目的選擇";
}

export function validateClosingAnswer(
  selected: string[],
  otherValue: string,
  otherText: string
): string | null {
  if (selected.length === 0) return "請至少選擇一個選項";
  if (selected.includes(otherValue) && !otherText.trim()) return "請填寫其他內容";
  return null;
}
