import { readJson, writeJson } from "./kv-store";

/**
 * server-only：後台（/admin）的鎖定密碼，全站共用一組。
 * 沒改過就用預設密碼；改過之後存在跟 mail-settings 一樣的底層儲存
 * （本機檔案／Upstash Redis 自動切換，見 kv-store.ts）。
 */
export interface AdminAuthOverrides {
  password?: string;
}

const KEY = "admin-auth";
export const DEFAULT_ADMIN_PASSWORD = "88888888";

export async function getAdminPassword(): Promise<string> {
  const stored = await readJson<AdminAuthOverrides>(KEY);
  return stored?.password?.trim() || DEFAULT_ADMIN_PASSWORD;
}

export async function setAdminPassword(password: string): Promise<void> {
  await writeJson<AdminAuthOverrides>(KEY, { password });
}
