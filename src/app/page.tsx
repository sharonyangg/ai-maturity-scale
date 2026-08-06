import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="relative flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          AI成熟度量表
        </h1>

        <Link
          href="/quiz/0"
          className="mt-10 rounded-full bg-gradient-to-r from-[#3987e5] to-[#104281] px-10 py-3 text-base font-medium text-white shadow-[0_8px_30px_rgba(57,135,229,0.35)] transition-all hover:shadow-[0_8px_40px_rgba(57,135,229,0.55)] hover:brightness-110"
        >
          開始測驗
        </Link>
      </div>
    </div>
  );
}
