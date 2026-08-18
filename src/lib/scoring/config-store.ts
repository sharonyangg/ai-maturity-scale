import { readJson, writeJson } from "../kv-store";
import { DIMENSION_WEIGHTS } from "./dimensions";
import { QUESTIONS } from "./questions";
import type { DimensionKey } from "./types";

/**
 * server-only：題目文字與構面權重的「覆寫層」。
 * 全站共用（不是存在單一使用者的瀏覽器裡）——後台改一次，所有人做題目、算分數、
 * 產出報告都會套用新內容。沒有覆寫值的欄位就照 questions.ts / dimensions.ts 的預設值。
 * 底層儲存見 kv-store.ts（本機檔案／Upstash Redis 自動切換）。
 */
export interface ScoringOverrides {
  questionTitles?: Partial<Record<string, string>>;
  dimensionWeights?: Partial<Record<DimensionKey, number>>;
}

export interface EffectiveScoringConfig {
  questionTitles: Record<string, string>;
  dimensionWeights: Record<DimensionKey, number>;
}

const KEY = "scoring-config";

export async function readOverrides(): Promise<ScoringOverrides> {
  return (await readJson<ScoringOverrides>(KEY)) ?? {};
}

export async function writeOverrides(overrides: ScoringOverrides): Promise<void> {
  await writeJson(KEY, overrides);
}

export async function resetOverrides(): Promise<void> {
  await writeOverrides({});
}

export async function getEffectiveConfig(overrides?: ScoringOverrides): Promise<EffectiveScoringConfig> {
  const resolved = overrides ?? (await readOverrides());
  const questionTitles = Object.fromEntries(
    QUESTIONS.map((q) => [q.id, resolved.questionTitles?.[q.id] ?? q.title])
  );
  const dimensionWeights = { ...DIMENSION_WEIGHTS, ...resolved.dimensionWeights };
  return { questionTitles, dimensionWeights };
}
