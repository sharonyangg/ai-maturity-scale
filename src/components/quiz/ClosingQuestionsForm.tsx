"use client";

import { useQuizStore } from "@/lib/quiz-store";

/**
 * 原站 page6 結尾兩題複選題，已驗證「勾任何組合都不影響五大構面分數與等級」，
 * 純資訊蒐集用途。選項文字為佔位文字。
 */
const CLOSING_OPTIONS = ["選項1", "選項2", "選項3", "選項4"];

export function ClosingQuestionsForm() {
  const { closing, setClosing } = useQuizStore();

  const toggle = (field: "q1" | "q2", value: string) => {
    const current = closing[field];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setClosing(field, next);
  };

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500">這兩題不影響計分，純粹是資訊蒐集用途。</p>
      {(["q1", "q2"] as const).map((field, idx) => (
        <fieldset key={field} className="space-y-3">
          <legend className="font-medium text-gray-900">
            結尾問題 {idx + 1}（待填入正式題目文字）
          </legend>
          <div className="space-y-2">
            {CLOSING_OPTIONS.map((label) => (
              <label
                key={label}
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2.5 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={closing[field].includes(label)}
                  onChange={() => toggle(field, label)}
                  className="accent-blue-600"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
