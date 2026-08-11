import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="relative flex flex-col items-center text-center">
        <h1 className="animate-fade-up text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          AI成熟度量表
        </h1>

        <Link
          href="/quiz/0"
          style={{ animationDelay: "150ms" }}
          className="animate-fade-up mt-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 px-10 py-3 text-lg font-medium text-white shadow-[0_8px_30px_rgba(5,150,105,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(5,150,105,0.5)] active:scale-[0.97]"
        >
          開始測驗
        </Link>

        <Link
          href="/scoring"
          style={{ animationDelay: "220ms" }}
          className="animate-fade-up mt-4 rounded-full border border-emerald-600 bg-[#f7faf8] px-10 py-3 text-lg font-medium text-emerald-700 shadow-[0_8px_30px_rgba(5,150,105,0.15)] transition-all hover:scale-[1.03] hover:bg-emerald-50 active:scale-[0.97]"
        >
          評分說明
        </Link>
      </div>
    </div>
  );
}
