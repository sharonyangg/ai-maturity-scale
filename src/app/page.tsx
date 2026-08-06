import Link from "next/link";
import { DIMENSION_LABELS, DIMENSION_ORDER } from "@/lib/scoring/dimensions";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl text-center">
        <p className="text-sm font-medium text-blue-600">製造業 AI 成熟度量表</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">評估您企業的 AI 成熟度</h1>
        <p className="mt-4 text-gray-500">
          回答關於{DIMENSION_ORDER.map((d) => DIMENSION_LABELS[d]).join("、")}
          的問題，立即取得您的 AI 成熟度等級與五大構面分析。
        </p>
        <Link
          href="/quiz/0"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700"
        >
          開始測驗
        </Link>
      </div>
    </div>
  );
}
