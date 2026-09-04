import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { hashPassword } from "@/lib/session";
import { attachSessionCookie, jsonError } from "@/lib/api";

export const runtime = "nodejs";

interface SignupBody {
  name?: string;
  email?: string;
  password?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: SignupBody;
  try {
    body = (await req.json()) as SignupBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (name.length < 2) return jsonError("Please enter your full name", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Please enter a valid email address", 400);
  }
  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters", 400);
  }
  if (db.findUserByEmail(email)) {
    return jsonError("An account with this email already exists", 409);
  }

  const { hash, salt } = hashPassword(password);
  const user = db.createUser({ email, name, passwordHash: hash, passwordSalt: salt });

  const res = NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name } },
    { status: 201 }
  );
  return attachSessionCookie(res, {
    id: user.id,
    email: user.email,
    name: user.name,
  });
}