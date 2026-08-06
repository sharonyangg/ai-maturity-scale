"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { decodeAnswers } from "@/lib/answer-codec";
import { clearStoredQuizState, getStoredCompanyInfo } from "@/lib/quiz-store";
import { downloadResultDocx } from "@/lib/export-docx";
import { computeResult } from "@/lib/scoring/engine";
import { LEVEL_COLORS, LEVEL_DESCRIPTIONS } from "@/lib/scoring/dimensions";
import { DimensionRadarChart } from "@/components/result/DimensionRadarChart";
import { DimensionBreakdown } from "@/components/result/DimensionBreakdown";

export default function ResultPage() {
  const params = useParams<{ code: string }>();
  const answers = decodeAnswers(params.code);
  const [downloading, setDownloading] = useState(false);

  if (!answers) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <h1 className="text-xl font-semibold text-slate-900">連結無法解析</h1>
          <p className="mt-2 text-slate-500">這個結果連結可能已損毀，請重新填寫問卷。</p>
          <Link href="/" className="mt-6 inline-block text-emerald-700 hover:underline">
            回到首頁
          </Link>
        </div>
      </div>
    );
  }

  const result = computeResult(answers);
  const color = LEVEL_COLORS[result.level];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadResultDocx(result, getStoredCompanyInfo());
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div
          className="animate-fade-up rounded-2xl px-8 py-10 text-center text-white shadow-[0_12px_32px_-12px_var(--glow)]"
          style={
            {
              backgroundImage: `linear-gradient(135deg, ${color.from}, ${color.to})`,
              "--glow": color.glow,
            } as React.CSSProperties
          }
        >
          <p className="text-sm font-medium text-white/80">您的 AI 成熟度等級</p>
          <h1 className="mt-2 text-4xl font-bold">{result.levelName}</h1>
          <p className="mt-1 text-white/90">{LEVEL_DESCRIPTIONS[result.level]}</p>
          <div className="mx-auto mt-6 max-w-xs">
            <div className="h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, result.weightedScore))}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-white/80">
              加權分數 {result.weightedScore.toFixed(1)} / 100
            </p>
          </div>
        </div>

        <div
          className="animate-fade-up rounded-2xl bg-[#f7faf8] p-6 shadow-[0_2px_16px_rgba(15,23,42,0.08)]"
          style={{ animationDelay: "100ms" }}
        >
          <DimensionRadarChart scores={result.dimensionScores} />
        </div>

        <div
          className="animate-fade-up rounded-2xl bg-[#f7faf8] p-6 shadow-[0_2px_16px_rgba(15,23,42,0.08)]"
          style={{ animationDelay: "180ms" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-black">五大構面明細</h2>
          <DimensionBreakdown scores={result.dimensionScores} />
        </div>

        <div
          className="animate-fade-up flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row"
          style={{ animationDelay: "260ms" }}
        >
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-full border border-emerald-600 px-8 py-3 font-medium text-emerald-700 transition-all hover:scale-[1.03] hover:bg-emerald-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? "產生中…" : "下載 Word 報告"}
          </button>
          <Link
            href="/"
            onClick={clearStoredQuizState}
            className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-3 font-medium text-white shadow-[0_8px_30px_rgba(5,150,105,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(5,150,105,0.5)] active:scale-[0.97]"
          >
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
