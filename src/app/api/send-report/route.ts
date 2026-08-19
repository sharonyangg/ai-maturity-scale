import { NextResponse } from "next/server";
import { buildResultDocxBuffer, resultDocxFilename } from "@/lib/export-docx";
import { sendReportEmail } from "@/lib/mailer";
import { computeResult } from "@/lib/scoring/engine";
import { getEffectiveConfig } from "@/lib/scoring/config-store";
import type { CompanyInfo } from "@/lib/quiz-store";
import type { Answers } from "@/lib/scoring/types";

// nodemailer 需要 Node.js 的 net/tls，不能跑在 edge runtime。
export const runtime = "nodejs";

interface SendReportBody {
  companyInfo: CompanyInfo;
  answers: Answers;
  prevAnswers?: Answers;
  chartPngBase64?: string;
  chartWidth?: number;
  chartHeight?: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAnswers(value: unknown): value is Answers {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: SendReportBody;
  try {
    body = (await request.json()) as SendReportBody;
  } catch {
    return NextResponse.json({ ok: false, error: "請求格式錯誤" }, { status: 400 });
  }

  const email = body.companyInfo?.email?.trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "未提供有效的 email，略過寄送" });
  }
  if (!isAnswers(body.answers) || Object.keys(body.answers).length === 0) {
    return NextResponse.json({ ok: false, error: "缺少作答資料" }, { status: 400 });
  }

  const { questionTitles, dimensionWeights, levelRanges } = await getEffectiveConfig();
  const result = computeResult(body.answers, dimensionWeights, levelRanges);
  const chartSnapshot =
    body.chartPngBase64 && body.chartWidth && body.chartHeight
      ? {
          bytes: new Uint8Array(Buffer.from(body.chartPngBase64, "base64")),
          width: body.chartWidth,
          height: body.chartHeight,
        }
      : null;

  try {
    const params = {
      result,
      companyInfo: body.companyInfo,
      answers: body.answers,
      chartSnapshot,
      prevAnswers: body.prevAnswers,
      questionTitles,
      dimensionWeights,
      levelRanges,
    };
    const buffer = await buildResultDocxBuffer(params);
    const filename = resultDocxFilename(params);
    const roundLabel = body.prevAnswers ? "後測" : "前測";

    const send = await sendReportEmail({
      to: email,
      subject: `企業成熟度診斷問卷${roundLabel}報告${body.companyInfo.companyName ? ` - ${body.companyInfo.companyName}` : ""}`,
      text: `您好，附件為貴單位本次${roundLabel}的企業成熟度診斷報告，請查收。\n\n此為系統自動發送之郵件，請勿直接回覆。`,
      attachment: { filename, content: buffer },
    });

    if (!send.ok) {
      return NextResponse.json({ ok: false, error: send.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "產生報告失敗" },
      { status: 500 }
    );
  }
}
