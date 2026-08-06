"use client";

import { useParams, useRouter } from "next/navigation";
import { CompanyInfoForm } from "@/components/quiz/CompanyInfoForm";
import { ClosingQuestionsForm } from "@/components/quiz/ClosingQuestionsForm";
import { QuestionField } from "@/components/quiz/QuestionField";
import { useQuizStore } from "@/lib/quiz-store";
import { QUESTIONS_BY_ID, QUESTION_PAGES } from "@/lib/scoring/questions";
import { encodeAnswers } from "@/lib/answer-codec";

export default function QuizStepPage() {
  const params = useParams<{ step: string }>();
  const router = useRouter();
  const { answers } = useQuizStore();
  const step = Number(params.step);

  if (!Number.isInteger(step) || step < 0 || step > 6) {
    return <p className="text-gray-600">找不到這個步驟。</p>;
  }

  const goPrev = () => step > 0 && router.push(`/quiz/${step - 1}`);
  const goNext = () => {
    if (step === 6) {
      const code = encodeAnswers(answers);
      router.push(`/result/${code}`);
      return;
    }
    router.push(`/quiz/${step + 1}`);
  };

  const dimensionPage = step >= 1 && step <= 5 ? QUESTION_PAGES[step - 1] : null;

  return (
    <div className="space-y-8">
      {step === 0 && <CompanyInfoForm />}

      {dimensionPage && (
        <div className="space-y-6">
          <h2 className="text-center text-xl font-bold text-black">
            {dimensionPage.sectionTitle}
          </h2>
          <div className="space-y-6">
            {dimensionPage.questionIds.map((id) => (
              <QuestionField key={id} question={QUESTIONS_BY_ID[id]} />
            ))}
          </div>
        </div>
      )}

      {step === 6 && <ClosingQuestionsForm />}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0}
          className="rounded-lg px-4 py-2 text-gray-600 disabled:opacity-0"
        >
          上一步
        </button>
        <button
          type="button"
          onClick={goNext}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
        >
          {step === 6 ? "確認送出" : "下一步"}
        </button>
      </div>
    </div>
  );
}
