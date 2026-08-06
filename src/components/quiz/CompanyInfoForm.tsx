"use client";

import type { CompanyInfo } from "@/lib/quiz-store";
import { IDENTITY_TYPE_OPTIONS, PURPOSE_OPTIONS, useQuizStore } from "@/lib/quiz-store";

/** 已從原站 JS 打包檔的表單驗證文字逐字確認的文字輸入欄位 */
const TEXT_FIELDS: { key: keyof CompanyInfo; label: string }[] = [
  { key: "role", label: "職稱" },
  { key: "companyName", label: "公司名稱" },
  { key: "taxId", label: "公司統編" },
];

/** 未在原站程式碼中逐一驗證，沿用交接文件測試假資料的欄位猜測 */
const UNVERIFIED_FIELDS: { key: keyof CompanyInfo; label: string; placeholder?: string }[] = [
  { key: "address", label: "地址" },
  { key: "industry", label: "產業別", placeholder: "例：C27 電腦、電子產品及光學製品製造業" },
  { key: "city", label: "縣市" },
  { key: "employeeScale", label: "員工規模" },
  { key: "department", label: "部門" },
];

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
const labelClass = "mb-1 block text-sm font-medium text-black";

export function CompanyInfoForm() {
  const { companyInfo, setCompanyField } = useQuizStore();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.08)]">
      <h2 className="text-lg font-semibold text-black">公司基本資料</h2>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        此頁不影響計分結果，僅供產出報告時顯示公司資訊。
      </p>

      <div className="space-y-4">
        {TEXT_FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className={labelClass}>{field.label}</span>
            <input
              type="text"
              value={companyInfo[field.key] ?? ""}
              onChange={(e) => setCompanyField(field.key, e.target.value)}
              className={inputClass}
            />
          </label>
        ))}

        <label className="block">
          <span className={labelClass}>身份類型</span>
          <select
            value={companyInfo.identityType ?? ""}
            onChange={(e) => setCompanyField("identityType", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              請選擇
            </option>
            {IDENTITY_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        {companyInfo.identityType === "其他" && (
          <label className="block">
            <span className={labelClass}>其他身份類別</span>
            <input
              type="text"
              value={companyInfo.identityTypeOther ?? ""}
              onChange={(e) => setCompanyField("identityTypeOther", e.target.value)}
              className={inputClass}
            />
          </label>
        )}

        <label className="block">
          <span className={labelClass}>申請用途</span>
          <select
            value={companyInfo.purpose ?? ""}
            onChange={(e) => setCompanyField("purpose", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              請選擇
            </option>
            {PURPOSE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        {companyInfo.purpose === "其他" && (
          <label className="block">
            <span className={labelClass}>其他用途</span>
            <input
              type="text"
              value={companyInfo.purposeOther ?? ""}
              onChange={(e) => setCompanyField("purposeOther", e.target.value)}
              className={inputClass}
            />
          </label>
        )}

        {UNVERIFIED_FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className={labelClass}>{field.label}</span>
            <input
              type="text"
              value={companyInfo[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => setCompanyField(field.key, e.target.value)}
              className={inputClass}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
