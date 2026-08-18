import fs from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";

/**
 * server-only：後台設定（題目/權重、寄信設定）的底層讀寫。
 *
 * 本機開發、或部署到有持久化檔案系統的傳統主機：沒設定 Redis 環境變數時，
 * 退回寫本機檔案（跟一開始的做法一樣）。
 *
 * 部署到 Vercel 這類無伺服器平台：檔案系統在正式環境是唯讀的、各執行個體
 * 互相獨立，寫檔案不會讓其他人看到最新設定。設定好 Upstash Redis 的環境變數
 * （Vercel 專案 → Storage → 建立 Upstash 整合，會自動把變數加進專案）後，
 * 這裡會自動改用 Redis，全站共用同一份設定，不需要再改任何其他程式碼。
 *
 * 同時支援 Vercel KV 舊命名（KV_REST_API_URL / KV_REST_API_TOKEN）與
 * Upstash 原生命名（UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN），
 * 兩者擇一設定即可。
 */

function getRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function filePathFor(key: string): string {
  return path.join(process.cwd(), "data", `${key}.json`);
}

export async function readJson<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const value = await redis.get<T>(key);
      return value ?? null;
    } catch (err) {
      throw new Error(`Redis 讀取失敗（請確認 KV_REST_API_URL / KV_REST_API_TOKEN 是否正確）：${errMsg(err)}`);
    }
  }

  try {
    const raw = fs.readFileSync(filePathFor(key), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(key, value);
      return;
    } catch (err) {
      throw new Error(`Redis 寫入失敗（請確認 KV_REST_API_URL / KV_REST_API_TOKEN 是否正確）：${errMsg(err)}`);
    }
  }

  try {
    const target = filePathFor(key);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(value, null, 2), "utf8");
  } catch (err) {
    throw new Error(
      `本機檔案系統無法寫入設定檔（若此環境是 Vercel，代表尚未設定好 Upstash Redis 環境變數，Vercel 的檔案系統無法直接寫入；請完成 Redis 設定後重新部署）：${errMsg(err)}`
    );
  }
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
