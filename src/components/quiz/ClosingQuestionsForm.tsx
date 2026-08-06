"use client";

import { useQuizStore } from "@/lib/quiz-store";
import {
  CLOSING_MAX_SELECT,
  CLOSING_OTHER_VALUE,
  Q18_OPTIONS,
  Q18_TITLE,
  Q19_OPTIONS,
  Q19_TITLE,
} from "@/lib/closing-questions";

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
    const atLimit = selected.length >= CLOSING_MAX_SELECT;

    const toggle = (value: string) => {
      const isSelected = selected.includes(value);
      if (!isSelected && atLimit) return; // 最多選 CLOSING_MAX_SELECT 個
      const next = isSelected ? selected.filter((v) => v !== value) : [...selected, value];
      setClosing(field, next);
    };

    return (
      <div key={field} className="rounded-2xl bg-[#f7faf8] p-6 shadow-[0_2px_16px_rgba(15,23,42,0.08)]">
        <p className="mb-4 text-lg font-semibold text-black break-words">
          {index}.{title}
          <span className="ml-2 text-sm font-normal text-gray-500">
            【複選，最多選{CLOSING_MAX_SELECT}個】
          </span>
        </p>
        <div className="space-y-3">
          {options.map((label) => {
            const disabled = !selected.includes(label) && atLimit;
            return (
              <label
                key={label}
                className={`flex items-start gap-3 text-base text-black transition-colors has-checked:text-emerald-700 has-checked:font-medium ${
                  disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(label)}
                  disabled={disabled}
                  onChange={() => toggle(label)}
                  className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                />
                <span className="min-w-0 break-words">{label}</span>
              </label>
            );
          })}
          <label
            className={`flex items-start gap-3 text-base text-black transition-colors has-checked:text-emerald-700 has-checked:font-medium ${
              !selected.includes(CLOSING_OTHER_VALUE) && atLimit
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(CLOSING_OTHER_VALUE)}
              disabled={!selected.includes(CLOSING_OTHER_VALUE) && atLimit}
              onChange={() => toggle(CLOSING_OTHER_VALUE)}
              className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
            />
            <span className="min-w-0 break-words">其他</span>
          </label>
          {selected.includes(CLOSING_OTHER_VALUE) && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => setClosingOther(otherField, e.target.value)}
              placeholder="請輸入其他內容"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">公司經營目標與痛點</h2>
        <p className="mt-1 text-base text-slate-500">這兩題不影響計分，純粹是資訊蒐集用途。</p>
      </div>
      {renderQuestion("q1", "q1Other", 18, Q18_TITLE, Q18_OPTIONS)}
      {renderQuestion("q2", "q2Other", 19, Q19_TITLE, Q19_OPTIONS)}
    </div>
  );
}
