import { NextResponse } from "next/server";

import { getStorageService } from "@/lib/services/upload.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const storageKey = key.join("/");

  try {
    const file = await getStorageService().getFile(storageKey);
    return new Response(Buffer.from(file.bytes), {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
