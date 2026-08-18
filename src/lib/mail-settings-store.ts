import fs from "node:fs";
import path from "node:path";

/**
 * server-only：寄信帳密與副本收件人設定，跟 scoring/config-store.ts 分開存放，
 * 因為這裡面有密碼，不能跟公開給每個填答者瀏覽器讀取的 /api/config 放在一起。
 * 只有後台頁面（/admin）跟寄信 API（/api/send-report）會碰這個檔案。
 *
 * 沒有覆寫值的欄位就照 .env.local（或部署平台的環境變數）的值；
 * 這樣後台沒動過設定時，原本用環境變數的寄信功能不會被打斷。
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

const SETTINGS_PATH = path.join(process.cwd(), "data", "mail-settings.json");

export function readMailSettings(): MailSettingsOverrides {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf8");
    return JSON.parse(raw) as MailSettingsOverrides;
  } catch {
    return {};
  }
}

export function writeMailSettings(next: MailSettingsOverrides): void {
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2), "utf8");
}

export function resetMailSettings(): void {
  writeMailSettings({});
}

export function getEffectiveMailSettings(): EffectiveMailSettings {
  const stored = readMailSettings();
  return {
    smtpHost: stored.smtpHost || process.env.SMTP_HOST || "",
    smtpPort: stored.smtpPort || Number(process.env.SMTP_PORT ?? 587),
    smtpUser: stored.smtpUser || process.env.SMTP_USER || "",
    smtpPass: stored.smtpPass || process.env.SMTP_PASS || "",
    smtpFrom: stored.smtpFrom || process.env.SMTP_FROM || "",
    ccEmail: stored.ccEmail || "",
  };
}
