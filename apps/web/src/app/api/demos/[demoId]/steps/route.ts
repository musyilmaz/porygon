import { AppError } from "@porygon/shared";
import { createStepBodySchema } from "@porygon/shared/validators";
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
  const parsed = createStepBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const step = await getStepService().create(
      { demoId, ...parsed.data },
      session.user.id,
    );
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ demoId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { demoId } = await params;

  try {
    const steps = await getStepService().list(demoId, session.user.id);
    return NextResponse.json(steps);
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
