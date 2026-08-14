"use client";

import { useRef, useState } from "react";
import { extractPretestAnswersFromDocx } from "@/lib/docx-code";
import { useQuizStore } from "@/lib/quiz-store";
import { computeResult } from "@/lib/scoring/engine";
import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/scoring/dimensions";

const CARD_CLASS = "rounded-2xl bg-[#faf7ea] p-5 shadow-[0_2px_16px_rgba(21,31,30,0.08)] sm:p-6";

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
        <h2 className="text-2xl font-bold text-slate-900">上傳前測報告</h2>
        <p className="mt-1 text-base text-slate-500">
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
          className="w-full rounded-lg border-2 border-dashed border-gold-500 bg-gold-50 px-4 py-8 text-center text-base font-medium text-gold-700 transition-colors hover:bg-gold-50/70"
        >
          {status === "parsing" ? "讀取中…" : "點此選擇前測 Word 報告（.docx）"}
        </button>

        {status === "success" && result && (
          <div className="mt-4 rounded-lg bg-olive-900/5 p-4 text-base text-olive-900">
            <p className="font-medium">已成功讀取前測資料 ✓</p>
            <p className="mt-1 text-sm text-gray-600">
              前測加權總分：{result.weightedScore.toFixed(1)} 分／{result.levelName}
            </p>
            <ul className="mt-2 space-y-0.5 text-sm text-gray-600">
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
