import { NextResponse } from "next/server";
import {
  getEffectiveConfig,
  resetOverrides,
  writeOverrides,
  type ScoringOverrides,
} from "@/lib/scoring/config-store";
import { QUESTIONS } from "@/lib/scoring/questions";
import { DIMENSION_ORDER } from "@/lib/scoring/dimensions";

// 要用 fs 讀寫本機檔案，不能跑在 edge runtime。
export const runtime = "nodejs";
// 內容會被後台改動，永遠回傳最新的，不要被快取。
export const dynamic = "force-dynamic";

const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));

export async function GET() {
  return NextResponse.json(getEffectiveConfig());
}

export async function PUT(request: Request) {
  let body: ScoringOverrides;
  try {
    body = (await request.json()) as ScoringOverrides;
  } catch {
    return NextResponse.json({ ok: false, error: "請求格式錯誤" }, { status: 400 });
  }

  const questionTitles: Record<string, string> = {};
  if (body.questionTitles) {
    for (const [id, title] of Object.entries(body.questionTitles)) {
      if (!QUESTION_IDS.has(id)) {
        return NextResponse.json({ ok: false, error: `未知的題目編號：${id}` }, { status: 400 });
      }
      if (typeof title === "string" && title.trim()) {
        questionTitles[id] = title.trim();
      }
    }
  }

  const dimensionWeights: Record<string, number> = {};
  if (body.dimensionWeights) {
    for (const [dim, weight] of Object.entries(body.dimensionWeights)) {
      if (!DIMENSION_ORDER.includes(dim as (typeof DIMENSION_ORDER)[number])) {
        return NextResponse.json({ ok: false, error: `未知的構面：${dim}` }, { status: 400 });
      }
      if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) {
        return NextResponse.json({ ok: false, error: `權重必須是不小於 0 的數字：${dim}` }, { status: 400 });
      }
      dimensionWeights[dim] = weight;
    }
  }

  writeOverrides({ questionTitles, dimensionWeights });
  return NextResponse.json(getEffectiveConfig());
}

export async function DELETE() {
  resetOverrides();
  return NextResponse.json(getEffectiveConfig());
}
