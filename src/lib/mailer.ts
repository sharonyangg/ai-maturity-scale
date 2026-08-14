import nodemailer from "nodemailer";

export type SendResult = { ok: true } | { ok: false; error: string };

/**
 * 用 SMTP 寄信，設定全部來自環境變數，不寫死任何服務商：
 * SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM（見 .env.local.example）。
 * 三個必要變數（HOST/USER/PASS）沒設定時視為「寄信功能尚未啟用」，回傳明確錯誤而不是丟例外，
 * 讓呼叫端（結果頁的自動寄信）可以安靜地略過，不影響使用者看報告。
 */
function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 走 SSL；587/25 走 STARTTLS
    auth: { user, pass },
  });
}

export async function sendReportEmail(params: {
  to: string;
  subject: string;
  text: string;
  attachment: { filename: string; content: Buffer };
}): Promise<SendResult> {
  const transport = getTransport();
  if (!transport) {
    return { ok: false, error: "SMTP 尚未設定（缺少 SMTP_HOST / SMTP_USER / SMTP_PASS 環境變數）" };
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: params.to,
      subject: params.subject,
      text: params.text,
      attachments: [params.attachment],
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "寄信失敗" };
  }
}
