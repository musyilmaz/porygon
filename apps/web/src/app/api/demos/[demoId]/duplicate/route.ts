import { AppError } from "@porygon/shared";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getDemoService } from "@/lib/services/demo.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ demoId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { demoId } = await params;

  try {
    const demo = await getDemoService().duplicate(demoId, session.user.id);
    return NextResponse.json(demo, { status: 201 });
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
