"use client";

import { usePathname } from "next/navigation";

const TOTAL_STEPS = 7; // step 0（公司資料）～ step 6（結尾兩題）

export function QuizChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const match = pathname.match(/\/quiz\/(\d+)/);
  const step = match ? Number(match[1]) : 0;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <div className="h-1.5 w-full rounded-full bg-slate-200">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-[#3987e5] to-[#104281] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          第 {step + 1} / {TOTAL_STEPS} 步
        </p>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-8">{children}</div>
    </div>
  );
}
