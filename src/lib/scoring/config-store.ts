import fs from "node:fs";
import path from "node:path";
import { DIMENSION_WEIGHTS } from "./dimensions";
import { QUESTIONS } from "./questions";
import type { DimensionKey } from "./types";

/**
 * server-only：題目文字與構面權重的「覆寫層」，存成一個 JSON 檔案。
 * 全站共用（不是存在單一使用者的瀏覽器裡）——後台改一次，所有人做題目、算分數、
 * 產出報告都會套用新內容。沒有覆寫值的欄位就照 questions.ts / dimensions.ts 的預設值。
 *
 * 用檔案而不是資料庫，是因為專案目前沒有資料庫。這個做法在本機開發、或部署到
 * 有持久化檔案系統的伺服器（傳統 VM／容器）都沒問題；但如果之後部署到 Vercel
 * 這類無伺服器平台，檔案系統在每次部署/冷啟動後可能被重置，屆時要換成真正的資料庫。
 */
export interface ScoringOverrides {
  questionTitles?: Partial<Record<string, string>>;
  dimensionWeights?: Partial<Record<DimensionKey, number>>;
}

export interface EffectiveScoringConfig {
  questionTitles: Record<string, string>;
  dimensionWeights: Record<DimensionKey, number>;
}

const CONFIG_PATH = path.join(process.cwd(), "data", "scoring-config.json");

export function readOverrides(): ScoringOverrides {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw) as ScoringOverrides;
  } catch {
    return {};
  }
}

export function writeOverrides(overrides: ScoringOverrides): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(overrides, null, 2), "utf8");
}

export function resetOverrides(): void {
  writeOverrides({});
}

export function getEffectiveConfig(overrides: ScoringOverrides = readOverrides()): EffectiveScoringConfig {
  const questionTitles = Object.fromEntries(
    QUESTIONS.map((q) => [q.id, overrides.questionTitles?.[q.id] ?? q.title])
  );
  const dimensionWeights = { ...DIMENSION_WEIGHTS, ...overrides.dimensionWeights };
  return { questionTitles, dimensionWeights };
}
