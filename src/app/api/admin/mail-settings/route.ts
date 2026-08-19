import { NextResponse } from "next/server";
import {
  getEffectiveMailSettings,
  readMailSettings,
  resetMailSettings,
  writeMailSettings,
  type MailSettingsOverrides,
} from "@/lib/mail-settings-store";

// 要用 fs 讀寫本機檔案，不能跑在 edge runtime。
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 密碼絕不在回應裡明文帶出去，只回傳「有沒有設定」；其他欄位直接回傳目前真正生效的值
 * （不管是後台設定過的，還是退回環境變數的），前端框框裡就能直接顯示現在用的是哪個。 */
async function publicView() {
  const effective = await getEffectiveMailSettings();
  return {
    smtpHost: effective.smtpHost,
    smtpPort: effective.smtpPort,
    smtpUser: effective.smtpUser,
    smtpFrom: effective.smtpFrom,
    ccEmail: effective.ccEmail,
    hasPassword: Boolean(effective.smtpPass),
  };
}

function noStore(body: unknown) {
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return NextResponse.json({ ok: false, error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    return noStore(await publicView());
  } catch (err) {
    return serverError(err);
  }
}

interface MailSettingsBody {
  smtpHost?: string;
  smtpPort?: number | string;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  ccEmail?: string;
}

export async function PUT(request: Request) {
  let body: MailSettingsBody;
  try {
    body = (await request.json()) as MailSettingsBody;
  } catch {
    return NextResponse.json({ ok: false, error: "請求格式錯誤" }, { status: 400 });
  }

  if (body.ccEmail && body.ccEmail.trim() && !EMAIL_RE.test(body.ccEmail.trim())) {
    return NextResponse.json({ ok: false, error: "副本收件 email 格式不正確" }, { status: 400 });
  }

  const port = body.smtpPort !== undefined && body.smtpPort !== "" ? Number(body.smtpPort) : undefined;
  if (port !== undefined && (!Number.isFinite(port) || port <= 0)) {
    return NextResponse.json({ ok: false, error: "SMTP 連接埠必須是正整數" }, { status: 400 });
  }

  try {
    const current = await readMailSettings();
    const next: MailSettingsOverrides = {
      smtpHost: body.smtpHost?.trim() || undefined,
      smtpPort: port,
      smtpUser: body.smtpUser?.trim() || undefined,
      // 密碼欄位留空＝不變更，沿用原本存的值（不管是後台設定過的，還是這次也還是空）
      smtpPass: body.smtpPass?.trim() ? body.smtpPass.trim() : current.smtpPass,
      smtpFrom: body.smtpFrom?.trim() || undefined,
      ccEmail: body.ccEmail?.trim() || undefined,
    };

    await writeMailSettings(next);
    return noStore(await publicView());
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE() {
  try {
    await resetMailSettings();
    return noStore(await publicView());
  } catch (err) {
    return serverError(err);
  }
}
