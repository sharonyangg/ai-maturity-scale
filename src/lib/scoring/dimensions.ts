import type { DimensionKey, Level } from "./types";

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  baseData: "基礎數據",
  inputResource: "投入資源",
  strategy: "策略管理",
  application: "應用落地",
  diffusion: "效益擴散",
};

export const DIMENSION_ORDER: DimensionKey[] = [
  "baseData",
  "inputResource",
  "strategy",
  "application",
  "diffusion",
];

export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  baseData: 0.25,
  inputResource: 0.25,
  strategy: 0.125,
  application: 0.125,
  diffusion: 0.25,
};

export const LEVEL_NAMES: Record<Level, string> = {
  1: "Unknowing AI",
  2: "Conscious AI",
  3: "Ready AI",
  4: "Scaling AI",
};

export const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  1: "尚未意識",
  2: "初步意識",
  3: "準備就緒",
  4: "規模化擴散",
};

export const LEVEL_COLORS: Record<Level, { from: string; to: string; glow: string }> = {
  1: { from: "#f87171", to: "#b91c1c", glow: "rgba(185,28,28,0.4)" }, // red-400 → red-700，尚未意識，需要關注
  2: { from: "#fb923c", to: "#c2410c", glow: "rgba(194,65,12,0.4)" }, // orange-400 → orange-700，初步意識
  3: { from: "#22d3ee", to: "#0e7490", glow: "rgba(14,116,144,0.4)" }, // cyan-400 → cyan-700，準備就緒
  4: { from: "#10b981", to: "#047857", glow: "rgba(4,120,87,0.45)" }, // emerald-500 → 700，規模化擴散，達標
};

export const LEVEL_THRESHOLDS: [number, number, number] = [20.625, 45.125, 59.4375];

export function levelFromWeightedScore(weightedScore: number): Level {
  const [t1, t2, t3] = LEVEL_THRESHOLDS;
  if (weightedScore <= t1) return 1;
  if (weightedScore <= t2) return 2;
  if (weightedScore <= t3) return 3;
  return 4;
}
