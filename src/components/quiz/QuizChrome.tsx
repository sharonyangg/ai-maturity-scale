"use client";

import { usePathname } from "next/navigation";

const TOTAL_STEPS = 7; // step 0（公司資料）～ step 6（結尾兩題）

export function QuizChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const match = pathname.match(/\/quiz\/(\d+)/);
  const step = match ? Number(match[1]) : 0;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          第 {step + 1} / {TOTAL_STEPS} 步
        </p>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-8">{children}</div>
    </div>
  );
}
