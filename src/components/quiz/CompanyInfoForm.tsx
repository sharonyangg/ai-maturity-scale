"use client";

import {
  DEPARTMENT_OPTIONS,
  RESPONDENT_LEVEL_OPTIONS,
  SUB_INDUSTRY_OPTIONS,
  useQuizStore,
} from "@/lib/quiz-store";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
const labelClass = "mb-1 block text-base font-medium text-black";

const OTHER_DEPARTMENT = "其他部門";

export function CompanyInfoForm() {
  const { companyInfo, setCompanyField, setCompanyDepartments } = useQuizStore();
  const departments = companyInfo.departments ?? [];

  const toggleDepartment = (value: string) => {
    const next = departments.includes(value)
      ? departments.filter((v) => v !== value)
      : [...departments, value];
    setCompanyDepartments(next);
  };

  return (
    <div className="rounded-2xl bg-[#f7faf8] p-6 shadow-[0_2px_16px_rgba(15,23,42,0.08)]">
      <h2 className="text-xl font-semibold text-black">公司基本資料</h2>
      <p className="mt-1 mb-6 text-base text-gray-500">
        此頁不影響計分結果，僅供產出報告時顯示公司資訊。
      </p>

      <div className="space-y-4">
        <label className="block">
          <span className={labelClass}>公司名稱</span>
          <input
            type="text"
            value={companyInfo.companyName ?? ""}
            onChange={(e) => setCompanyField("companyName", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>統編</span>
          <input
            type="text"
            value={companyInfo.taxId ?? ""}
            onChange={(e) => setCompanyField("taxId", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>次產業別</span>
          <select
            value={companyInfo.subIndustry ?? ""}
            onChange={(e) => setCompanyField("subIndustry", e.target.value)}
            className={inputClass}
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

        <label className="block">
          <span className={labelClass}>填答職級</span>
          <select
            value={companyInfo.respondentLevel ?? ""}
            onChange={(e) => setCompanyField("respondentLevel", e.target.value)}
            className={inputClass}
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

        <div>
          <span className={labelClass}>填答部門（可複選）</span>
          <div className="space-y-2">
            {DEPARTMENT_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-3 text-base text-black">
                <input
                  type="checkbox"
                  checked={departments.includes(opt)}
                  onChange={() => toggleDepartment(opt)}
                  className="h-4 w-4 shrink-0 accent-emerald-600"
                />
                <span>{opt}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 text-base text-black">
              <input
                type="checkbox"
                checked={departments.includes(OTHER_DEPARTMENT)}
                onChange={() => toggleDepartment(OTHER_DEPARTMENT)}
                className="h-4 w-4 shrink-0 accent-emerald-600"
              />
              <span>其他部門</span>
            </label>
            {departments.includes(OTHER_DEPARTMENT) && (
              <input
                type="text"
                value={companyInfo.departmentOther ?? ""}
                onChange={(e) => setCompanyField("departmentOther", e.target.value)}
                placeholder="請輸入其他部門"
                className={inputClass}
              />
            )}
          </div>
        </div>

        <label className="block">
          <span className={labelClass}>E-mail</span>
          <input
            type="email"
            value={companyInfo.email ?? ""}
            onChange={(e) => setCompanyField("email", e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}
