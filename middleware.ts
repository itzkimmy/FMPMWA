import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public authentication routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static Next.js assets and favicons
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.endsWith(".ico")) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get(SESSION_COOKIE)?.value ||
    request.cookies.get("studioledger_session")?.value;

  if (!sessionToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isValid = await verifySessionToken(sessionToken);
  if (!isValid) {
    if (pathname.startsWith("/api/")) {
      const apiResponse = NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
      apiResponse.cookies.delete(SESSION_COOKIE);
      apiResponse.cookies.delete("studioledger_session");
      return apiResponse;
    }

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