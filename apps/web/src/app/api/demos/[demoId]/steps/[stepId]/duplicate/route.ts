import { AppError } from "@porygon/shared";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getStepService } from "@/lib/services/step.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ demoId: string; stepId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stepId } = await params;

  try {
    const step = await getStepService().duplicate(stepId, session.user.id);
    return NextResponse.json(step, { status: 201 });
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
