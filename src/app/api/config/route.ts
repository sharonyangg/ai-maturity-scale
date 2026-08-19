import { NextResponse } from "next/server";
import {
  getEffectiveConfig,
  resetOverrides,
  writeOverrides,
  type ScoringOverrides,
} from "@/lib/scoring/config-store";
import { QUESTIONS } from "@/lib/scoring/questions";
import { DIMENSION_ORDER } from "@/lib/scoring/dimensions";
import type { Level } from "@/lib/scoring/types";

const VALID_LEVELS: Level[] = [1, 2, 3, 4];

// 要用 fs 讀寫本機檔案，不能跑在 edge runtime。
export const runtime = "nodejs";
// 內容會被後台改動，永遠回傳最新的，不要被快取。
export const dynamic = "force-dynamic";

const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));

/**
 * 內容會被後台改動，每次都要拿到最新的，所以明確關掉快取：
 * `dynamic = "force-dynamic"` 只影響 Next.js 自己 server 端的資料快取，
 * 瀏覽器對同一條 GET URL 還是可能套用預設的 HTTP 快取，導致改了設定、
 * 但客戶端（填答頁、結果頁）用舊的 fetch 結果算分數。
 */
function noStore(body: unknown) {
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return NextResponse.json({ ok: false, error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    return noStore(await getEffectiveConfig());
  } catch (err) {
    return serverError(err);
  }
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

  const levelRanges: ScoringOverrides["levelRanges"] = {};
  if (body.levelRanges) {
    for (const [levelKey, range] of Object.entries(body.levelRanges)) {
      const level = Number(levelKey) as Level;
      if (!VALID_LEVELS.includes(level)) {
        return NextResponse.json({ ok: false, error: `未知的等級：${levelKey}` }, { status: 400 });
      }
      if (
        !range ||
        typeof range.min !== "number" ||
        typeof range.max !== "number" ||
        !Number.isFinite(range.min) ||
        !Number.isFinite(range.max) ||
        range.min < 0 ||
        range.max > 100 ||
        range.min > range.max
      ) {
        return NextResponse.json(
          { ok: false, error: `等級 ${levelKey} 的分數區間不正確（要是 0～100 之間，且最低分不能大於最高分）` },
          { status: 400 }
        );
      }
      levelRanges[level] = { min: range.min, max: range.max };
    }
  }

  try {
    await writeOverrides({ questionTitles, dimensionWeights, levelRanges });
    return noStore(await getEffectiveConfig());
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE() {
  try {
    await resetOverrides();
    return noStore(await getEffectiveConfig());
  } catch (err) {
    return serverError(err);
  }
}
