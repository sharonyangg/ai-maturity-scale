export interface PngSnapshot {
  bytes: Uint8Array;
  width: number;
  height: number;
}

export async function svgElementToPngBytes(
  svg: SVGSVGElement,
  options?: { scale?: number; backgroundColor?: string }
): Promise<PngSnapshot> {
  const scale = options?.scale ?? 2;
  const backgroundColor = options?.backgroundColor ?? "#ffffff";

  const width = svg.clientWidth || Number(svg.getAttribute("width")) || 600;
  const height = svg.clientHeight || Number(svg.getAttribute("height")) || 400;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("SVG 轉圖片失敗"));
      img.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("無法建立 canvas context");
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("canvas 轉 PNG 失敗");
    // width/height 要回傳畫布的實際像素尺寸（canvas.width/height，已經乘上 scale），
    // 不能回傳 svg 原本的 CSS 尺寸，否則後續 docx 裡用來計算圖片顯示大小的
    // fitWithinBox 會拿到跟實際圖片像素對不起來的來源尺寸。
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
