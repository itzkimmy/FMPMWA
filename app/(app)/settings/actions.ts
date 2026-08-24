"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function saveSettings(
  data: Record<string, string>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    for (const [key, value] of Object.entries(data)) {
      await db.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    revalidatePath("/settings");
    revalidatePath("/");
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save settings",
    };
  }
}