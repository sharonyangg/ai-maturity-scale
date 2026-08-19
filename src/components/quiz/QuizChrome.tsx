"use client";

import { usePathname } from "next/navigation";
import { QUESTION_PAGES } from "@/lib/scoring/questions";

const DIMENSION_COUNT = QUESTION_PAGES.length;

export function QuizChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const match = pathname.match(/\/quiz\/(pre|post)\/(\d+)/);
  const mode = match?.[1] ?? "pre";
  const step = match ? Number(match[2]) : 0;
  // 前測：公司資料 + 5 個構面 = 6 步；後測多一頁上傳前測報告 = 7 步
  const totalSteps = mode === "post" ? DIMENSION_COUNT + 2 : DIMENSION_COUNT + 1;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:pt-8">
        <div className="h-4 w-full rounded-full border border-white/60 bg-white/50 shadow-inner backdrop-blur-md">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-rose-300 via-sky-300 to-violet-300 shadow-[inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          第 {step + 1} / {totalSteps} 步
        </p>
      </div>
      <div key={pathname} className="animate-fade-up mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
