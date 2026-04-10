export const ALLOWED_CONTENT_TYPES = [
  "image/webp",
  "image/png",
  "video/webm",
] as const;
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

export function maxSizeForContentType(contentType: string): number {
  return contentType.startsWith("video/")
    ? MAX_VIDEO_UPLOAD_SIZE_BYTES
    : MAX_UPLOAD_SIZE_BYTES;
}
