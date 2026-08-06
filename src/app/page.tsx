import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 35%, rgba(37,99,235,0.12), transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
          AI成熟度量表
        </h1>

        <Link
          href="/quiz/0"
          className="mt-10 rounded-full bg-blue-600 px-10 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
        >
          開始測驗
        </Link>
      </div>
    </div>
  );
}
