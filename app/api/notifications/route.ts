import { NextResponse } from "next/server";
import { getStudioNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notifications = await getStudioNotifications();
    return NextResponse.json({ ok: true, notifications });
  } catch (err: unknown) {
    console.error("[api/notifications]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to load notifications" },
      { status: 500 }
    );
  }
}