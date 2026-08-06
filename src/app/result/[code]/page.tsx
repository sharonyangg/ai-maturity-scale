"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { decodeAnswers } from "@/lib/answer-codec";
import { clearStoredQuizState, getStoredClosingAnswers, getStoredCompanyInfo } from "@/lib/quiz-store";
import { downloadResultDocx } from "@/lib/export-docx";
import { svgElementToPngBytes } from "@/lib/svg-to-png";
import { computeResult } from "@/lib/scoring/engine";
import { LEVEL_COLORS, LEVEL_DESCRIPTIONS } from "@/lib/scoring/dimensions";
import { LEVEL_COMMENTARY } from "@/lib/scoring/commentary";
import { DimensionRadarChart } from "@/components/result/DimensionRadarChart";
import { DimensionBreakdown } from "@/components/result/DimensionBreakdown";
import { DimensionNotes } from "@/components/result/DimensionNotes";

const CARD_CLASS =
  "animate-fade-up rounded-2xl bg-[#f7faf8] p-6 shadow-[0_2px_16px_rgba(15,23,42,0.08)]";

export default function ResultPage() {
  const params = useParams<{ code: string }>();
  const answers = decodeAnswers(params.code);
  const [downloading, setDownloading] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  if (!answers) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-slate-900">連結無法解析</h1>
          <p className="mt-2 text-lg text-slate-500">這個結果連結可能已損毀，請重新填寫問卷。</p>
          <Link href="/" className="mt-6 inline-block text-emerald-700 hover:underline">
            回到首頁
          </Link>
        </div>
      </div>
    );
  }

  const result = computeResult(answers);
  const color = LEVEL_COLORS[result.level];
  const commentary = LEVEL_COMMENTARY[result.level];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const svg = chartContainerRef.current?.querySelector("svg") ?? null;
      const chartImageBytes = svg ? await svgElementToPngBytes(svg) : null;
      await downloadResultDocx(
        result,
        getStoredCompanyInfo(),
        answers,
        getStoredClosingAnswers(),
        chartImageBytes
      );
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
          <p className="text-base font-medium text-white/80">您的 AI 成熟度等級</p>
          <h1 className="mt-2 text-5xl font-bold">{result.levelName}</h1>
          <p className="mt-1 text-lg text-white/90">{LEVEL_DESCRIPTIONS[result.level]}</p>
          <div className="mx-auto mt-6 max-w-xs">
            <div className="h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, result.weightedScore))}%` }}
              />
            </div>
            <p className="mt-2 text-base text-white/80">
              加權分數 {result.weightedScore.toFixed(1)} / 100
            </p>
          </div>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "80ms" }}>
          <h2 className="mb-3 text-xl font-semibold text-black">整體評語</h2>
          <p className="text-base leading-relaxed text-gray-600">{commentary.overall}</p>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "160ms" }}>
          <DimensionRadarChart scores={result.dimensionScores} containerRef={chartContainerRef} />
          <h2 className="mt-2 mb-4 text-xl font-semibold text-black">五大構面明細</h2>
          <DimensionBreakdown scores={result.dimensionScores} />
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "240ms" }}>
          <h2 className="mb-4 text-xl font-semibold text-black">五大構面說明</h2>
          <DimensionNotes notes={commentary.dimensionNotes} />
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "320ms" }}>
          <h2 className="mb-1 text-xl font-semibold text-black">AI 導入策略建議</h2>
          <p className="mb-3 text-sm text-gray-400">
            此建議依您所屬的成熟度等級提供代表性參考內容；原站會再依五大構面的實際分數組合進一步客製化，因此與您在原站看到的文字可能略有不同。
          </p>
          <p className="text-base leading-relaxed text-gray-600">{commentary.strategyAdvice}</p>
        </div>

        <div
          className="animate-fade-up flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row"
          style={{ animationDelay: "400ms" }}
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
