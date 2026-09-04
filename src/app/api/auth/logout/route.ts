import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  return clearSessionCookie(NextResponse.json({ ok: true }));
}