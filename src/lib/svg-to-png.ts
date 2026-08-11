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
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
