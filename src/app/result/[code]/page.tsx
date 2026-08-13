"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { decodeAnswers } from "@/lib/answer-codec";
import { clearStoredQuizState, getStoredCompanyInfo } from "@/lib/quiz-store";
import { downloadResultDocx } from "@/lib/export-docx";
import { svgElementToPngBytes } from "@/lib/svg-to-png";
import { computeResult } from "@/lib/scoring/engine";
import { DIMENSION_DESCRIPTIONS, LEVEL_COLORS, LEVEL_DESCRIPTIONS } from "@/lib/scoring/dimensions";
import { LEVEL_COMMENTARY } from "@/lib/scoring/commentary";
import { DimensionRadarChart } from "@/components/result/DimensionRadarChart";
import { DimensionBreakdown } from "@/components/result/DimensionBreakdown";
import { DimensionNotes } from "@/components/result/DimensionNotes";

const CARD_CLASS =
  "animate-fade-up rounded-2xl bg-[#f7faf8] p-5 shadow-[0_2px_16px_rgba(15,23,42,0.08)] sm:p-6";

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
    const companyInfo = getStoredCompanyInfo();
    // 公司資料只存在填答當下那個瀏覽器分頁的 sessionStorage 裡；如果現在開啟結果頁的瀏覽器
    // （例如從 App 內建瀏覽器跳出、換成手機預設瀏覽器）跟當初填答的不是同一個分頁，這裡就會
    // 是空的——先提醒使用者，而不是默默產出一份缺資料的報告。
    if (Object.keys(companyInfo).length === 0) {
      const proceed = window.confirm(
        "偵測不到公司資料的作答內容（可能是換了瀏覽器或用 App 內建瀏覽器開啟），匯出的報告裡「公司個人資料」會是空的。要繼續下載嗎？"
      );
      if (!proceed) return;
    }

    setDownloading(true);
    try {
      const svg = chartContainerRef.current?.querySelector("svg") ?? null;
      const chartSnapshot = svg ? await svgElementToPngBytes(svg) : null;
      await downloadResultDocx(result, companyInfo, answers, chartSnapshot);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div
          className="animate-fade-up rounded-2xl px-5 py-8 text-white shadow-[0_12px_32px_-12px_var(--glow)] sm:px-8 sm:py-10"
          style={
            {
              backgroundImage: `linear-gradient(135deg, ${color.from}, ${color.to})`,
              "--glow": color.glow,
            } as React.CSSProperties
          }
        >
          <div className="text-center">
            <p className="text-lg font-medium text-white/80">您的企業成熟度等級</p>
            <h1 className="mt-2 text-4xl font-bold break-words sm:text-5xl">{result.levelName}</h1>
            <p className="mt-1 text-lg text-white/90">{LEVEL_DESCRIPTIONS[result.level]}</p>
            <div className="mx-auto mt-6 max-w-xs">
              <div className="h-2 rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, result.weightedScore))}%` }}
                />
              </div>
              <p className="mt-2 text-lg text-white/80">
                加權分數 {result.weightedScore.toFixed(1)} / 100
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/25 pt-6">
            <h2 className="mb-2 text-xl font-semibold">整體評語</h2>
            <p className="text-lg leading-relaxed text-white/90">{commentary.overall}</p>
          </div>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "160ms" }}>
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
            <DimensionRadarChart scores={result.dimensionScores} containerRef={chartContainerRef} />
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-black">五大構面數據</h2>
              <DimensionBreakdown scores={result.dimensionScores} />
            </div>
          </div>
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "240ms" }}>
          <h2 className="mb-4 text-2xl font-semibold text-black">五大構面說明</h2>
          <DimensionNotes notes={DIMENSION_DESCRIPTIONS} />
        </div>

        <div className={CARD_CLASS} style={{ animationDelay: "320ms" }}>
          <h2 className="mb-3 text-2xl font-semibold text-black">建議行動</h2>
          <p className="text-lg leading-relaxed text-gray-600">{commentary.strategyAdvice}</p>
        </div>

        <div
          className="animate-fade-up flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row"
          style={{ animationDelay: "400ms" }}
        >
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full rounded-full border border-emerald-600 px-8 py-3 text-center font-medium text-emerald-700 transition-all hover:scale-[1.03] hover:bg-emerald-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {downloading ? "產生中…" : "下載 Word 報告"}
          </button>
          <Link
            href="/"
            onClick={clearStoredQuizState}
            className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-3 text-center font-medium text-white shadow-[0_8px_30px_rgba(5,150,105,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(5,150,105,0.5)] active:scale-[0.97] sm:w-auto"
          >
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
