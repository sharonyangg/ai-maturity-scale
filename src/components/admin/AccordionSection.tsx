"use client";

import { useState } from "react";

const CARD_CLASS =
  "rounded-[2rem] border border-white/60 bg-white/40 shadow-[0_8px_32px_rgba(148,163,223,0.15)] backdrop-blur-xl transition-all duration-300";

export function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={CARD_CLASS}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left sm:p-6"
      >
        <span className="text-2xl font-semibold text-slate-700">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>}
    </div>
  );
}
