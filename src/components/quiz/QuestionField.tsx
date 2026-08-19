"use client";

import type { Question } from "@/lib/scoring/types";
import { useQuizStore } from "@/lib/quiz-store";
import { validateQuestionAnswer } from "@/lib/validation";

const CARD_CLASS =
  "rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(148,163,223,0.15)] backdrop-blur-xl transition-all duration-300 sm:p-8";

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mt-3 text-sm font-medium text-rose-500">{message}</p>;
}

export function QuestionNumberBadge({ number }: { number: string | number }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-sky-400 text-sm font-bold text-white shadow-[0_4px_10px_rgba(56,189,248,0.5),inset_0_2px_3px_rgba(255,255,255,0.7)] tabular-nums">
      {number}
    </span>
  );
}

function QuestionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-white/50 pb-4">
      <QuestionNumberBadge number={number} />
      <p className="min-w-0 break-words text-lg font-semibold leading-relaxed text-slate-700">{title}</p>
    </div>
  );
}

export function QuestionField({
  question,
  showError = false,
  title,
}: {
  question: Question;
  showError?: boolean;
  /** 後台若有改過這題的文字，傳進來覆蓋 question.title */
  title?: string;
}) {
  const { answers, setAnswer } = useQuizStore();
  const answer = answers[question.id];
  const selected = typeof answer === "string" ? answer : undefined;
  const error = showError ? validateQuestionAnswer(question, answer) : null;
  const cardClass = `${CARD_CLASS}${error ? " ring-2 ring-rose-300" : ""}`;

  return (
    <div className={cardClass}>
      <QuestionHeader number={question.id} title={title ?? question.title} />
      <div role="radiogroup" aria-label={title ?? question.title} className="flex items-start justify-between gap-1 sm:gap-3">
        {question.options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <label
              key={option.value}
              className="flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 text-center"
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={isSelected}
                onChange={() => setAnswer(question.id, option.value)}
                className="sr-only"
              />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95 ${
                  isSelected
                    ? "animate-tile-pop border-sky-300 bg-gradient-to-br from-sky-200 to-sky-300 shadow-[inset_0_3px_6px_rgba(14,116,144,0.25),inset_0_-2px_4px_rgba(255,255,255,0.6),0_4px_14px_rgba(56,189,248,0.35)]"
                    : "border-white/40 bg-white/50 shadow-[0_4px_10px_rgba(148,163,223,0.15)] backdrop-blur-md hover:bg-white/70"
                }`}
              >
                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />}
              </span>
              <span
                className={`break-words text-xs leading-tight sm:text-sm ${
                  isSelected ? "font-bold text-slate-700" : "font-medium text-slate-500"
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      <ErrorText message={error} />
    </div>
  );
}
