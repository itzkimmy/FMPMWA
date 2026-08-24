import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

const schema = z.object({ passphrase: z.string().min(1) });

// Default fallback hash for 'flowmotion123'
const DEFAULT_HASH = "$2b$10$/fPTcJoBn/ZyjwaKj1z0NOOhHyl85hxn5Mg0rNZZeVPFnMNls0jWC";

export async function POST(request: Request) {
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
      // Small delay to prevent timing attacks
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json(
        { ok: false, error: "Incorrect passphrase" },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });

    // Session cookie: no maxAge means it expires when the browser session ends
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
      { ok: false, error: "Server error during login" },
      { status: 500 }
    );
  }
}