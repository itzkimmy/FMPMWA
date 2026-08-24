import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get(SESSION_COOKIE)?.value ||
    request.cookies.get("studioledger_session")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isValid = await verifySessionToken(sessionToken);
  if (!isValid) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.delete("studioledger_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
