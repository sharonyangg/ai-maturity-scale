"use client";

import { useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * LINE、Facebook、Instagram、微信等 App 內建瀏覽器會把每個分頁的儲存空間（sessionStorage）
 * 和「下載檔案」行為都關在自己的沙盒裡：
 *   - 下載 Word 報告用的是 blob: 網址，這種網址只有建立它的那個瀏覽器分頁看得懂，
 *     App 內建瀏覽器想「跳轉到外部瀏覽器」開啟時，blob: 網址帶不過去，所以看起來像是
 *     跳轉失敗、什麼事都沒發生。
 *   - 就算使用者自己手動複製網址、貼到外部瀏覽器打開，那也是全新、獨立的分頁，
 *     跟 App 內建瀏覽器裡填寫問卷時存的 sessionStorage（公司資料、結尾兩題）完全無關，
 *     所以匯出的報告裡這兩塊會是空的——問卷分數本身沒事，因為分數是直接編碼在網址上的。
 * 這是 App 內建瀏覽器的沙盒限制，前端無法繞過，只能在使用者一開始進站時就提醒他們
 * 改用手機真正的瀏覽器打開，才能讓整個作答＋下載都在同一個瀏覽器環境裡完成。
 */
function detectInAppBrowser(userAgent: string): string | null {
  if (/\bLine\//i.test(userAgent)) return "LINE";
  if (/FBAN|FBAV/i.test(userAgent)) return "Facebook";
  if (/Instagram/i.test(userAgent)) return "Instagram";
  if (/MicroMessenger/i.test(userAgent)) return "微信";
  return null;
}

export function InAppBrowserBanner() {
  // 用 useSyncExternalStore 讀 navigator.userAgent：SSR 階段回傳 null（伺服器沒有
  // navigator），client hydrate 完成後立刻換成真正偵測到的結果，不會有 hydration mismatch，
  // 也不需要額外用 useEffect + setState 來做「只在 client 執行一次」這件事。
  const appName = useSyncExternalStore(
    noopSubscribe,
    () => detectInAppBrowser(navigator.userAgent),
    () => null
  );
  const [dismissed, setDismissed] = useState(false);

  if (!appName || dismissed) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
      <div className="mx-auto flex max-w-4xl items-start gap-3">
        <span className="mt-0.5 shrink-0">⚠️</span>
        <p className="flex-1 leading-relaxed">
          偵測到您正在用{appName}內建瀏覽器開啟本頁，可能造成填答與下載報告失敗，建議使用手機預設瀏覽器開啟(Safari/Chrome)。
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="關閉提醒"
          className="shrink-0 rounded-full px-2 text-amber-700 hover:bg-amber-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
