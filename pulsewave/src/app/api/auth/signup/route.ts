import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { hashPassword } from "@/lib/session";
import { attachSessionCookie, jsonError } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  const supabase = getSupabaseServerClient();
  if (supabase) {
    // Supabase mode: delegate to Supabase Auth (handle_new_user trigger creates
    // the profile). Email existence is checked by Auth itself.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) {
      return jsonError(error.message, error.status === 422 ? 409 : 400);
    }
    if (!data.user) return jsonError("Failed to create account", 500);
    const user = { id: data.user.id, email, name };
    const res = NextResponse.json({ user }, { status: 201 });
    return attachSessionCookie(res, user);
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
