import { AppError } from "@repo/shared";
import { updateDemoSchema } from "@repo/shared/validators";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getDemoService } from "@/lib/services/demo.service";

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
    const demo = await getDemoService().getById(demoId, session.user.id);
    return NextResponse.json(demo);
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ demoId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { demoId } = await params;
  const body = await request.json();
  const parsed = updateDemoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const demo = await getDemoService().update(demoId, parsed.data, session.user.id);
    return NextResponse.json(demo);
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
  { params }: { params: Promise<{ demoId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { demoId } = await params;

  try {
    await getDemoService().delete(demoId, session.user.id);
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
