import { AppError } from "@repo/shared";
import { addMemberSchema } from "@repo/shared/validators";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/get-session";
import { getWorkspaceService } from "@/lib/services/workspace.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  try {
    const members = await getWorkspaceService().listMembers(workspaceId, session.user.id);
    return NextResponse.json(members);
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;
  const body = await request.json();
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const member = await getWorkspaceService().addMember(
      workspaceId,
      parsed.data.userId,
      parsed.data.role,
      session.user.id,
    );
    return NextResponse.json(member, { status: 201 });
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
