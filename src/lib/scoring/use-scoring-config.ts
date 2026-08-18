"use client";

import { useEffect, useState } from "react";
import { QUESTIONS } from "./questions";
import { DIMENSION_WEIGHTS } from "./dimensions";
import type { DimensionKey } from "./types";

export interface EffectiveScoringConfig {
  questionTitles: Record<string, string>;
  dimensionWeights: Record<DimensionKey, number>;
}

export function defaultScoringConfig(): EffectiveScoringConfig {
  return {
    questionTitles: Object.fromEntries(QUESTIONS.map((q) => [q.id, q.title])),
    dimensionWeights: { ...DIMENSION_WEIGHTS },
  };
}

/**
 * 從 /api/config 抓後台目前設定的題目文字／構面權重（全站共用的覆寫值）。
 * 抓到之前先用程式內建的預設值顯示，避免畫面空白；抓取失敗也維持預設值。
 */
export function useScoringConfig(): { config: EffectiveScoringConfig; loaded: boolean } {
  const [config, setConfig] = useState<EffectiveScoringConfig>(defaultScoringConfig);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: EffectiveScoringConfig | null) => {
        if (!cancelled && data) {
          setConfig(data);
          setLoaded(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loaded };
}
