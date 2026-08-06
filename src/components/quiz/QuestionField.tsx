"use client";

import type { Question } from "@/lib/scoring/types";
import { useQuizStore } from "@/lib/quiz-store";

export function QuestionField({ question }: { question: Question }) {
  const { answers, setAnswer } = useQuizStore();
  const answer = answers[question.id];

  if (question.type === "single") {
    const selected = typeof answer === "string" ? answer : undefined;
    return (
      <fieldset className="space-y-3">
        <legend className="font-medium text-gray-900">{question.title}</legend>
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2.5 cursor-pointer hover:bg-gray-50 has-checked:border-blue-500 has-checked:bg-blue-50"
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={selected === option.value}
                onChange={() => setAnswer(question.id, option.value)}
                className="accent-blue-600"
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
    const toggle = (value: string) => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      setAnswer(question.id, next);
    };
    return (
      <fieldset className="space-y-3">
        <legend className="font-medium text-gray-900">
          {question.title}
          <span className="ml-2 text-xs font-normal text-gray-500">（複選）</span>
        </legend>
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2.5 cursor-pointer hover:bg-gray-50 has-checked:border-blue-500 has-checked:bg-blue-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="accent-blue-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
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
    <fieldset className="space-y-3">
      <legend className="font-medium text-gray-900">{question.title}</legend>
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
                <td className="py-2 pr-4 text-gray-800">{sub.label}</td>
                {question.subItemOptions.map((opt) => (
                  <td key={opt.value} className="text-center py-2 px-2">
                    <input
                      type="radio"
                      name={`${question.id}_${sub.id}`}
                      value={opt.value}
                      checked={selections[sub.id] === opt.value}
                      onChange={() => setSubItem(sub.id, opt.value)}
                      className="accent-blue-600"
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
