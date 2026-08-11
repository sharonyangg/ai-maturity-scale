"use client";

import {
  CITY_OPTIONS,
  DEPARTMENT_OPTIONS,
  EMPLOYEE_SCALE_OPTIONS,
  RESPONDENT_LEVEL_OPTIONS,
  SUB_INDUSTRY_OPTIONS,
  useQuizStore,
} from "@/lib/quiz-store";
import { OTHER_DEPARTMENT, validateCompanyInfo } from "@/lib/validation";

const CARD_CLASS = "rounded-2xl bg-[#f7faf8] p-5 shadow-[0_2px_16px_rgba(15,23,42,0.08)] sm:p-6";
const BASE_INPUT_CLASS =
  "w-full rounded-lg border px-3 py-2 text-base text-black focus:outline-none focus:ring-2";
const labelClass = "mb-3 block text-lg font-semibold text-black";
const ERROR_TEXT_CLASS = "mt-1.5 text-sm font-medium text-red-600";

function inputClass(hasError: boolean): string {
  return `${BASE_INPUT_CLASS} ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
  }`;
}

export function CompanyInfoForm({ showErrors = false }: { showErrors?: boolean }) {
  const { companyInfo, setCompanyField, setCompanyDepartments } = useQuizStore();
  const departments = companyInfo.departments ?? [];
  const errors = showErrors ? validateCompanyInfo(companyInfo) : {};

  const toggleDepartment = (value: string) => {
    const next = departments.includes(value)
      ? departments.filter((v) => v !== value)
      : [...departments, value];
    setCompanyDepartments(next);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">公司基本資料</h2>
        <p className="mt-1 text-base text-slate-500">
          此頁不影響計分結果，僅供產出報告時顯示公司資訊。
        </p>
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>1. 請問您的公司登記完整中文名稱？</span>
          <input
            type="text"
            value={companyInfo.companyName ?? ""}
            onChange={(e) => setCompanyField("companyName", e.target.value)}
            className={inputClass(Boolean(errors.companyName))}
          />
        </label>
        {errors.companyName && <p className={ERROR_TEXT_CLASS}>{errors.companyName}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>2. 請問您的公司統一編號？</span>
          <input
            type="text"
            value={companyInfo.taxId ?? ""}
            onChange={(e) => setCompanyField("taxId", e.target.value)}
            className={inputClass(Boolean(errors.taxId))}
          />
        </label>
        {errors.taxId && <p className={ERROR_TEXT_CLASS}>{errors.taxId}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>
            3. 請問貴公司於製造業所屬的主要次產業別？(依據行政院主計總處行業分類)
          </span>
          <select
            value={companyInfo.subIndustry ?? ""}
            onChange={(e) => setCompanyField("subIndustry", e.target.value)}
            className={inputClass(Boolean(errors.subIndustry))}
          >
            <option value="" disabled>
              請選擇
            </option>
            {SUB_INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        {errors.subIndustry && <p className={ERROR_TEXT_CLASS}>{errors.subIndustry}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>4. 請問貴公司登記地址所處縣市？</span>
          <select
            value={companyInfo.city ?? ""}
            onChange={(e) => setCompanyField("city", e.target.value)}
            className={inputClass(Boolean(errors.city))}
          >
            <option value="" disabled>
              請選擇
            </option>
            {CITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        {errors.city && <p className={ERROR_TEXT_CLASS}>{errors.city}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>5. 請問貴公司登記地址？</span>
          <input
            type="text"
            value={companyInfo.address ?? ""}
            onChange={(e) => setCompanyField("address", e.target.value)}
            className={inputClass(Boolean(errors.address))}
          />
        </label>
        {errors.address && <p className={ERROR_TEXT_CLASS}>{errors.address}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>6. 請問貴公司員工人數規模？</span>
          <select
            value={companyInfo.employeeScale ?? ""}
            onChange={(e) => setCompanyField("employeeScale", e.target.value)}
            className={inputClass(Boolean(errors.employeeScale))}
          >
            <option value="" disabled>
              請選擇
            </option>
            {EMPLOYEE_SCALE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        {errors.employeeScale && <p className={ERROR_TEXT_CLASS}>{errors.employeeScale}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>7. 請問您的姓名？</span>
          <input
            type="text"
            value={companyInfo.respondentName ?? ""}
            onChange={(e) => setCompanyField("respondentName", e.target.value)}
            className={inputClass(Boolean(errors.respondentName))}
          />
        </label>
        {errors.respondentName && <p className={ERROR_TEXT_CLASS}>{errors.respondentName}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>8. 請問您的公司職稱職級？</span>
          <select
            value={companyInfo.respondentLevel ?? ""}
            onChange={(e) => setCompanyField("respondentLevel", e.target.value)}
            className={inputClass(Boolean(errors.respondentLevel))}
          >
            <option value="" disabled>
              請選擇
            </option>
            {RESPONDENT_LEVEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        {errors.respondentLevel && <p className={ERROR_TEXT_CLASS}>{errors.respondentLevel}</p>}
      </div>

      <div className={CARD_CLASS}>
        <span className={labelClass}>9. 請問您的部門？（若共同填寫可填多個部門）</span>
        <div className="space-y-2">
          {DEPARTMENT_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-3 text-base text-black">
              <input
                type="checkbox"
                checked={departments.includes(opt)}
                onChange={() => toggleDepartment(opt)}
                className="h-5 w-5 shrink-0 accent-emerald-600"
              />
              <span>{opt}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 text-base text-black">
            <input
              type="checkbox"
              checked={departments.includes(OTHER_DEPARTMENT)}
              onChange={() => toggleDepartment(OTHER_DEPARTMENT)}
              className="h-5 w-5 shrink-0 accent-emerald-600"
            />
            <span>其他部門</span>
          </label>
          {departments.includes(OTHER_DEPARTMENT) && (
            <div>
              <input
                type="text"
                value={companyInfo.departmentOther ?? ""}
                onChange={(e) => setCompanyField("departmentOther", e.target.value)}
                placeholder="請輸入其他部門"
                className={inputClass(Boolean(errors.departmentOther))}
              />
              {errors.departmentOther && <p className={ERROR_TEXT_CLASS}>{errors.departmentOther}</p>}
            </div>
          )}
        </div>
        {errors.departments && <p className={ERROR_TEXT_CLASS}>{errors.departments}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>10. 請問您的部門與職稱？</span>
          <input
            type="text"
            value={companyInfo.departmentTitle ?? ""}
            onChange={(e) => setCompanyField("departmentTitle", e.target.value)}
            className={inputClass(Boolean(errors.departmentTitle))}
          />
        </label>
        {errors.departmentTitle && <p className={ERROR_TEXT_CLASS}>{errors.departmentTitle}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>11. 請問您的E-mail？</span>
          <input
            type="email"
            value={companyInfo.email ?? ""}
            onChange={(e) => setCompanyField("email", e.target.value)}
            className={inputClass(Boolean(errors.email))}
          />
        </label>
        {errors.email && <p className={ERROR_TEXT_CLASS}>{errors.email}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>12. 請問您的電話是？</span>
          <input
            type="tel"
            value={companyInfo.phone ?? ""}
            onChange={(e) => setCompanyField("phone", e.target.value)}
            className={inputClass(Boolean(errors.phone))}
          />
        </label>
        {errors.phone && <p className={ERROR_TEXT_CLASS}>{errors.phone}</p>}
      </div>
    </div>
  );
}
