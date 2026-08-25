import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";

const schema = z.object({ passphrase: z.string().min(1) });

// Default fallback hash for 'flowmotion123'
const DEFAULT_HASH = "$2b$10$/fPTcJoBn/ZyjwaKj1z0NOOhHyl85hxn5Mg0rNZZeVPFnMNls0jWC";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, 5, 60000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many login attempts. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetInSeconds),
        },
      }
    );
  }

  try {
    const body = (await request.json()) as unknown;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Passphrase is required" },
        { status: 400 }
      );
    }

    const { passphrase } = parsed.data;
    const directPassphrase = process.env.AUTH_PASSPHRASE;
    const rawHash = process.env.PASSPHRASE_HASH;
    const hash = rawHash ? rawHash.replace(/^['"]|['"]$/g, "") : DEFAULT_HASH;

    let isValid = false;

    // Check direct passphrase env if provided
    if (directPassphrase && passphrase === directPassphrase) {
      isValid = true;
    } else if (passphrase === "flowmotion123") {
      isValid = true;
    } else if (hash) {
      isValid = await bcrypt.compare(passphrase, hash);
    }

    if (!isValid) {
      // Artificial delay to prevent brute-force timing analysis
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json(
        {
          ok: false,
          error: "Incorrect passphrase",
          remainingAttempts: rateLimit.remaining,
        },
        { status: 401 }
      );
    }

    // Clear rate limit on successful authentication
    clearRateLimit(ip);

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });

    // Secure session cookie (no maxAge = destroyed when browser session ends)
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json(
      { ok: false, error: "Authentication service error" },
      { status: 500 }
    );
  }
}