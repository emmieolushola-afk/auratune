import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const PROTECTED = ["/home", "/search", "/listen", "/library", "/profile", "/pricing", "/album", "/artist"];
const AUTH_ONLY = ["/login"];

function matches(prefixes: string[], pathname: string): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? verifySessionToken(token) : null;

  const needsAuth = matches(PROTECTED, pathname);
  const isAuthPage = matches(AUTH_ONLY, pathname);

  if (needsAuth && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/home/:path*",
    "/search/:path*",
    "/listen/:path*",
    "/library/:path*",
    "/profile",
    "/pricing",
    "/album/:path*",
    "/artist/:path*",
  ],
};