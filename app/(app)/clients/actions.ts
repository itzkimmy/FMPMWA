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

  let newClientId: string | null = null;

  try {
    const client = await db.client.create({
      data: {
        name: parsed.data.name,
        contact: parsed.data.contact || null,
        source: parsed.data.source || null,
        notes: parsed.data.notes || null,
      },
    });
    newClientId = client.id;
    revalidatePath("/clients");
    revalidatePath("/");
  } catch (err) {
    console.error("[createClientAction]", err);
    return { ok: false, error: "Failed to create client" };
  }

  if (newClientId) {
    redirect(`/clients/${newClientId}`);
  }

  return { ok: true };
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

  let updated = false;

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
    updated = true;
    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    revalidatePath("/");
  } catch (err) {
    console.error("[updateClientAction]", err);
    return { ok: false, error: "Failed to update client" };
  }

  if (updated) {
    redirect(`/clients/${id}`);
  }

  return { ok: true };
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  let deleted = false;
  try {
    const bookingCount = await db.booking.count({ where: { clientId: id } });
    if (bookingCount > 0) {
      return {
        ok: false,
        error: `Cannot delete client with ${bookingCount} booking${bookingCount > 1 ? "s" : ""}. Delete or reassign bookings first.`,
      };
    }
    await db.client.delete({ where: { id } });
    deleted = true;
    revalidatePath("/clients");
    revalidatePath("/");
  } catch (err) {
    console.error("[deleteClientAction]", err);
    return { ok: false, error: "Failed to delete client" };
  }

  if (deleted) {
    redirect("/clients");
  }

  return { ok: true };
}