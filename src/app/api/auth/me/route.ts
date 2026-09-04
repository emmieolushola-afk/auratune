import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  return NextResponse.json({ user });
}