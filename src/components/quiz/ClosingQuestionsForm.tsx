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
      <fieldset key={field} className="space-y-3">
        <legend className="font-medium text-gray-900">
          {index}.{title}
          <span className="ml-2 text-xs font-normal text-gray-500">
            【複選，最多選{MAX_SELECT}個】
          </span>
        </legend>
        <div className="space-y-2">
          {options.map((label) => {
            const disabled = !selected.includes(label) && atLimit;
            return (
              <label
                key={label}
                className={`flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2.5 ${
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(label)}
                  disabled={disabled}
                  onChange={() => toggle(label)}
                  className="accent-blue-600"
                />
                <span>{label}</span>
              </label>
            );
          })}
          <label
            className={`flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2.5 ${
              !selected.includes(OTHER_VALUE) && atLimit
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(OTHER_VALUE)}
              disabled={!selected.includes(OTHER_VALUE) && atLimit}
              onChange={() => toggle(OTHER_VALUE)}
              className="accent-blue-600"
            />
            <span>其他</span>
          </label>
          {selected.includes(OTHER_VALUE) && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => setClosingOther(otherField, e.target.value)}
              placeholder="請輸入其他內容"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          )}
        </div>
      </fieldset>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-900">公司經營目標與痛點</h2>
      <p className="text-sm text-gray-500">這兩題不影響計分，純粹是資訊蒐集用途。</p>
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
