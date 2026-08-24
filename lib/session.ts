import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "flowmotion_session";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || "flowmotion-default-session-secret-key-32-chars";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export { SESSION_COOKIE };

export async function logout() {
  const { cookies } = await import("next/headers");
  const { redirect } = await import("next/navigation");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  cookieStore.set("studioledger_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  redirect("/login");
}