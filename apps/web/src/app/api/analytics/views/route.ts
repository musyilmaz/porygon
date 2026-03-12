import { AppError } from "@repo/shared";
import { recordViewSchema } from "@repo/shared/validators";
import { NextResponse } from "next/server";

import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getAnalyticsService } from "@/lib/services/analytics.service";

export async function POST(request: Request) {
  const { success, reset } = await checkRateLimit(request);
  if (!success) {
    return rateLimitResponse(reset);
  }

  const body = await request.json();
  const parsed = recordViewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const view = await getAnalyticsService().recordView(parsed.data);
    return NextResponse.json(view, { status: 201 });
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
