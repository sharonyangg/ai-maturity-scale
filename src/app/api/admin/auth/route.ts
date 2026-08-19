import { NextResponse } from "next/server";
import { getAdminPassword, setAdminPassword } from "@/lib/admin-auth-store";

// 要用 fs 讀寫本機檔案，不能跑在 edge runtime。
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...init?.headers, "Cache-Control": "no-store" },
  });
}

function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return noStore({ ok: false, error: message }, { status: 500 });
}

interface VerifyBody {
  password?: string;
}

/** 驗證密碼（後台頁面的登入鎖） */
export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return noStore({ ok: false, error: "請求格式錯誤" }, { status: 400 });
  }

  try {
    const correct = await getAdminPassword();
    if (!body.password || body.password !== correct) {
      return noStore({ ok: false, error: "密碼錯誤" }, { status: 401 });
    }
    return noStore({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

/** 修改密碼，需要先輸入目前的密碼 */
export async function PUT(request: Request) {
  let body: ChangePasswordBody;
  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return noStore({ ok: false, error: "請求格式錯誤" }, { status: 400 });
  }

  const newPassword = body.newPassword?.trim() ?? "";
  if (newPassword.length < 4) {
    return noStore({ ok: false, error: "新密碼長度至少要 4 碼" }, { status: 400 });
  }

  try {
    const correct = await getAdminPassword();
    if (!body.currentPassword || body.currentPassword !== correct) {
      return noStore({ ok: false, error: "目前密碼不正確" }, { status: 401 });
    }
    await setAdminPassword(newPassword);
    return noStore({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
