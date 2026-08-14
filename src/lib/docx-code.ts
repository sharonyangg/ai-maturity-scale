import JSZip from "jszip";
import { decodeAnswers } from "./answer-codec";
import type { Answers } from "./scoring/types";

/**
 * 匯出的 Word 報告裡會藏一行「系統比對代碼」，值就是該次結果連結的 code（answer-codec 編碼）。
 * 後測上傳前測報告時，從 docx 的 word/document.xml 純文字內容裡撈出這行代碼並還原成作答內容，
 * 藉此在沒有資料庫的情況下比對前後測——只要使用者沒把這行文字刪掉。
 */
export const PRETEST_MARKER = "PRETEST_CODE::";

export function pretestMarkerLine(code: string): string {
  return `系統比對代碼（後測上傳比對用，請勿刪除）：${PRETEST_MARKER}${code}`;
}

/** 從上傳的 .docx 檔案裡解析出前測作答內容；找不到代碼或格式不符則回傳 null */
export async function extractPretestAnswersFromDocx(file: File): Promise<Answers | null> {
  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const documentXml = await zip.file("word/document.xml")?.async("text");
    if (!documentXml) return null;

    const plainText = documentXml.replace(/<[^>]+>/g, "");
    const markerIndex = plainText.indexOf(PRETEST_MARKER);
    if (markerIndex === -1) return null;

    const codeMatch = plainText
      .slice(markerIndex + PRETEST_MARKER.length)
      .match(/^[A-Za-z0-9_-]+/);
    if (!codeMatch) return null;

    return decodeAnswers(codeMatch[0]);
  } catch {
    return null;
  }
}
