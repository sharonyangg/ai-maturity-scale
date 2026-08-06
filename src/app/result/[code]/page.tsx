"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { decodeAnswers } from "@/lib/answer-codec";
import { clearStoredQuizState } from "@/lib/quiz-store";
import { computeResult } from "@/lib/scoring/engine";
import { LEVEL_COLORS, LEVEL_DESCRIPTIONS } from "@/lib/scoring/dimensions";
import { DimensionRadarChart } from "@/components/result/DimensionRadarChart";
import { DimensionBreakdown } from "@/components/result/DimensionBreakdown";

export default function ResultPage() {
  const params = useParams<{ code: string }>();
  const answers = decodeAnswers(params.code);

  if (!answers) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-xl text-center">
          <h1 className="text-xl font-semibold text-black">連結無法解析</h1>
          <p className="mt-2 text-gray-500">這個結果連結可能已損毀，請重新填寫問卷。</p>
          <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
            回到首頁
          </Link>
        </div>
      </div>
    );
  }

  const result = computeResult(answers);
  const color = LEVEL_COLORS[result.level];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className={`rounded-2xl ${color.bg} px-8 py-10 text-center text-white shadow-sm`}>
          <p className="text-sm font-medium text-white/80">您的 AI 成熟度等級</p>
          <h1 className="mt-2 text-4xl font-bold">{result.levelName}</h1>
          <p className="mt-1 text-white/90">{LEVEL_DESCRIPTIONS[result.level]}</p>
          <div className="mx-auto mt-6 max-w-xs">
            <div className="h-2 rounded-full bg-white/25">
              <div
                className="h-2 rounded-full bg-white"
                style={{ width: `${Math.min(100, Math.max(0, result.weightedScore))}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-white/80">
              加權分數 {result.weightedScore.toFixed(1)} / 100
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <DimensionRadarChart scores={result.dimensionScores} />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-black">五大構面明細</h2>
          <DimensionBreakdown scores={result.dimensionScores} />
        </div>

        <div className="flex justify-center pt-2">
          <Link
            href="/"
            onClick={clearStoredQuizState}
            className="rounded-full bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
