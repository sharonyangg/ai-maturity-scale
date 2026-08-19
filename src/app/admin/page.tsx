"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DIMENSION_LABELS, DIMENSION_ORDER, LEVEL_NAMES } from "@/lib/scoring/dimensions";
import { QUESTION_PAGES } from "@/lib/scoring/questions";
import { defaultScoringConfig, type EffectiveScoringConfig } from "@/lib/scoring/use-scoring-config";
import { MailSettingsForm } from "@/components/admin/MailSettingsForm";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AccordionSection } from "@/components/admin/AccordionSection";
import type { DimensionKey, Level } from "@/lib/scoring/types";

const LEVELS: Level[] = [1, 2, 3, 4];
type LevelRangeInputs = Record<Level, { min: string; max: string }>;

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <AdminPageContent />
    </AdminAuthGate>
  );
}

function AdminPageContent() {
  const [config, setConfig] = useState<EffectiveScoringConfig>(defaultScoringConfig);
  const [weightInputs, setWeightInputs] = useState<Record<DimensionKey, string>>(() =>
    Object.fromEntries(DIMENSION_ORDER.map((dim) => [dim, "20"])) as Record<DimensionKey, string>
  );
  const [levelRangeInputs, setLevelRangeInputs] = useState<LevelRangeInputs>(() =>
    Object.fromEntries(LEVELS.map((level) => [level, { min: "0", max: "0" }])) as LevelRangeInputs
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const applyConfig = (data: EffectiveScoringConfig) => {
    setConfig(data);
    setWeightInputs(
      Object.fromEntries(
        DIMENSION_ORDER.map((dim) => [dim, String(Math.round(data.dimensionWeights[dim] * 100))])
      ) as Record<DimensionKey, string>
    );
    setLevelRangeInputs(
      Object.fromEntries(
        LEVELS.map((level) => [
          level,
          { min: String(data.levelRanges[level].min), max: String(data.levelRanges[level].max) },
        ])
      ) as LevelRangeInputs
    );
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: EffectiveScoringConfig | null) => {
        if (!cancelled && data) applyConfig(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const weightSum = DIMENSION_ORDER.reduce((sum, dim) => sum + (Number(weightInputs[dim]) || 0), 0);

  const setTitle = (id: string, value: string) => {
    setConfig((prev) => ({ ...prev, questionTitles: { ...prev.questionTitles, [id]: value } }));
  };

  const setWeight = (dim: DimensionKey, value: string) => {
    setWeightInputs((prev) => ({ ...prev, [dim]: value }));
  };

  const setLevelRange = (level: Level, field: "min" | "max", value: string) => {
    setLevelRangeInputs((prev) => ({ ...prev, [level]: { ...prev[level], [field]: value } }));
  };

  /** 區間有沒有中間留空隙、或跟上一級重疊——只是提醒，不會擋儲存 */
  const levelRangeWarning = (() => {
    for (const level of LEVELS) {
      const min = Number(levelRangeInputs[level].min);
      const max = Number(levelRangeInputs[level].max);
      if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
        return `等級 ${level}（${LEVEL_NAMES[level]}）的最低分不能大於最高分`;
      }
    }
    for (let i = 1; i < LEVELS.length; i++) {
      const prevMax = Number(levelRangeInputs[LEVELS[i - 1]].max);
      const currentMin = Number(levelRangeInputs[LEVELS[i]].min);
      if (currentMin === prevMax + 1) continue;
      if (currentMin > prevMax + 1) {
        return `等級 ${LEVELS[i - 1]} 與等級 ${LEVELS[i]} 之間有分數區間沒被涵蓋到（${prevMax + 1} ~ ${currentMin - 1} 分）`;
      }
      return `等級 ${LEVELS[i - 1]} 與等級 ${LEVELS[i]} 的分數區間重疊了`;
    }
    return null;
  })();

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const dimensionWeights = Object.fromEntries(
        DIMENSION_ORDER.map((dim) => [dim, (Number(weightInputs[dim]) || 0) / 100])
      );
      const levelRanges = Object.fromEntries(
        LEVELS.map((level) => [
          level,
          { min: Number(levelRangeInputs[level].min) || 0, max: Number(levelRangeInputs[level].max) || 0 },
        ])
      );
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionTitles: config.questionTitles, dimensionWeights, levelRanges }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "儲存失敗" });
        return;
      }
      applyConfig(data);
      setMessage({ type: "success", text: "已儲存，所有人接下來看到的題目與計分都會套用新設定。" });
    } catch {
      setMessage({ type: "error", text: "儲存失敗，請確認網路連線後再試一次" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("確定要把題目文字與權重都還原成預設值嗎？")) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/config", { method: "DELETE" });
      const data = await res.json();
      applyConfig(data);
      setMessage({ type: "success", text: "已還原成預設值。" });
    } catch {
      setMessage({ type: "error", text: "還原失敗，請確認網路連線後再試一次" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-lg text-slate-500">讀取中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-700 sm:text-4xl">題目與權重編輯</h1>
          <p className="mt-2 text-lg leading-relaxed text-slate-600">
            點各區塊標題展開／收合。修改後按最下面的「儲存」，所有人之後填答、算分數、產出報告都會套用新內容。
          </p>
        </div>

        <AccordionSection title="寄信設定">
          <MailSettingsForm />
        </AccordionSection>

        <AccordionSection title="修改後台密碼">
          <ChangePasswordForm />
        </AccordionSection>

        <AccordionSection title="五大構面權重">
          <div className="space-y-3">
            {DIMENSION_ORDER.map((dim) => (
              <label key={dim} className="flex items-center justify-between gap-4">
                <span className="text-lg font-medium text-slate-700">{DIMENSION_LABELS[dim]}</span>
                <span className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={weightInputs[dim]}
                    onChange={(e) => setWeight(dim, e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-right text-base text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
                  />
                  <span className="text-lg text-slate-500">%</span>
                </span>
              </label>
            ))}
          </div>
          <p className={`mt-4 text-base font-medium ${weightSum === 100 ? "text-sky-700" : "text-red-600"}`}>
            權重總和：{weightSum}%{weightSum !== 100 && "（建議調整成剛好 100%）"}
          </p>
        </AccordionSection>

        <AccordionSection title="四個等級的分數區間">
          <p className="mb-4 text-base leading-relaxed text-slate-600">
            加權分數（0～100 分）落在哪個區間，就會判定成哪個等級；四個等級的最低分／最高分可以分別調整。
          </p>
          <div className="space-y-3">
            {LEVELS.map((level) => (
              <div key={level} className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-lg font-medium text-slate-700">
                  Lv.{level}　{LEVEL_NAMES[level]}
                </span>
                <span className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={levelRangeInputs[level].min}
                    onChange={(e) => setLevelRange(level, "min", e.target.value)}
                    className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-right text-base text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
                  />
                  <span className="text-lg text-slate-500">～</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={levelRangeInputs[level].max}
                    onChange={(e) => setLevelRange(level, "max", e.target.value)}
                    className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-right text-base text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
                  />
                  <span className="text-lg text-slate-500">分</span>
                </span>
              </div>
            ))}
          </div>
          {levelRangeWarning && <p className="mt-4 text-base font-medium text-red-600">{levelRangeWarning}</p>}
        </AccordionSection>

        {QUESTION_PAGES.map((page) => (
          <AccordionSection key={page.dimension} title={DIMENSION_LABELS[page.dimension]}>
            <div className="space-y-4">
              {page.questionIds.map((id) => (
                <label key={id} className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-500">{id}</span>
                  <textarea
                    value={config.questionTitles[id] ?? ""}
                    onChange={(e) => setTitle(id, e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
                  />
                </label>
              ))}
            </div>
          </AccordionSection>
        ))}

        {message && (
          <p
            className={`text-center text-base font-medium ${
              message.type === "success" ? "text-sky-700" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="w-full rounded-full border-2 border-white/40 bg-white/50 px-8 py-3 text-center font-medium text-slate-600 shadow-[0_4px_10px_rgba(148,163,223,0.15)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-white/70 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            還原預設值
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-gradient-to-br from-sky-300 to-sky-400 px-8 py-3 text-center font-semibold text-slate-700 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? "儲存中…" : "儲存"}
          </button>
          <Link
            href="/"
            className="w-full rounded-full px-8 py-3 text-center font-medium text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-700 sm:w-auto"
          >
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
