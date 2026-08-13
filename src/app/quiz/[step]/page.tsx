"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CompanyInfoForm } from "@/components/quiz/CompanyInfoForm";
import { QuestionField } from "@/components/quiz/QuestionField";
import { useQuizStore } from "@/lib/quiz-store";
import { QUESTIONS_BY_ID, QUESTION_PAGES } from "@/lib/scoring/questions";
import { encodeAnswers } from "@/lib/answer-codec";
import { isCompanyInfoValid, validateQuestionAnswer } from "@/lib/validation";

const LAST_STEP = QUESTION_PAGES.length; // 5

export default function QuizStepPage() {
  const params = useParams<{ step: string }>();
  const router = useRouter();
  const { companyInfo, answers } = useQuizStore();
  const step = Number(params.step);
  const [showErrors, setShowErrors] = useState(false);

  if (!Number.isInteger(step) || step < 0 || step > LAST_STEP) {
    return <p className="text-slate-500">找不到這個步驟。</p>;
  }

  const dimensionPage = step >= 1 && step <= LAST_STEP ? QUESTION_PAGES[step - 1] : null;

  const isStepValid = (): boolean => {
    if (step === 0) return isCompanyInfoValid(companyInfo);
    if (dimensionPage) {
      return dimensionPage.questionIds.every(
        (id) => validateQuestionAnswer(QUESTIONS_BY_ID[id], answers[id]) === null
      );
    }
    return true;
  };

  const goPrev = () => step > 0 && router.push(`/quiz/${step - 1}`);
  const goNext = () => {
    if (!isStepValid()) {
      setShowErrors(true);
      return;
    }
    if (step === LAST_STEP) {
      const code = encodeAnswers(answers);
      router.push(`/result/${code}`);
      return;
    }
    router.push(`/quiz/${step + 1}`);
  };

  return (
    <div className="space-y-8">
      {step === 0 && <CompanyInfoForm showErrors={showErrors} />}

      {dimensionPage && (
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            {dimensionPage.sectionTitle}
          </h2>
          <div className="space-y-6">
            {dimensionPage.questionIds.map((id, index) => (
              <div
                key={id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <QuestionField question={QUESTIONS_BY_ID[id]} showError={showErrors} />
              </div>
            ))}
          </div>
        </div>
      )}

      {showErrors && !isStepValid() && (
        <p className="text-center text-base font-medium text-red-600">
          還有題目尚未完成或格式不正確，請檢查上方紅框標示的欄位。
        </p>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0}
          className="rounded-lg px-4 py-2 text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-0"
        >
          上一步
        </button>
        <button
          type="button"
          onClick={goNext}
          className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-2.5 font-medium text-white shadow-[0_4px_20px_rgba(5,150,105,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_4px_28px_rgba(5,150,105,0.5)] active:scale-[0.97]"
        >
          {step === LAST_STEP ? "確認送出" : "下一步"}
        </button>
      </div>
    </div>
  );
}
