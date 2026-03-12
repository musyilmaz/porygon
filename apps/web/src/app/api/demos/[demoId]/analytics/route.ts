import { AppError } from "@repo/shared";
import { analyticsQuerySchema } from "@repo/shared/validators";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getAnalyticsService } from "@/lib/services/analytics.service";
import { getDemoService } from "@/lib/services/demo.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ demoId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { demoId } = await params;
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);
  const parsed = analyticsQuerySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { from, to, days } = parsed.data;
  let dateRange: { from: Date; to: Date } | undefined;
  if (from && to) {
    dateRange = { from, to };
  } else if (days) {
    const now = new Date();
    dateRange = { from: new Date(now.getTime() - days * 86_400_000), to: now };
  }

  try {
    await getDemoService().getById(demoId, session.user.id);
    const analytics = await getAnalyticsService().getDemoAnalytics(demoId, dateRange);
    return NextResponse.json(analytics);
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
