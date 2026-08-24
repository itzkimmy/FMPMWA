import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

const schema = z.object({ passphrase: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Passphrase is required" },
        { status: 400 }
      );
    }

    const { passphrase } = parsed.data;
    const rawHash = process.env.PASSPHRASE_HASH;
    const hash = rawHash ? rawHash.replace(/^['"]|['"]$/g, "") : undefined;

    if (!hash) {
      // First-run: no hash configured — instruct user to set it up
      return NextResponse.json(
        {
          ok: false,
          error:
            "No passphrase configured. Set PASSPHRASE_HASH in your environment variables. Run: node scripts/hash-passphrase.mjs 'your passphrase'",
        },
        { status: 503 }
      );
    }

    const isValid = await bcrypt.compare(passphrase, hash);

    if (!isValid) {
      // Constant-time delay to prevent timing attacks
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json(
        { ok: false, error: "Incorrect passphrase" },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
