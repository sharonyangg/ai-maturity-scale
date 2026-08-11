"use client";

import { useQuizStore } from "@/lib/quiz-store";
import { QuestionNumberBadge } from "@/components/quiz/QuestionField";
import { validateClosingAnswer } from "@/lib/validation";
import {
  CLOSING_MAX_SELECT,
  CLOSING_OTHER_VALUE,
  Q18_OPTIONS,
  Q18_TITLE,
  Q19_OPTIONS,
  Q19_TITLE,
} from "@/lib/closing-questions";

export function ClosingQuestionsForm({ showErrors = false }: { showErrors?: boolean }) {
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
    const error = showErrors ? validateClosingAnswer(selected, CLOSING_OTHER_VALUE, otherText) : null;

    const toggle = (value: string) => {
      const isSelected = selected.includes(value);
      if (!isSelected && atLimit) return;
      const next = isSelected ? selected.filter((v) => v !== value) : [...selected, value];
      setClosing(field, next);
    };

    return (
      <div
        key={field}
        className={`rounded-2xl bg-[#f7faf8] p-5 shadow-[0_2px_16px_rgba(15,23,42,0.08)] sm:p-6${
          error ? " ring-2 ring-red-500" : ""
        }`}
      >
        <div className="mb-5 flex items-start gap-3 border-b border-emerald-900/10 pb-4">
          <QuestionNumberBadge number={index} />
          <p className="min-w-0 break-words text-lg font-semibold text-black">
            {title}
            <span className="ml-2 text-sm font-normal text-gray-500">
              【複選，最多選{CLOSING_MAX_SELECT}個】
            </span>
          </p>
        </div>
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
                  className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
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
              className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
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
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
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
