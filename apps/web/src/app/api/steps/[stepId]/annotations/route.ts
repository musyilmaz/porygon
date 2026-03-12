import { AppError } from "@repo/shared";
import { createAnnotationBodySchema } from "@repo/shared/validators";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getAnnotationService } from "@/lib/services/annotation.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ stepId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stepId } = await params;
  const body = await request.json();
  const parsed = createAnnotationBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const annotation = await getAnnotationService().create(
      { stepId, ...parsed.data },
      session.user.id,
    );
    return NextResponse.json(annotation, { status: 201 });
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
  { params }: { params: Promise<{ stepId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stepId } = await params;

  try {
    const annotations = await getAnnotationService().listByStep(stepId, session.user.id);
    return NextResponse.json(annotations);
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
