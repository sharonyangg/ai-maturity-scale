import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="relative flex flex-col items-center text-center">
        <h1 className="animate-fade-up text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          企業成熟度診斷問卷
        </h1>
        <div
          className="animate-fade-up mt-6 max-w-2xl rounded-2xl bg-[#faf7ea] p-6 text-left shadow-[0_2px_16px_rgba(21,31,30,0.08)]"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-base leading-relaxed text-slate-600">
            「企業成熟度診斷問卷」旨在協助進駐團隊透過簡易的自我評估，快速掌握組織目前的營運現況與發展階段。本系統將依據客觀的評分模型，全面檢視貴單位在「組織能力、服務能力、商業模式、數位能力與永續能力」等五大核心構面之成熟度。完成測驗後，系統會即時產出視覺化的雷達圖與專屬評估報告，為您建立明確的前測基準。此診斷結果將直接作為後續分配輔導資源、媒合適切領域專家，以及規劃一對一輔導重點的重要依據。
          </p>
        </div>
        <p className="animate-fade-up mt-3 max-w-md text-base text-slate-500" style={{ animationDelay: "110ms" }}>
          第一次填答請選擇「開始前測」；
          <br />
          完成輔導後回來比較成效，請選擇「開始後測」。
        </p>

        <Link
          href="/quiz/pre/0"
          style={{ animationDelay: "150ms" }}
          className="animate-fade-up mt-10 rounded-full bg-gradient-to-r from-olive-500 to-olive-900 px-10 py-3 text-lg font-medium text-white shadow-[0_8px_30px_rgba(61,78,23,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(61,78,23,0.5)] active:scale-[0.97]"
        >
          開始前測
        </Link>

        <Link
          href="/quiz/post/0"
          style={{ animationDelay: "190ms" }}
          className="animate-fade-up mt-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-700 px-10 py-3 text-lg font-medium text-white shadow-[0_8px_30px_rgba(199,160,3,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(199,160,3,0.5)] active:scale-[0.97]"
        >
          開始後測
        </Link>

        <Link
          href="/scoring"
          style={{ animationDelay: "230ms" }}
          className="animate-fade-up mt-4 rounded-full border border-olive-700 bg-[#faf7ea] px-10 py-3 text-lg font-medium text-olive-700 shadow-[0_8px_30px_rgba(61,78,23,0.1)] transition-all hover:scale-[1.03] hover:bg-gold-50 active:scale-[0.97]"
        >
          評分說明
        </Link>
      </div>

      <Link
        href="/admin"
        aria-label="編輯題目與權重"
        title="編輯題目與權重"
        className="fixed right-5 bottom-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-olive-500 to-olive-900 text-white shadow-[0_4px_16px_rgba(61,78,23,0.4)] transition-all hover:scale-110 active:scale-95"
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
