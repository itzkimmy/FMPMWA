import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const SETTING_KEYS = ["studioName", "ownerName", "defaultDepositPct", "paymentTermDays"] as const;
type SettingKey = (typeof SETTING_KEYS)[number];

async function upsertSetting(key: SettingKey, value: string) {
  await db.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string>;

    for (const key of SETTING_KEYS) {
      if (body[key] !== undefined) {
        await upsertSetting(key, String(body[key]));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/settings]", err);
    return NextResponse.json({ ok: false, error: "Failed to save settings" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await db.settings.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ ok: true, data: settings });
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
