import {
  randomBytes,
  scryptSync,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

interface SessionPayload extends SessionUser {
  exp: number;
}

const DEV_SECRET = "pulsewave-dev-secret-do-not-use-in-production";

function secret(): string {
  return process.env.AUTH_SECRET || DEV_SECRET;
}

export const SESSION_COOKIE = "pw_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): {
  hash: string;
  salt: string;
} {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string
): boolean {
  const hash = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("hex");
}

export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const encoded = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!payload.id || !payload.email || !payload.exp) return null;
    if (payload.exp < Date.now()) return null;
    return { id: payload.id, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export function readSessionFromHeader(cookieHeader: string | null): SessionUser | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(";").map((c) => c.trim()).find((c) =>
    c.startsWith(`${SESSION_COOKIE}=`)
  );
  if (!match) return null;
  const token = match.slice(SESSION_COOKIE.length + 1);
  return verifySessionToken(token);
}

export function publicUser(user: SessionUser) {
  return { id: user.id, email: user.email, name: user.name };
}