"use client";

import { useQuizStore } from "@/lib/quiz-store";

/**
 * 原站 page6（第五部分之後的結尾兩題，Q18、Q19），已驗證勾任何組合都不影響
 * 五大構面分數與等級（見交接文件第5節），純粹是資訊蒐集用途。題目與選項文字
 * 為使用者親自截圖原站問卷後逐字轉錄。
 */
const MAX_SELECT = 5;

const Q18_OPTIONS = [
  "產品研發設計",
  "生產製程",
  "供應鏈管理",
  "品質檢測",
  "設備維護",
  "廠務管理",
  "工廠碳排能耗",
  "業務客服",
  "營運管理行銷",
  "人力資源",
  "物流倉儲",
];

const Q19_OPTIONS = [
  "尚無AI應用需求",
  "導入AI的金額成本太高",
  "缺乏相關技術人才",
  "目標效益難以量化",
  "風險難以評估",
  "組織文化不支持創新",
  "擔心公司資料外洩",
  "公司資料尚未進行整合",
  "領導階層對於AI認知不足",
  "IT基礎建設不足",
  "AI系統的穩定性和可靠性不足",
  "維護和升級成本過高",
  "能源成本耗費過高，不符合企業的節能減碳目標",
];

const OTHER_VALUE = "其他";

export function ClosingQuestionsForm() {
  const { closing, setClosing, setClosingOther } = useQuizStore();

  const renderQuestion = (
    field: "q1" | "q2",
    otherField: "q1Other" | "q2Other",
    index: number,
    title: string,
    options: string[]
  ) => {
    const selected = closing[field];
    const otherText = closing[otherField];
    const atLimit = selected.length >= MAX_SELECT;

    const toggle = (value: string) => {
      const isSelected = selected.includes(value);
      if (!isSelected && atLimit) return; // 最多選 MAX_SELECT 個
      const next = isSelected ? selected.filter((v) => v !== value) : [...selected, value];
      setClosing(field, next);
    };

    return (
      <fieldset key={field} className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <legend className="mb-4 font-semibold text-black">
          {index}.{title}
          <span className="ml-2 text-xs font-normal text-gray-500">
            【複選，最多選{MAX_SELECT}個】
          </span>
        </legend>
        <div className="space-y-3">
          {options.map((label) => {
            const disabled = !selected.includes(label) && atLimit;
            return (
              <label
                key={label}
                className={`flex items-center gap-3 text-black ${
                  disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(label)}
                  disabled={disabled}
                  onChange={() => toggle(label)}
                  className="h-4 w-4 shrink-0 accent-[#2a78d6]"
                />
                <span>{label}</span>
              </label>
            );
          })}
          <label
            className={`flex items-center gap-3 text-black ${
              !selected.includes(OTHER_VALUE) && atLimit
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(OTHER_VALUE)}
              disabled={!selected.includes(OTHER_VALUE) && atLimit}
              onChange={() => toggle(OTHER_VALUE)}
              className="h-4 w-4 shrink-0 accent-[#2a78d6]"
            />
            <span>其他</span>
          </label>
          {selected.includes(OTHER_VALUE) && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => setClosingOther(otherField, e.target.value)}
              placeholder="請輸入其他內容"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-[#3987e5] focus:outline-none focus:ring-2 focus:ring-[#3987e5]/20"
            />
          )}
        </div>
      </fieldset>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">公司經營目標與痛點</h2>
        <p className="mt-1 text-sm text-slate-400">這兩題不影響計分，純粹是資訊蒐集用途。</p>
      </div>
      {renderQuestion(
        "q1",
        "q1Other",
        18,
        "貴公司除現階段已導入的AI應用外，還有哪些營運痛點或業務場景規劃下一步導入AI？",
        Q18_OPTIONS
      )}
      {renderQuestion(
        "q2",
        "q2Other",
        19,
        "貴公司無論目前AI應用的進程如何，您認為公司在應用或執行AI專案上，主要面臨哪些挑戰？",
        Q19_OPTIONS
      )}
    </div>
  );
}
