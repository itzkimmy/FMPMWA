"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clientSchema } from "@/lib/validation";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createClientAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = clientSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  try {
    const client = await db.client.create({
      data: {
        name: parsed.data.name,
        contact: parsed.data.contact || null,
        source: parsed.data.source || null,
        notes: parsed.data.notes || null,
      },
    });
    revalidatePath("/clients");
    redirect(`/clients/${client.id}`);
  } catch {
    return { ok: false, error: "Failed to create client" };
  }
}

export async function updateClientAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = clientSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  try {
    await db.client.update({
      where: { id },
      data: {
        name: parsed.data.name,
        contact: parsed.data.contact || null,
        source: parsed.data.source || null,
        notes: parsed.data.notes || null,
      },
    });
    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    redirect(`/clients/${id}`);
  } catch {
    return { ok: false, error: "Failed to update client" };
  }
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  try {
    // Check if client has bookings
    const bookingCount = await db.booking.count({ where: { clientId: id } });
    if (bookingCount > 0) {
      return {
        ok: false,
        error: `Cannot delete client with ${bookingCount} booking${bookingCount > 1 ? "s" : ""}. Delete or reassign bookings first.`,
      };
    }
    await db.client.delete({ where: { id } });
    revalidatePath("/clients");
  } catch {
    return { ok: false, error: "Failed to delete client" };
  }
  redirect("/clients");
}
