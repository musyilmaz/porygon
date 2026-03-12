import { AppError } from "@repo/shared";
import { updateAnnotationSchema } from "@repo/shared/validators";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getAnnotationService } from "@/lib/services/annotation.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ stepId: string; annotationId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { annotationId } = await params;
  const body = await request.json();
  const parsed = updateAnnotationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const annotation = await getAnnotationService().update(annotationId, parsed.data, session.user.id);
    return NextResponse.json(annotation);
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ stepId: string; annotationId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { annotationId } = await params;

  try {
    await getAnnotationService().delete(annotationId, session.user.id);
    return new NextResponse(null, { status: 204 });
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
