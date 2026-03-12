import { AppError } from "@porygon/shared";
import { createWorkspaceSchema } from "@porygon/shared/validators";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getWorkspaceService } from "@/lib/services/workspace.service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const workspaceService = getWorkspaceService();
    const workspaces = await workspaceService.list(session.user.id);
    return NextResponse.json(workspaces);
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
    const workspaceService = getWorkspaceService();
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
