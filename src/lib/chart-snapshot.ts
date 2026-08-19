import { svgElementToPngBytes, type PngSnapshot } from "./svg-to-png";

export function pngBytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * 從容器裡挑「面積最大」的 svg 轉成 PNG：加了圖例（Legend）後，容器內還會有一顆 recharts
 * 用來畫圖例色塊的迷你 svg，直接抓第一個常常抓錯。
 *
 * 供下載按鈕（圖表已經畫好，通常一次就抓到）與結果頁一進來就自動觸發的寄信流程
 * （圖表可能還沒 layout 完、寬高是 0）共用；後者需要輪詢等圖表長出實際尺寸。
 */
/** Recharts 的 <Radar> 進場動畫時間（見 DimensionRadarChart 的 animationDuration），
 * 抓圖前要等它跑完，不然雷達圖的面積／線還在從中心點長出來，抓到的會是幾乎全空、
 * 只剩座標軸格線跟一個中心點的圖。 */
const CHART_ANIMATION_MS = 900;

export async function captureLargestChartSvg(
  container: HTMLElement | null,
  opts: { attempts?: number; intervalMs?: number; minSize?: number } = {}
): Promise<PngSnapshot | null> {
  if (!container) return null;
  const attempts = opts.attempts ?? 15;
  const intervalMs = opts.intervalMs ?? 200;
  const minSize = opts.minSize ?? 100;

  for (let i = 0; i < attempts; i++) {
    const svgs = Array.from(container.querySelectorAll("svg"));
    const svg = svgs.sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0];
    if (svg && svg.clientWidth >= minSize && svg.clientHeight >= minSize) {
      await new Promise((resolve) => setTimeout(resolve, CHART_ANIMATION_MS + 150));
      return svgElementToPngBytes(svg);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}
