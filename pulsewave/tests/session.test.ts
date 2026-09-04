import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  createSessionToken,
  hashPassword,
  readSessionFromHeader,
  SESSION_COOKIE,
  verifyPassword,
  verifySessionToken,
} from "@/lib/session";

const user = { id: "u1", email: "a@b.com", name: "Alice" };

afterEach(() => {
  delete process.env.AUTH_SECRET;
});

describe("password hashing", () => {
  it("produces a unique salt per call", () => {
    const a = hashPassword("secret");
    const b = hashPassword("secret");
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });

  it("verifies correct passwords and rejects wrong ones", () => {
    const { hash, salt } = hashPassword("correct horse");
    expect(verifyPassword("correct horse", salt, hash)).toBe(true);
    expect(verifyPassword("wrong", salt, hash)).toBe(false);
    expect(verifyPassword("", salt, hash)).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a user through sign and verify", () => {
    const token = createSessionToken(user);
    const decoded = verifySessionToken(token);
    expect(decoded).toEqual(user);
  });

  it("rejects malformed tokens", () => {
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("no-dot")).toBeNull();
    expect(verifySessionToken("abc.def")).toBeNull();
  });

  it("rejects tampered signatures", () => {
    process.env.AUTH_SECRET = "test-secret";
    const token = createSessionToken(user);
    const [payload, sig] = token.split(".");
    const flipped = payload.slice(0, -1) + (payload.endsWith("A") ? "B" : "A");
    expect(verifySessionToken(`${flipped}.${sig}`)).toBeNull();
  });

  it("rejects tokens whose payload was modified", () => {
    process.env.AUTH_SECRET = "test-secret";
    const token = createSessionToken(user);
    const [, sig] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...user, id: "u2" })
    ).toString("base64url");
    expect(verifySessionToken(`${forged}.${sig}`)).toBeNull();
  });

  it("rejects expired tokens", () => {
    process.env.AUTH_SECRET = "test-secret";
    const expiredPayload = {
      ...user,
      exp: Date.now() - 1000,
    };
    const encoded = Buffer.from(JSON.stringify(expiredPayload)).toString(
      "base64url"
    );
    const sig = createHmac("sha256", process.env.AUTH_SECRET!)
      .update(encoded)
      .digest("hex");
    expect(verifySessionToken(`${encoded}.${sig}`)).toBeNull();
  });

  it("rejects tokens signed with a different secret", () => {
    process.env.AUTH_SECRET = "secret-a";
    const token = createSessionToken(user);
    process.env.AUTH_SECRET = "secret-b";
    expect(verifySessionToken(token)).toBeNull();
  });
});

describe("readSessionFromHeader", () => {
  it("reads a token out of a cookie header", () => {
    const token = createSessionToken(user);
    const header = `theme=dark; ${SESSION_COOKIE}=${token}; other=1`;
    expect(readSessionFromHeader(header)).toEqual(user);
  });

  it("returns null without a cookie header or matching cookie", () => {
    expect(readSessionFromHeader(null)).toBeNull();
    expect(readSessionFromHeader("theme=dark")).toBeNull();
  });

  it("returns null for an invalid token", () => {
    const header = `${SESSION_COOKIE}=junk.signature`;
    expect(readSessionFromHeader(header)).toBeNull();
  });
});