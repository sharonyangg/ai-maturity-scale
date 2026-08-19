"use client";

import { useEffect, useState } from "react";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25";

interface MailSettingsView {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  ccEmail: string;
  hasPassword: boolean;
}

const EMPTY_VIEW: MailSettingsView = {
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpFrom: "",
  ccEmail: "",
  hasPassword: false,
};

export function MailSettingsForm() {
  const [view, setView] = useState<MailSettingsView>(EMPTY_VIEW);
  const [smtpPassInput, setSmtpPassInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const [showHostHelp, setShowHostHelp] = useState(false);

  const load = () => {
    fetch("/api/admin/mail-settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MailSettingsView | null) => {
        if (data) setView(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = <K extends keyof MailSettingsView>(key: K, value: MailSettingsView[K]) => {
    setView((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/mail-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost: view.smtpHost,
          smtpPort: view.smtpPort,
          smtpUser: view.smtpUser,
          smtpPass: smtpPassInput, // 留空＝不變更，由後端保留原本密碼
          smtpFrom: view.smtpFrom,
          ccEmail: view.ccEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "儲存失敗" });
        return;
      }
      setView(data);
      setSmtpPassInput("");
      setMessage({ type: "success", text: "已儲存寄信設定。" });
    } catch {
      setMessage({ type: "error", text: "儲存失敗，請確認網路連線後再試一次" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("確定要清空後台寄信設定，改回用環境變數（.env.local）的設定嗎？")) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/mail-settings", { method: "DELETE" });
      const data = await res.json();
      setView(data);
      setSmtpPassInput("");
      setMessage({ type: "success", text: "已清空，改用環境變數設定。" });
    } catch {
      setMessage({ type: "error", text: "清空失敗，請確認網路連線後再試一次" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-base text-slate-500">寄信設定讀取中…</p>;
  }

  return (
    <>
      <p className="mb-4 text-base leading-relaxed text-slate-600">
        「發信」是系統用來寄信的信箱帳密；「副本收件」是額外固定加寄一份給指定信箱，方便留存紀錄。
      </p>

      <div className="space-y-4">
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="mb-1 flex flex-wrap items-center justify-between gap-x-1.5 gap-y-0.5 text-sm font-medium text-slate-500">
                <span>主機（SMTP Host）</span>
                <button
                  type="button"
                  onClick={() => setShowHostHelp((prev) => !prev)}
                  className="text-sky-600 underline decoration-sky-300 decoration-2 underline-offset-2 transition-colors duration-300 hover:text-sky-700"
                >
                  {showHostHelp ? "收起說明" : "常見的信箱主機？"}
                </button>
              </span>
              <input
                type="text"
                value={view.smtpHost}
                onChange={(e) => set("smtpHost", e.target.value)}
                placeholder="例如 smtp.gmail.com、smtp.office365.com"
                className={INPUT_CLASS}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-500">連接埠</span>
              <input
                type="number"
                value={view.smtpPort}
                onChange={(e) => set("smtpPort", Number(e.target.value))}
                className={`${INPUT_CLASS} sm:w-28`}
              />
            </label>
          </div>

          {showHostHelp && (
            <div className="mt-2 space-y-3 rounded-2xl border border-white/60 bg-white/60 p-4 text-sm leading-relaxed text-slate-600 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-300/60 text-slate-500">
                      <th className="py-1 pr-3 font-semibold">服務商</th>
                      <th className="py-1 pr-3 font-semibold">主機</th>
                      <th className="py-1 font-semibold">連接埠</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200/60">
                      <td className="py-1 pr-3">Gmail</td>
                      <td className="py-1 pr-3 font-mono">smtp.gmail.com</td>
                      <td className="py-1 font-mono">587</td>
                    </tr>
                    <tr className="border-b border-slate-200/60">
                      <td className="py-1 pr-3">Office365／Outlook（企業信箱）</td>
                      <td className="py-1 pr-3 font-mono">smtp.office365.com</td>
                      <td className="py-1 font-mono">587</td>
                    </tr>
                    <tr className="border-b border-slate-200/60">
                      <td className="py-1 pr-3">Yahoo Mail</td>
                      <td className="py-1 pr-3 font-mono">smtp.mail.yahoo.com</td>
                      <td className="py-1 font-mono">587</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-3">iCloud Mail</td>
                      <td className="py-1 pr-3 font-mono">smtp.mail.me.com</td>
                      <td className="py-1 font-mono">587</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                連接埠 587 是目前最通用的加密方式，幾乎所有服務商都支援，沒有特殊需求就用
                587。
              </p>
            </div>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-500">發信信箱</span>
          <input
            type="text"
            value={view.smtpUser}
            onChange={(e) => set("smtpUser", e.target.value)}
            placeholder="例如 sharonyang@iii.org.tw"
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 flex flex-wrap items-center justify-between gap-x-1.5 gap-y-0.5 text-sm font-medium text-slate-500">
            <span>密碼</span>
            <button
              type="button"
              onClick={() => setShowPasswordHelp((prev) => !prev)}
              className="text-sky-600 underline decoration-sky-300 decoration-2 underline-offset-2 transition-colors duration-300 hover:text-sky-700"
            >
              {showPasswordHelp ? "收起說明" : "如何取得密碼？"}
            </button>
          </span>
          <input
            type="password"
            value={smtpPassInput}
            onChange={(e) => setSmtpPassInput(e.target.value)}
            placeholder={view.hasPassword ? "••••••••" : "尚未設定"}
            className={INPUT_CLASS}
          />
          {showPasswordHelp && (
            <div className="mt-2 space-y-3 rounded-2xl border border-white/60 bg-white/60 p-4 text-sm leading-relaxed text-slate-600 backdrop-blur-md">
              <p>密碼指的是信箱另外提供的一組「應用程式密碼」。</p>
              <div>
                <p className="font-semibold text-slate-700">Office365 企業信箱：</p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                  <li>先確認信箱有開啟兩步驟驗證（多數企業 Office365 預設會要求）</li>
                  <li>
                    到{" "}
                    <a
                      href="https://mysignins.microsoft.com/security-info"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 underline decoration-sky-300 underline-offset-2 hover:text-sky-700"
                    >
                      mysignins.microsoft.com/security-info
                    </a>
                    （或「Microsoft 帳戶→安全性」）
                  </li>
                  <li>找「應用程式密碼 App passwords」，建立一組新的</li>
                  <li>系統會產生一串英數字密碼（只會顯示一次），把它填進上面的密碼欄位</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Gmail：</p>
                <p className="mt-1">
                  Google 帳戶 → 安全性 → 兩步驟驗證 → 最下面「應用程式密碼」，一樣是產生一組專用密碼；找不到的話，也可以直接在 Google
                  帳戶設定最上面的搜尋欄搜尋「應用程式密碼」。
                </p>
              </div>
            </div>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-500">副本收件</span>
          <input
            type="email"
            value={view.ccEmail}
            onChange={(e) => set("ccEmail", e.target.value)}
            placeholder="例如 base-admin@example.org"
            className={INPUT_CLASS}
          />
        </label>
      </div>

      {message && (
        <p className={`mt-4 text-base font-medium ${message.type === "success" ? "text-sky-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="w-full rounded-full border-2 border-white/40 bg-white/50 px-6 py-2.5 text-center font-medium text-slate-600 shadow-[0_4px_10px_rgba(148,163,223,0.15)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-white/70 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          清空（改用環境變數）
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-full bg-gradient-to-br from-sky-300 to-sky-400 px-6 py-2.5 text-center font-semibold text-slate-700 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "儲存中…" : "儲存寄信設定"}
        </button>
      </div>
    </>
  );
}
