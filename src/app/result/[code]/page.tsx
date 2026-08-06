"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { decodeAnswers } from "@/lib/answer-codec";
import { computeResult } from "@/lib/scoring/engine";
import { DimensionRadarChart } from "@/components/result/DimensionRadarChart";
import { DimensionBreakdown } from "@/components/result/DimensionBreakdown";

export default function ResultPage() {
  const params = useParams<{ code: string }>();
  const answers = decodeAnswers(params.code);

  if (!answers) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">連結無法解析</h1>
        <p className="mt-2 text-gray-500">這個結果連結可能已損毀，請重新填寫問卷。</p>
        <Link href="/quiz/0" className="mt-6 inline-block text-blue-600 hover:underline">
          重新開始測驗
        </Link>
      </div>
    );
  }

  const result = computeResult(answers);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium text-blue-600">您的 AI 成熟度等級</p>
      <h1 className="mt-1 text-3xl font-bold text-gray-900">{result.levelName}</h1>
      <p className="mt-1 text-gray-500">加權分數：{result.weightedScore.toFixed(1)} / 100</p>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <DimensionRadarChart scores={result.dimensionScores} />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">五大構面明細</h2>
        <DimensionBreakdown scores={result.dimensionScores} />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/quiz/0"
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
        >
          重新測驗
        </Link>
      </div>
    </div>
  );
}
