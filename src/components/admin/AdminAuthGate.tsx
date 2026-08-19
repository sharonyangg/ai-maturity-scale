"use client";

import { useState, type FormEvent } from "react";

/**
 * 密碼不記在 sessionStorage 或任何持久化的地方——每次進到這個元件（也就是每次
 * 點進 /admin）都要重新輸入密碼，離開頁面再回來就會重新鎖住。
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "密碼錯誤");
        return;
      }
      setAuthed(true);
    } catch {
      setError("驗證失敗，請確認網路連線後再試一次");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-[2rem] border border-white/60 bg-white/50 p-8 text-center shadow-[0_8px_32px_rgba(148,163,223,0.15)] backdrop-blur-xl"
        >
          <h1 className="text-2xl font-bold text-slate-700">後台密碼</h1>
          <p className="mt-2 text-base text-slate-600">請輸入密碼以編輯題目、權重與寄信設定。</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            placeholder="請輸入密碼"
            className="mt-6 w-full rounded-full border-2 border-white/40 bg-white/60 px-5 py-2.5 text-center text-base text-slate-700 backdrop-blur-md transition-all duration-300 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
          />
          {error && <p className="mt-3 text-sm font-medium text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !password}
            className="mt-6 w-full rounded-full bg-gradient-to-br from-sky-300 to-sky-400 px-8 py-3 text-lg font-semibold text-slate-700 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "驗證中…" : "進入後台"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
