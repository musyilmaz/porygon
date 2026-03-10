import { getDb } from "@repo/db";
import { createWorkspaceService } from "@repo/services";
import { AppError } from "@repo/shared";
import { createWorkspaceSchema } from "@repo/shared/validators";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const workspaceService = createWorkspaceService({ db: getDb() });
    const workspace = await workspaceService.create(parsed.data, session.user.id);
    return NextResponse.json(workspace, { status: 201 });
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
