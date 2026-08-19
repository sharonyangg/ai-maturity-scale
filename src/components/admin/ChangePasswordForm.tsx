"use client";

import { useState } from "react";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setMessage(null);
    if (newPassword.length < 4) {
      setMessage({ type: "error", text: "新密碼長度至少要 4 碼" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "兩次輸入的新密碼不一致" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "修改失敗" });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "已修改密碼，下次進入後台請用新密碼。" });
    } catch {
      setMessage({ type: "error", text: "修改失敗，請確認網路連線後再試一次" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <p className="mb-4 text-base leading-relaxed text-slate-600">
        用來鎖定這個編輯頁面的密碼，全站共用一組。
      </p>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-500">目前密碼</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-500">新密碼（至少 4 碼）</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-500">再輸入一次新密碼</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
      </div>

      {message && (
        <p className={`mt-4 text-base font-medium ${message.type === "success" ? "text-sky-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="w-full rounded-full bg-gradient-to-br from-sky-300 to-sky-400 px-6 py-2.5 text-center font-semibold text-slate-700 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "修改中…" : "修改密碼"}
        </button>
      </div>
    </>
  );
}
