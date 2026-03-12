import { AppError } from "@porygon/shared";
import { reorderStepsSchema } from "@porygon/shared/validators";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getStepService } from "@/lib/services/step.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ demoId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { demoId } = await params;
  const body = await request.json();
  const parsed = reorderStepsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await getStepService().reorder(demoId, parsed.data.stepIds, session.user.id);
    return NextResponse.json({ success: true });
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
