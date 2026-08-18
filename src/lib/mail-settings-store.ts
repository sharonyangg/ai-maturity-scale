import { readJson, writeJson } from "./kv-store";

/**
 * server-only：寄信帳密與副本收件人設定，跟 scoring/config-store.ts 分開存放，
 * 因為這裡面有密碼，不能跟公開給每個填答者瀏覽器讀取的 /api/config 放在一起。
 * 只有後台頁面（/admin）跟寄信 API（/api/send-report）會碰這份設定。
 *
 * 沒有覆寫值的欄位就照 .env.local（或部署平台的環境變數）的值；
 * 這樣後台沒動過設定時，原本用環境變數的寄信功能不會被打斷。
 * 底層儲存見 kv-store.ts（本機檔案／Upstash Redis 自動切換）。
 */
export interface MailSettingsOverrides {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  /** 每份報告額外加寄一份副本到這個信箱（例如基地承辦人信箱），不影響原本寄給填答者本人 */
  ccEmail?: string;
}

export interface EffectiveMailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  ccEmail: string;
}

const KEY = "mail-settings";

export async function readMailSettings(): Promise<MailSettingsOverrides> {
  return (await readJson<MailSettingsOverrides>(KEY)) ?? {};
}

export async function writeMailSettings(next: MailSettingsOverrides): Promise<void> {
  await writeJson(KEY, next);
}

export async function resetMailSettings(): Promise<void> {
  await writeMailSettings({});
}

export async function getEffectiveMailSettings(): Promise<EffectiveMailSettings> {
  const stored = await readMailSettings();
  return {
    smtpHost: stored.smtpHost || process.env.SMTP_HOST || "",
    smtpPort: stored.smtpPort || Number(process.env.SMTP_PORT ?? 587),
    smtpUser: stored.smtpUser || process.env.SMTP_USER || "",
    smtpPass: stored.smtpPass || process.env.SMTP_PASS || "",
    smtpFrom: stored.smtpFrom || process.env.SMTP_FROM || "",
    ccEmail: stored.ccEmail || "",
  };
}
