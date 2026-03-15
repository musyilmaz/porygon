import { ALLOWED_CONTENT_TYPES, AppError } from "@porygon/shared";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getDemoService } from "@/lib/services/demo.service";
import { getStepService } from "@/lib/services/step.service";
import { getUploadService } from "@/lib/services/upload.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ demoId: string; stepId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { demoId, stepId } = await params;
  const userId = session.user.id;

  const contentType = request.headers.get("content-type") ?? "";
  if (
    !ALLOWED_CONTENT_TYPES.includes(
      contentType as (typeof ALLOWED_CONTENT_TYPES)[number],
    )
  ) {
    return NextResponse.json(
      { error: `Invalid content type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const demo = await getDemoService().getById(demoId, userId);

    const uploadService = getUploadService();
    const { uploadUrl, publicUrl } = await uploadService.generateUploadUrl(
      { workspaceId: demo.workspaceId, demoId, stepId, contentType },
      userId,
    );

    // Upload to R2 server-side
    const body = await request.arrayBuffer();
    const r2Res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body,
    });
    if (!r2Res.ok) {
      return NextResponse.json(
        { error: "Failed to upload to storage" },
        { status: 502 },
      );
    }

    // Update step with screenshot URL
    const step = await getStepService().update(
      stepId,
      { screenshotUrl: publicUrl },
      userId,
    );

    return NextResponse.json(step);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
