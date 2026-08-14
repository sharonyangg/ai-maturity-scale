import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="relative flex flex-col items-center text-center">
        <h1 className="animate-fade-up text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          企業成熟度診斷問卷
        </h1>
        <p className="animate-fade-up mt-3 max-w-md text-base text-slate-500" style={{ animationDelay: "80ms" }}>
          第一次填答請選擇「開始前測」；完成輔導後回來比較成效，請選擇「開始後測」。
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
    </div>
  );
}
