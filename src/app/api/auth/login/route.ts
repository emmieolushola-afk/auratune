import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { verifyPassword } from "@/lib/session";
import { attachSessionCookie, jsonError } from "@/lib/api";

export const runtime = "nodejs";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  const user = db.findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return jsonError("Invalid email or password", 401);
  }

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
  return attachSessionCookie(res, {
    id: user.id,
    email: user.email,
    name: user.name,
  });
}