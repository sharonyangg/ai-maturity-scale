"use client";

import { useEffect, useState } from "react";

const CARD_CLASS = "rounded-2xl bg-[#faf7ea] p-5 shadow-[0_2px_16px_rgba(21,31,30,0.08)] sm:p-6";
const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25";

interface MailSettingsView {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  ccEmail: string;
  hasPassword: boolean;
  usingEnvFallback: { host: boolean; user: boolean; pass: boolean };
}

const EMPTY_VIEW: MailSettingsView = {
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpFrom: "",
  ccEmail: "",
  hasPassword: false,
  usingEnvFallback: { host: false, user: false, pass: false },
};

export function MailSettingsForm() {
  const [view, setView] = useState<MailSettingsView>(EMPTY_VIEW);
  const [smtpPassInput, setSmtpPassInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = () => {
    fetch("/api/admin/mail-settings")
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
    return (
      <div className={CARD_CLASS}>
        <p className="text-base text-gray-500">寄信設定讀取中…</p>
      </div>
    );
  }

  return (
    <div className={CARD_CLASS}>
      <h2 className="mb-1 text-2xl font-semibold text-black">寄信設定</h2>
      <p className="mb-4 text-base text-gray-500">
        「發信」是系統拿來寄信的信箱帳密；每份報告本來就會寄給填答者自己填的
        email，這裡的「副本收件」是額外固定加寄一份給指定信箱（例如基地承辦人），方便留存所有紀錄。
      </p>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-500">
            SMTP 主機{view.usingEnvFallback.host && "（目前使用環境變數 SMTP_HOST）"}
          </span>
          <input
            type="text"
            value={view.smtpHost}
            onChange={(e) => set("smtpHost", e.target.value)}
            placeholder="例如 smtp.office365.com"
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-500">SMTP 連接埠</span>
          <input
            type="number"
            value={view.smtpPort}
            onChange={(e) => set("smtpPort", Number(e.target.value))}
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-500">
            SMTP 帳號（發信信箱）{view.usingEnvFallback.user && "（目前使用環境變數 SMTP_USER）"}
          </span>
          <input
            type="text"
            value={view.smtpUser}
            onChange={(e) => set("smtpUser", e.target.value)}
            placeholder="例如 sharonyang@iii.org.tw"
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-500">
            SMTP 密碼{" "}
            {view.hasPassword
              ? view.usingEnvFallback.pass
                ? "（目前使用環境變數 SMTP_PASS，留空表示不變更）"
                : "（已設定，留空表示不變更）"
              : "（尚未設定）"}
          </span>
          <input
            type="password"
            value={smtpPassInput}
            onChange={(e) => setSmtpPassInput(e.target.value)}
            placeholder="留空＝不變更目前密碼"
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-500">寄件人顯示（留空預設用 SMTP 帳號）</span>
          <input
            type="text"
            value={view.smtpFrom}
            onChange={(e) => set("smtpFrom", e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-500">副本收件（每份報告額外加寄一份，留空表示不加寄）</span>
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
        <p className={`mt-4 text-base font-medium ${message.type === "success" ? "text-olive-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="w-full rounded-full border border-gold-500 px-6 py-2.5 text-center font-medium text-gold-700 transition-all hover:scale-[1.03] hover:bg-gold-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          清空（改用環境變數）
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-full bg-gradient-to-r from-olive-500 to-olive-900 px-6 py-2.5 text-center font-medium text-white shadow-[0_8px_30px_rgba(61,78,23,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(61,78,23,0.5)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "儲存中…" : "儲存寄信設定"}
        </button>
      </div>
    </div>
  );
}
