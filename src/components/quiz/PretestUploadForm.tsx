"use client";

import { useRef, useState } from "react";
import { extractPretestAnswersFromDocx } from "@/lib/docx-code";
import { useQuizStore } from "@/lib/quiz-store";
import { computeResult } from "@/lib/scoring/engine";
import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/scoring/dimensions";

const CARD_CLASS =
  "rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-[0_8px_32px_rgba(148,163,223,0.15)] backdrop-blur-xl transition-all duration-300 sm:p-6";

export function PretestUploadForm({ showError = false }: { showError?: boolean }) {
  const { prevAnswers, setPrevAnswers } = useQuizStore();
  const [status, setStatus] = useState<"idle" | "parsing" | "success" | "notFound">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus("parsing");
    const answers = await extractPretestAnswersFromDocx(file);
    if (answers) {
      setPrevAnswers(answers);
      setStatus("success");
    } else {
      setPrevAnswers(null);
      setStatus("notFound");
    }
  };

  const result = prevAnswers ? computeResult(prevAnswers) : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-700">上傳前測報告</h2>
        <p className="mt-1 text-base leading-relaxed text-slate-600">
          請上傳貴單位先前下載的「前測」Word 報告，系統會自動讀取前測資料以進行前後測比較。
        </p>
      </div>

      <div className={`${CARD_CLASS}${showError && !prevAnswers ? " ring-2 ring-red-500" : ""}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-[1.75rem] border-2 border-dashed border-sky-300 bg-white/50 px-4 py-8 text-center text-base font-medium text-sky-700 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-sky-50/60 active:scale-95"
        >
          {status === "parsing" ? "讀取中…" : "點此選擇前測 Word 報告（.docx）"}
        </button>

        {status === "success" && result && (
          <div className="mt-4 rounded-[1.5rem] bg-emerald-100/60 p-4 text-base text-emerald-800 backdrop-blur-md">
            <p className="font-medium">已成功讀取前測資料 ✓</p>
            <p className="mt-1 text-sm text-slate-600">
              前測加權總分：{result.weightedScore.toFixed(1)} 分／{result.levelName}
            </p>
            <ul className="mt-2 space-y-0.5 text-sm text-slate-600">
              {DIMENSION_ORDER.map((dim) => (
                <li key={dim}>
                  {DIMENSION_LABELS[dim]}：{result.dimensionScores[dim].toFixed(1)} 分
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === "notFound" && (
          <p className="mt-3 text-sm font-medium text-red-600">
            這份檔案裡找不到系統比對代碼，請確認上傳的是本系統匯出、且未刪除檔案最下方灰色小字的前測報告。
          </p>
        )}

        {showError && !prevAnswers && status === "idle" && (
          <p className="mt-3 text-sm font-medium text-red-600">請先上傳前測報告。</p>
        )}
      </div>
    </div>
  );
}
