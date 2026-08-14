"use client";

import type { Question } from "@/lib/scoring/types";
import { useQuizStore } from "@/lib/quiz-store";
import { validateQuestionAnswer } from "@/lib/validation";

const CARD_CLASS = "rounded-2xl bg-[#faf7ea] p-5 shadow-[0_2px_16px_rgba(21,31,30,0.08)] sm:p-6";
const OPTION_LABEL_CLASS =
  "flex items-start gap-3 cursor-pointer text-base text-black transition-colors has-checked:text-olive-700 has-checked:font-medium";

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mt-3 text-sm font-medium text-red-600">{message}</p>;
}

export function QuestionNumberBadge({ number }: { number: string | number }) {
  return (
    <span className="inline-block h-7 w-7 shrink-0 rounded-full bg-olive-700 text-center text-sm leading-7 font-bold text-white tabular-nums">
      {number}
    </span>
  );
}

function QuestionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-olive-900/10 pb-4">
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
  const selected = typeof answer === "string" ? answer : undefined;
  const error = showError ? validateQuestionAnswer(question, answer) : null;
  const cardClass = `${CARD_CLASS}${error ? " ring-2 ring-red-500" : ""}`;

  return (
    <div className={cardClass}>
      <QuestionHeader number={question.id} title={question.title} />
      <div className="flex flex-wrap justify-between gap-3">
        {question.options.map((option) => (
          <label key={option.value} className={`${OPTION_LABEL_CLASS} flex-col items-center text-center`}>
            <input
              type="radio"
              name={question.id}
              value={option.value}
              checked={selected === option.value}
              onChange={() => setAnswer(question.id, option.value)}
              className="h-5 w-5 shrink-0 accent-olive-700"
            />
            <span className="min-w-0 break-words">{option.label}</span>
          </label>
        ))}
      </div>
      <ErrorText message={error} />
    </div>
  );
}
