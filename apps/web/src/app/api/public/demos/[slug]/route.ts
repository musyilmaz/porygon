import { AppError } from "@repo/shared";
import { NextResponse } from "next/server";

import { getPublicDemoService } from "@/lib/services/public-demo.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const demo = await getPublicDemoService().getBySlug(slug);
    return NextResponse.json(demo, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
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
