import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { requireUser } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const history = db.getHistory(user.id);
  return NextResponse.json({ history });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  db.clearHistory(user.id);
  return NextResponse.json({ ok: true });
}