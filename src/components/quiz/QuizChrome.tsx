"use client";

import { usePathname } from "next/navigation";

const TOTAL_STEPS = 6;

export function QuizChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const match = pathname.match(/\/quiz\/(\d+)/);
  const step = match ? Number(match[1]) : 0;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:pt-8">
        <div className="h-1.5 w-full rounded-full bg-slate-200">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          第 {step + 1} / {TOTAL_STEPS} 步
        </p>
      </div>
      <div key={pathname} className="animate-fade-up mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
