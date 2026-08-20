"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { decodeAnswers, decodePostResult } from "@/lib/answer-codec";
import { getStoredCompanyInfo } from "@/lib/quiz-store";
import { captureLargestChartSvg, pngBytesToBase64 } from "@/lib/chart-snapshot";
import { computeResult } from "@/lib/scoring/engine";
import { useScoringConfig } from "@/lib/scoring/use-scoring-config";
import { DimensionRadarChart } from "@/components/result/DimensionRadarChart";

export default function SubmittedPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isPost = mode === "post";
  const resultHref = mode ? `/result/${params.code}?mode=${mode}` : `/result/${params.code}`;

  const payload = isPost ? decodePostResult(params.code) : null;
  const answers = isPost ? payload?.answers ?? null : decodeAnswers(params.code);
  const prevAnswers = isPost ? payload?.prevAnswers ?? null : null;

  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "skipped" | "failed">("idle");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { config, loaded: configLoaded } = useScoringConfig();

  // 一進到這頁（不用等使用者點「查看結果」）就自動把報告寄到填答時留的 email；
  // 用 sessionStorage 記錄這個結果代碼是否已經寄過，避免重新整理頁面就再寄一次。
  //
  // 一定要等 configLoaded 才能做：權重設定抓回來之前，下面那顆隱藏雷達圖用的是
  // 預設權重畫的，分數可能跟後台目前設定不一致；而且 captureLargestChartSvg
  // 需要圖表已經 mount 且跑完進場動畫才抓得到完整圖案。
  useEffect(() => {
    if (!answers || !configLoaded || typeof window === "undefined") return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 每個結果代碼只在第一次載入時嘗試寄送一次
  }, [params.code, isPost, configLoaded]);

  const result = answers && configLoaded ? computeResult(answers, config.dimensionWeights, config.levelRanges) : null;
  const prevResult =
    prevAnswers && configLoaded ? computeResult(prevAnswers, config.dimensionWeights, config.levelRanges) : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      {/* 裝飾用氣泡光暈，跟首頁同一套視覺 */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-teal-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/5 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl" />

      {/* 畫面上看不到：只是用來讓自動寄信抓雷達圖截圖，不是給使用者看的 */}
      {result && (
        <div
          aria-hidden="true"
          style={{ position: "fixed", top: 0, left: -99999, width: 420, height: 440, opacity: 0, pointerEvents: "none" }}
        >
          <DimensionRadarChart
            scores={result.dimensionScores}
            prevScores={prevResult?.dimensionScores}
            containerRef={chartContainerRef}
          />
        </div>
      )}

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <span className="animate-fade-up flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-sky-400 text-white shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h1
          className="animate-fade-up mt-6 text-3xl font-bold text-slate-700 sm:text-4xl"
          style={{ animationDelay: "60ms" }}
        >
          感謝您的填答！
        </h1>

        <p
          className="animate-fade-up mt-6 rounded-[2rem] border border-white/60 bg-white/40 p-6 text-lg leading-relaxed text-slate-600 shadow-[0_8px_32px_rgba(148,163,223,0.15)] backdrop-blur-xl"
          style={{ animationDelay: "110ms" }}
        >
          資料已轉交輔導單位。2 日內會有專家提供輔導建議，並會再將資料寄至您的信箱，再請留意查收。
        </p>

        <Link
          href={resultHref}
          className="animate-fade-up mt-8 rounded-full bg-gradient-to-br from-sky-300 to-sky-400 px-10 py-3 text-lg font-semibold text-slate-700 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
          style={{ animationDelay: "150ms" }}
        >
          查看結果
        </Link>

        {emailStatus === "failed" && (
          <p className="animate-fade-up mt-5 text-sm text-slate-500" style={{ animationDelay: "190ms" }}>
            自動寄送失敗，請點上方「查看結果」後改用下載按鈕取得報告。
          </p>
        )}
      </div>
    </div>
  );
}
