"use client";

import { CITY_OPTIONS, EMPLOYEE_SCALE_OPTIONS, useQuizStore } from "@/lib/quiz-store";
import { validateCompanyInfo } from "@/lib/validation";

const CARD_CLASS =
  "rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-[0_8px_32px_rgba(148,163,223,0.15)] backdrop-blur-xl transition-all duration-300 sm:p-6";
const BASE_INPUT_CLASS =
  "w-full rounded-full border-2 bg-white/60 px-5 py-2.5 text-base text-slate-700 backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-2";
const labelClass = "mb-3 block text-lg font-semibold text-slate-700";
const ERROR_TEXT_CLASS = "mt-1.5 text-sm font-medium text-rose-500";

function inputClass(hasError: boolean): string {
  return `${BASE_INPUT_CLASS} ${
    hasError
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-300/30"
      : "border-white/40 focus:border-sky-300 focus:ring-sky-300/30"
  }`;
}

export function CompanyInfoForm({ showErrors = false }: { showErrors?: boolean }) {
  const { companyInfo, setCompanyField } = useQuizStore();
  const errors = showErrors ? validateCompanyInfo(companyInfo) : {};

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-700">公司個人資料</h2>
        <p className="mt-1 text-base leading-relaxed text-slate-600">
          此頁不影響計分結果，僅供產出報告時顯示公司資訊。
        </p>
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>1. 請問貴公司/機構登記完整中文名稱？(若為個人請填姓名)</span>
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
          <span className={labelClass}>2. 請問貴公司/機構登記地址所處縣市？</span>
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
          <span className={labelClass}>3. 請問貴公司/機構員工人數規模？</span>
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
          <span className={labelClass}>4. 請問您的姓名？</span>
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
          <span className={labelClass}>5. 請問您的職稱與職級？</span>
          <input
            type="text"
            value={companyInfo.respondentTitle ?? ""}
            onChange={(e) => setCompanyField("respondentTitle", e.target.value)}
            className={inputClass(Boolean(errors.respondentTitle))}
          />
        </label>
        {errors.respondentTitle && <p className={ERROR_TEXT_CLASS}>{errors.respondentTitle}</p>}
      </div>

      <div className={CARD_CLASS}>
        <label className="block">
          <span className={labelClass}>6. 請問您的 email？</span>
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
          <span className={labelClass}>7. 請問您的電話？</span>
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
