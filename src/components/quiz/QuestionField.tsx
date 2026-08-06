"use client";

import type { Question } from "@/lib/scoring/types";
import { useQuizStore } from "@/lib/quiz-store";

export function QuestionField({ question }: { question: Question }) {
  const { answers, setAnswer } = useQuizStore();
  const answer = answers[question.id];

  if (question.type === "single") {
    const selected = typeof answer === "string" ? answer : undefined;
    return (
      <fieldset className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <legend className="mb-4 font-semibold text-black">{question.title}</legend>
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer text-black"
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={selected === option.value}
                onChange={() => setAnswer(question.id, option.value)}
                className="h-4 w-4 shrink-0 accent-[#2a78d6]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
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
      <fieldset className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <legend className="mb-4 font-semibold text-black">{question.title}</legend>
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer text-black"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 shrink-0 accent-[#2a78d6]"
              />
              <span>{option.label}</span>
            </label>
          ))}
          {question.noneOption && (
            <label className="flex items-center gap-3 cursor-pointer text-black">
              <input
                type="checkbox"
                checked={isNoneSelected}
                onChange={() => toggle(question.noneOption!.value)}
                className="h-4 w-4 shrink-0 accent-[#2a78d6]"
              />
              <span>{question.noneOption.label}</span>
            </label>
          )}
        </div>
      </fieldset>
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
    <fieldset className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <legend className="mb-4 font-semibold text-black">{question.title}</legend>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left font-normal text-gray-500 py-2" />
              {question.subItemOptions.map((opt) => (
                <th key={opt.value} className="text-center font-normal text-gray-500 py-2 px-2">
                  {opt.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.subItems.map((sub) => (
              <tr key={sub.id} className="border-t border-gray-100">
                <td className="py-2.5 pr-4 text-black">{sub.label}</td>
                {question.subItemOptions.map((opt) => (
                  <td key={opt.value} className="text-center py-2.5 px-2">
                    <input
                      type="radio"
                      name={`${question.id}_${sub.id}`}
                      value={opt.value}
                      checked={selections[sub.id] === opt.value}
                      onChange={() => setSubItem(sub.id, opt.value)}
                      className="h-4 w-4 accent-[#2a78d6]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </fieldset>
  );
}
