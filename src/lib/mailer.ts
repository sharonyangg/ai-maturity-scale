import nodemailer from "nodemailer";
import { getEffectiveMailSettings } from "./mail-settings-store";

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendReportEmail(params: {
  to: string;
  subject: string;
  text: string;
  attachment: { filename: string; content: Buffer };
}): Promise<SendResult> {
  const settings = getEffectiveMailSettings();
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    return { ok: false, error: "SMTP 尚未設定（後台「寄信設定」或環境變數缺少主機／帳號／密碼）" };
  }

  const transport = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465, // 465 走 SSL；587/25 走 STARTTLS
    auth: { user: settings.smtpUser, pass: settings.smtpPass },
  });

  try {
    await transport.sendMail({
      from: settings.smtpFrom || settings.smtpUser,
      to: params.to,
      cc: settings.ccEmail || undefined,
      subject: params.subject,
      text: params.text,
      attachments: [params.attachment],
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "寄信失敗" };
  }
}
