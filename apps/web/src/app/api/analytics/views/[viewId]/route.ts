import { AppError } from "@repo/shared";
import { updateViewSchema } from "@repo/shared/validators";
import { NextResponse } from "next/server";

import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getAnalyticsService } from "@/lib/services/analytics.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ viewId: string }> },
) {
  const { success, reset } = await checkRateLimit(request);
  if (!success) {
    return rateLimitResponse(reset);
  }

  const { viewId } = await params;
  const body = await request.json();
  const parsed = updateViewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const view = await getAnalyticsService().updateView(viewId, parsed.data);
    return NextResponse.json(view);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    throw error;
  }
}
