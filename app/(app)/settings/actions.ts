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

export async function resetAllDataAction(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    // Delete all transactions, bookings, and clients
    await db.transaction.deleteMany();
    await db.booking.deleteMany();
    await db.client.deleteMany();

    revalidatePath("/");
    revalidatePath("/bookings");
    revalidatePath("/wages");
    revalidatePath("/clients");
    revalidatePath("/calendar");
    revalidatePath("/settings");

    return { ok: true };
  } catch (err: unknown) {
    console.error("[resetAllDataAction]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reset database",
    };
  }
}