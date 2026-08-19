import Link from "next/link";
import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/scoring/dimensions";

const DIMENSION_DOT_COLORS: Record<(typeof DIMENSION_ORDER)[number], string> = {
  organization: "bg-rose-300",
  service: "bg-orange-300",
  businessModel: "bg-violet-300",
  digital: "bg-sky-300",
  sustainability: "bg-teal-300",
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      {/* 裝飾用氣泡光暈，純視覺不擋互動 */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/5 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" />

      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <span
          className="animate-fade-up rounded-full border border-white/60 bg-white/50 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-md"
        >
          基隆身障創新基地
        </span>

        <h1
          className="animate-fade-up mt-7 text-4xl font-bold tracking-tight text-slate-700 sm:text-5xl"
          style={{ animationDelay: "60ms" }}
        >
          企業成熟度診斷問卷
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
          style={{ animationDelay: "110ms" }}
        >
          透過五大構面快速掌握組織現況，即時產出雷達圖與專屬評估報告，
          作為後續分配輔導資源、媒合專家的重要依據。
        </p>

        <div
          className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "150ms" }}
        >
          {DIMENSION_ORDER.map((dim) => (
            <span
              key={dim}
              className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-md"
            >
              <span className={`h-2 w-2 rounded-full ${DIMENSION_DOT_COLORS[dim]}`} />
              {DIMENSION_LABELS[dim]}
            </span>
          ))}
        </div>

        <p
          className="animate-fade-up mt-12 text-base text-slate-500"
          style={{ animationDelay: "190ms" }}
        >
          第一次填答請選擇「開始前測」；完成輔導後回來比較成效，請選擇「開始後測」。
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center gap-5 sm:flex-row sm:gap-6"
          style={{ animationDelay: "230ms" }}
        >
          <Link
            href="/quiz/pre/0"
            className="rounded-full bg-gradient-to-br from-sky-300 to-sky-400 px-10 py-3 text-lg font-semibold text-slate-700 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
          >
            開始前測
          </Link>

          <Link
            href="/quiz/post/0"
            className="rounded-full bg-gradient-to-br from-rose-300 to-rose-400 px-10 py-3 text-lg font-semibold text-slate-700 shadow-[0_8px_20px_rgba(244,114,182,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
          >
            開始後測
          </Link>
        </div>

        <Link
          href="/scoring"
          className="animate-fade-up mt-9 text-base font-medium text-slate-500 underline decoration-slate-300 decoration-2 underline-offset-4 transition-colors duration-300 hover:text-slate-700"
          style={{ animationDelay: "270ms" }}
        >
          了解評分方式 →
        </Link>
      </div>

      <Link
        href="/admin"
        aria-label="編輯題目與權重"
        title="編輯題目與權重"
        className="fixed right-5 bottom-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-sky-400 text-white shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </Link>
    </div>
  );
}
