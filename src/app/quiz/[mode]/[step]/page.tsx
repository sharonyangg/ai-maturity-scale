"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CompanyInfoForm } from "@/components/quiz/CompanyInfoForm";
import { PretestUploadForm } from "@/components/quiz/PretestUploadForm";
import { QuestionField } from "@/components/quiz/QuestionField";
import { useQuizStore } from "@/lib/quiz-store";
import { QUESTIONS_BY_ID, QUESTION_PAGES } from "@/lib/scoring/questions";
import { encodeAnswers, encodePostResult } from "@/lib/answer-codec";
import { isCompanyInfoValid, validateQuestionAnswer } from "@/lib/validation";
import { useScoringConfig } from "@/lib/scoring/use-scoring-config";

const DIMENSION_COUNT = QUESTION_PAGES.length;

export default function QuizStepPage() {
  const params = useParams<{ mode: string; step: string }>();
  const router = useRouter();
  const { companyInfo, answers, prevAnswers } = useQuizStore();
  const { config } = useScoringConfig();
  const isPost = params.mode === "post";
  const uploadStep = isPost ? 1 : null;
  const dimensionOffset = isPost ? 2 : 1;
  const lastStep = DIMENSION_COUNT + dimensionOffset - 1;
  const step = Number(params.step);
  const [showErrors, setShowErrors] = useState(false);

  if (
    (params.mode !== "pre" && params.mode !== "post") ||
    !Number.isInteger(step) ||
    step < 0 ||
    step > lastStep
  ) {
    return <p className="text-slate-500">找不到這個步驟。</p>;
  }

  const dimensionPage =
    step >= dimensionOffset ? QUESTION_PAGES[step - dimensionOffset] : null;

  const isStepValid = (): boolean => {
    if (step === 0) return isCompanyInfoValid(companyInfo);
    if (uploadStep !== null && step === uploadStep) return prevAnswers !== null;
    if (dimensionPage) {
      return dimensionPage.questionIds.every(
        (id) => validateQuestionAnswer(QUESTIONS_BY_ID[id], answers[id]) === null
      );
    }
    return true;
  };

  const goPrev = () => step > 0 && router.push(`/quiz/${params.mode}/${step - 1}`);
  const goNext = () => {
    if (!isStepValid()) {
      setShowErrors(true);
      return;
    }
    if (step === lastStep) {
      if (isPost && prevAnswers) {
        const code = encodePostResult({ answers, prevAnswers });
        router.push(`/submitted/${code}?mode=post`);
      } else {
        const code = encodeAnswers(answers);
        router.push(`/submitted/${code}`);
      }
      return;
    }
    router.push(`/quiz/${params.mode}/${step + 1}`);
  };

  return (
    <div className="space-y-8">
      {step === 0 && <CompanyInfoForm showErrors={showErrors} />}

      {uploadStep !== null && step === uploadStep && <PretestUploadForm showError={showErrors} />}

      {dimensionPage && (
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-slate-700">
            {dimensionPage.sectionTitle}
          </h2>
          <div className="space-y-6">
            {dimensionPage.questionIds.map((id, index) => (
              <div
                key={id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <QuestionField
                  question={QUESTIONS_BY_ID[id]}
                  title={config.questionTitles[id]}
                  showError={showErrors}
                />
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
        {step === 0 ? (
          <Link
            href="/"
            className="rounded-full border-2 border-white/40 bg-white/50 px-6 py-2.5 font-medium text-slate-600 shadow-[0_4px_10px_rgba(148,163,223,0.15)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-white/70 active:scale-95"
          >
            回到首頁
          </Link>
        ) : (
          <button
            type="button"
            onClick={goPrev}
            className="rounded-lg px-4 py-2 text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-700"
          >
            上一步
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          className="rounded-full bg-gradient-to-br from-sky-300 to-sky-400 px-8 py-2.5 font-semibold text-slate-700 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
        >
          {step === lastStep ? "確認送出" : "下一步"}
        </button>
      </div>
    </div>
  );
}
