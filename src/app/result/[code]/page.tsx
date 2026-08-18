"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { decodeAnswers, decodePostResult } from "@/lib/answer-codec";
import { clearStoredQuizState, getStoredCompanyInfo } from "@/lib/quiz-store";
import { downloadResultDocx } from "@/lib/export-docx";
import { captureLargestChartSvg, pngBytesToBase64 } from "@/lib/chart-snapshot";
import { compareDimensionScores, computeResult } from "@/lib/scoring/engine";
import {
  DIMENSION_DESCRIPTIONS,
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  LEVEL_COLORS,
  LEVEL_DESCRIPTIONS,
  LEVEL_NAMES,
} from "@/lib/scoring/dimensions";
import { buildWeakestDimensionNote, LEVEL_COMMENTARY } from "@/lib/scoring/commentary";
import { useScoringConfig } from "@/lib/scoring/use-scoring-config";
import { DimensionRadarChart } from "@/components/result/DimensionRadarChart";
import { DimensionBreakdown } from "@/components/result/DimensionBreakdown";
import { DimensionNotes } from "@/components/result/DimensionNotes";

const CARD_CLASS =
  "animate-fade-up rounded-2xl bg-[#faf7ea] p-5 shadow-[0_2px_16px_rgba(21,31,30,0.08)] sm:p-6";

