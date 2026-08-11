"use client";

import type { Question } from "@/lib/scoring/types";
import { useQuizStore } from "@/lib/quiz-store";
import { validateQuestionAnswer } from "@/lib/validation";

const CARD_CLASS = "rounded-2xl bg-[#f7faf8] p-5 shadow-[0_2px_16px_rgba(15,23,42,0.08)] sm:p-6";
const OPTION_LABEL_CLASS =
  "flex items-start gap-3 cursor-pointer text-base text-black transition-colors has-checked:text-emerald-700 has-checked:font-medium";

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mt-3 text-sm font-medium text-red-600">{message}</p>;
}

export function QuestionNumberBadge({ number }: { number: string | number }) {
  return (
    <span className="inline-block h-7 w-7 shrink-0 rounded-full bg-emerald-600 text-center text-sm leading-7 font-bold text-white tabular-nums">
      {number}
    </span>
  );
}

function QuestionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-emerald-900/10 pb-4">
      <QuestionNumberBadge number={number} />
      <p className="min-w-0 break-words text-lg font-semibold text-black">{title}</p>
    </div>
  );
}

export function QuestionField({
  question,
  showError = false,
}: {
  question: Question;
  showError?: boolean;
}) {
  const { answers, setAnswer } = useQuizStore();
  const answer = answers[question.id];
  const number = question.id.replace(/^Q/, "");
  const error = showError ? validateQuestionAnswer(question, answer) : null;
  const cardClass = `${CARD_CLASS}${error ? " ring-2 ring-red-500" : ""}`;

  if (question.type === "single") {
    const selected = typeof answer === "string" ? answer : undefined;
    return (
      <div className={cardClass}>
        <QuestionHeader number={number} title={question.title} />
        <div className="space-y-3">
          {question.options.map((option) => (
            <label key={option.value} className={OPTION_LABEL_CLASS}>
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={selected === option.value}
                onChange={() => setAnswer(question.id, option.value)}
                className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
              />
              <span className="min-w-0 break-words">{option.label}</span>
            </label>
          ))}
        </div>
        <ErrorText message={error} />
      </div>
    );
  }

  if (question.type === "multi") {
    const selected = Array.isArray(answer) ? answer : [];
    const noneValue = question.noneOption?.value;
    const isNoneSelected = noneValue !== undefined && selected.includes(noneValue);

    const toggle = (value: string) => {
      // 「以上皆無」與其他選項互斥：勾其中一種要清掉另一種
      if (value === noneValue) {
        setAnswer(question.id, isNoneSelected ? [] : [value]);
        return;
      }
      const withoutNone = noneValue ? selected.filter((v) => v !== noneValue) : selected;
      const next = withoutNone.includes(value)
        ? withoutNone.filter((v) => v !== value)
        : [...withoutNone, value];
      setAnswer(question.id, next);
    };

    return (
      <div className={cardClass}>
        <QuestionHeader number={number} title={question.title} />
        <div className="space-y-3">
          {question.options.map((option) => (
            <label key={option.value} className={OPTION_LABEL_CLASS}>
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
              />
              <span className="min-w-0 break-words">{option.label}</span>
            </label>
          ))}
          {question.noneOption && (
            <label className={OPTION_LABEL_CLASS}>
              <input
                type="checkbox"
                checked={isNoneSelected}
                onChange={() => toggle(question.noneOption!.value)}
                className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
              />
              <span className="min-w-0 break-words">{question.noneOption.label}</span>
            </label>
          )}
        </div>
        <ErrorText message={error} />
      </div>
    );
  }

  // matrix
  const selections = (typeof answer === "object" && !Array.isArray(answer) ? answer : {}) as Record<
    string,
    string
  >;
  const setSubItem = (subItemId: string, value: string) => {
    setAnswer(question.id, { ...selections, [subItemId]: value });
  };

  return (
    <div className={cardClass}>
      <QuestionHeader number={number} title={question.title} />
      <div className="overflow-x-auto">
        <table className="w-full text-base border-collapse">
          <thead>
            <tr>
              <th className="text-left font-normal text-gray-500 py-2" />
              {question.subItemOptions.map((opt) => (
                <th
                  key={opt.value}
                  className="min-w-[86px] break-words text-center font-normal text-gray-500 py-2 px-2"
                >
                  {opt.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.subItems.map((sub) => (
              <tr key={sub.id} className="border-t border-gray-100">
                <td className="max-w-[160px] break-words py-2.5 pr-4 text-black">{sub.label}</td>
                {question.subItemOptions.map((opt) => (
                  <td key={opt.value} className="text-center py-2.5 px-2">
                    <input
                      type="radio"
                      name={`${question.id}_${sub.id}`}
                      value={opt.value}
                      checked={selections[sub.id] === opt.value}
                      onChange={() => setSubItem(sub.id, opt.value)}
                      className="h-5 w-5 accent-emerald-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ErrorText message={error} />
    </div>
  );
}
