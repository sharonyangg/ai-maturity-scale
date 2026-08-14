import type { Answers } from "./scoring/types";

function encodeJson(value: unknown): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeJson<T>(code: string): T | null {
  try {
    const base64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function encodeAnswers(answers: Answers): string {
  return encodeJson(answers);
}

export function decodeAnswers(code: string): Answers | null {
  return decodeJson<Answers>(code);
}

export interface PostResultPayload {
  answers: Answers;
  prevAnswers: Answers;
}

/** 後測結果連結：把本次作答與解析出的前測作答一起編碼，讓結果頁不需重新上傳檔案也能重現比較畫面 */
export function encodePostResult(payload: PostResultPayload): string {
  return encodeJson({ a: payload.answers, p: payload.prevAnswers });
}

export function decodePostResult(code: string): PostResultPayload | null {
  const decoded = decodeJson<{ a: Answers; p: Answers }>(code);
  if (!decoded) return null;
  return { answers: decoded.a, prevAnswers: decoded.p };
}