export default function ResultPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const isPost = searchParams.get("mode") === "post";

  const payload = isPost ? decodePostResult(params.code) : null;
  const answers = isPost ? payload?.answers ?? null : decodeAnswers(params.code);
  const prevAnswers = isPost ? payload?.prevAnswers ?? null : null;

  const [downloading, setDownloading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "skipped" | "failed">("idle");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { config, loaded: configLoaded } = useScoringConfig();

  // 測驗一送出、結果頁一打開就自動把報告寄到填答時留的 email；用 sessionStorage 記錄
  // 這個結果連結是否已經寄過，避免重新整理頁面就再寄一次。
  useEffect(() => {
    if (!answers || typeof window === "undefined") return;
    const sentKey = `emailed:${params.code}${isPost ? ":post" : ":pre"}`;

    let cancelled = false;
    (async () => {
      const stored = window.sessionStorage.getItem(sentKey);
      if (stored === "sent" || stored === "skipped" || stored === "failed") {
        if (!cancelled) setEmailStatus(stored);
        return;
      }

      const companyInfo = getStoredCompanyInfo();
      if (!companyInfo.email?.trim()) {
        if (!cancelled) {
          setEmailStatus("skipped");
          window.sessionStorage.setItem(sentKey, "skipped");
        }
        return;
      }

      setEmailStatus("sending");
      const snapshot = await captureLargestChartSvg(chartContainerRef.current);
      if (cancelled) return;

      try {
        const res = await fetch("/api/send-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyInfo,
            answers,
            prevAnswers: prevAnswers ?? undefined,
            chartPngBase64: snapshot ? pngBytesToBase64(snapshot.bytes) : undefined,
            chartWidth: snapshot?.width,
            chartHeight: snapshot?.height,
          }),
        });
        const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean };
        if (cancelled) return;
        const nextStatus = data.ok ? "sent" : "failed";
        setEmailStatus(nextStatus);
        window.sessionStorage.setItem(sentKey, nextStatus);
      } catch {
        if (!cancelled) {
          setEmailStatus("failed");
          window.sessionStorage.setItem(sentKey, "failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 每個結果連結只在第一次載入時嘗試寄送一次
  }, [params.code, isPost]);

  if (!answers) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-slate-900">連結無法解析</h1>
          <p className="mt-2 text-lg text-slate-500">這個結果連結可能已損毀，請重新填寫問卷。</p>
          <Link href="/" className="mt-6 inline-block text-olive-700 hover:underline">
            回到首頁
          </Link>
        </div>
      </div>
    );
  }

  if (!configLoaded) {
    // 構面權重可能被後台改過，要等抓到最新設定才能算分數，
    // 避免先用預設權重算一次、等一下又用新權重跳成另一個數字。
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-lg text-slate-500">結果計算中…</p>
      </div>
    );
  }

  const result = computeResult(answers, config.dimensionWeights);
  const prevResult = prevAnswers ? computeResult(prevAnswers, config.dimensionWeights) : null;
  const color = LEVEL_COLORS[result.level];
  const commentary = LEVEL_COMMENTARY[result.level];
  const weakestNote = buildWeakestDimensionNote(result.dimensionScores);
  const weightSummary = DIMENSION_ORDER.map(
    (dim) => `${DIMENSION_LABELS[dim]} ${Math.round(config.dimensionWeights[dim] * 100)}%`
  ).join("、");

  const comparison = prevResult ? compareDimensionScores(prevResult.dimensionScores, result.dimensionScores) : null;
  const totalDelta = prevResult ? result.weightedScore - prevResult.weightedScore : null;

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
      const chartSnapshot = await captureLargestChartSvg(chartContainerRef.current);
      await downloadResultDocx({
        result,
        companyInfo,
        answers,
        chartSnapshot,
        prevAnswers: prevAnswers ?? undefined,
        questionTitles: config.questionTitles,
        dimensionWeights: config.dimensionWeights,
      });
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
            <p className="text-lg font-medium text-white/80">
              您的企業成熟度等級{isPost ? "（後測）" : "（前測）"}
            </p>
            <h1 className="mt-2 text-4xl font-bold break-words sm:text-5xl">{result.levelName}</h1>
            <p className="mt-1 text-lg text-white/90">{LEVEL_DESCRIPTIONS[result.level]}</p>
            <div className="mx-auto mt-6 max-w-xs">
              <div className="h-2 rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, result.weightedScore))}%` }}
                />
              </div>
              <p className="mt-2 text-lg text-white/80">加權分數 {result.weightedScore.toFixed(1)} / 100</p>
              {prevResult && totalDelta !== null && (
                <p className="mt-1 text-base text-white/80">
                  較前測（{prevResult.weightedScore.toFixed(1)} 分／{prevResult.levelName}）
                  {totalDelta >= 0 ? "成長" : "下降"} {Math.abs(totalDelta).toFixed(1)} 分
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-white/25 pt-6">
            <h2 className="mb-2 text-xl font-semibold">整體評語</h2>
            <p className="text-lg leading-relaxed text-white/90">{commentary.overall}</p>
            <p className="mt-4 rounded-xl bg-white/15 p-4 text-lg leading-relaxed font-medium text-white">
              {weakestNote}
            </p>
          </div>
        </div>

        {comparison && prevResult && (
          <div className={CARD_CLASS} style={{ animationDelay: "120ms" }}>
            <h2 className="mb-4 text-2xl font-semibold text-black">前測後測比較彙總</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-olive-900/5 p-4">
                <p className="text-sm text-gray-500">前測加權總分／分級</p>
                <p className="mt-1 text-xl font-bold text-olive-700">
                  {prevResult.weightedScore.toFixed(1)} 分／{LEVEL_NAMES[prevResult.level]}
                </p>
              </div>
              <div className="rounded-xl bg-olive-900/5 p-4">
                <p className="text-sm text-gray-500">後測加權總分／分級</p>
                <p className="mt-1 text-xl font-bold text-olive-700">
                  {result.weightedScore.toFixed(1)} 分／{LEVEL_NAMES[result.level]}
                </p>
              </div>
              <div className="rounded-xl bg-gold-50 p-4">
                <p className="text-sm text-gray-500">最大進步構面</p>
                <p className="mt-1 text-xl font-bold text-gold-700">
                  {DIMENSION_LABELS[comparison.mostImproved]}
                  <span className="ml-2 text-base font-medium">
                    {comparison.deltas[comparison.mostImproved] >= 0 ? "+" : ""}
                    {comparison.deltas[comparison.mostImproved].toFixed(1)} 分
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-gold-50 p-4">
                <p className="text-sm text-gray-500">仍待強化構面</p>
                <p className="mt-1 text-xl font-bold text-gold-700">
                  {DIMENSION_LABELS[comparison.stillWeak]}
                  <span className="ml-2 text-base font-medium">
                    現為 {result.dimensionScores[comparison.stillWeak].toFixed(1)} 分
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={CARD_CLASS} style={{ animationDelay: "160ms" }}>
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-olive-900/5 px-2 py-0.5 text-sm font-medium text-olive-700">
                  {isPost ? "前測 vs 後測對照" : "前測（Baseline）"}
                </span>
              </div>
              <DimensionRadarChart
                scores={result.dimensionScores}
                prevScores={prevResult?.dimensionScores}
                containerRef={chartContainerRef}
              />
              {!isPost && (
                <p className="mt-1 text-sm text-gray-500">
                  本圖為本次測驗的前測數據；未來完成輔導後，於首頁選擇「開始後測」並上傳這份前測 Word
                  報告，即可疊加後測分數比較前後差異。
                </p>
              )}
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-black">五大構面數據</h2>
              <DimensionBreakdown
                scores={result.dimensionScores}
                prevScores={prevResult?.dimensionScores}
                weights={config.dimensionWeights}
              />
              <p className="mt-4 text-sm text-gray-500">各構面權重：{weightSummary}。</p>
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
          <p className="mt-4 rounded-xl border border-gold-500 bg-gold-50 p-4 text-lg leading-relaxed font-medium text-olive-900">
            下一步：請依據上述弱項構面，聯繫窗口安排後續一對一輔導，共同擬定包含具體任務、負責人與期限的改善行動計畫。
          </p>
        </div>

        {emailStatus !== "idle" && emailStatus !== "skipped" && (
          <p
            className="animate-fade-up text-center text-sm text-gray-500"
            style={{ animationDelay: "380ms" }}
          >
            {emailStatus === "sending" && "報告寄送中…"}
            {emailStatus === "sent" && "✓ 報告已寄送至您填答時留下的 email"}
            {emailStatus === "failed" && "自動寄送失敗，請改用下方按鈕下載報告"}
          </p>
        )}

        <div
          className="animate-fade-up flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row"
          style={{ animationDelay: "400ms" }}
        >
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full rounded-full border border-gold-500 px-8 py-3 text-center font-medium text-gold-700 transition-all hover:scale-[1.03] hover:bg-gold-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {downloading ? "產生中…" : "下載 Word 報告"}
          </button>
          <Link
            href="/"
            onClick={clearStoredQuizState}
            className="w-full rounded-full bg-gradient-to-r from-olive-500 to-olive-900 px-8 py-3 text-center font-medium text-white shadow-[0_8px_30px_rgba(61,78,23,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(61,78,23,0.5)] active:scale-[0.97] sm:w-auto"
          >
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
