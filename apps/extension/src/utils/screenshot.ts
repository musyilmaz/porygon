const WEBP_QUALITY = 0.8;

export async function captureScreenshot(): Promise<string> {
  const dataUrl = await browser.tabs.captureVisibleTab({
    format: "png",
  });

  return convertToWebP(dataUrl);
}

async function convertToWebP(pngDataUrl: string): Promise<string> {
  const response = await fetch(pngDataUrl);
  const pngBlob = await response.blob();
  const bitmap = await createImageBitmap(pngBlob);

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get OffscreenCanvas 2d context");
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const webpBlob = await canvas.convertToBlob({
    type: "image/webp",
    quality: WEBP_QUALITY,
  });

  return blobToDataUrl(webpBlob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read blob as data URL"));
    reader.readAsDataURL(blob);
  });
}
