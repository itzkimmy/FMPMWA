import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set("studioledger_session", "", { maxAge: 0, path: "/" });
  return response;
}

export async function POST(request: NextRequest) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set("studioledger_session", "", { maxAge: 0, path: "/" });
  return response;
}