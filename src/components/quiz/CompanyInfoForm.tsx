"use client";

import type { CompanyInfo } from "@/lib/quiz-store";
import { useQuizStore } from "@/lib/quiz-store";

/**
 * 原站 page0 共有 q1~q13 共 13 個欄位，且已驗證不影響計分（見交接文件第5節）。
 * 這裡先列出交接文件測試假資料中出現過的欄位，其餘欄位待對照原站補齊。
 */
const FIELDS: { key: keyof CompanyInfo; label: string; placeholder?: string }[] = [
  { key: "companyName", label: "公司名稱" },
  { key: "taxId", label: "統一編號" },
  { key: "address", label: "地址" },
  { key: "industry", label: "產業別", placeholder: "例：C27 電腦、電子產品及光學製品製造業" },
  { key: "city", label: "縣市" },
  { key: "employeeScale", label: "員工規模" },
  { key: "role", label: "填寫人職稱" },
  { key: "department", label: "部門" },
  { key: "purpose", label: "填寫目的" },
  { key: "email", label: "Email" },
];

export function CompanyInfoForm() {
  const { companyInfo, setCompanyField } = useQuizStore();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">公司基本資料</h2>
      <p className="text-sm text-gray-500">
        此頁不影響計分結果，僅供產出報告時顯示公司資訊。
      </p>
      {FIELDS.map((field) => (
        <label key={field.key} className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">{field.label}</span>
          <input
            type="text"
            value={companyInfo[field.key] ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => setCompanyField(field.key, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </label>
      ))}
    </div>
  );
}
