import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  readSessionFromHeader,
  type SessionUser,
} from "@/lib/session";

export function getSessionUser(req: NextRequest): SessionUser | null {
  return readSessionFromHeader(req.headers.get("cookie"));
}

export function attachSessionCookie(
  res: NextResponse,
  user: SessionUser
): NextResponse {
  res.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}

export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function requireUser(req: NextRequest):
  | { user: SessionUser; res: null }
  | { user: null; res: NextResponse } {
  const user = getSessionUser(req);
  if (!user) {
    return {
      user: null,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, res: null };
}