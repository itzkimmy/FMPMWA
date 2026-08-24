"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { bookingSchema } from "@/lib/validation";
import { parseMoneyCents } from "@/lib/money";
import { manilaDateToUtc } from "@/lib/dates";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseAmountCents(input: string | undefined | null): number {
  if (!input || input.trim() === "") return 0;
  return parseMoneyCents(input) ?? 0;
}

export async function createBookingAction(
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation error";
    return { ok: false, error: firstError };
  }

  const {
    clientId,
    eventType,
    eventDate,
    location,
    feeInput,
    depositInput,
    status,
    deliveryStatus,
    notes,
  } = parsed.data;

  const feeCents = parseAmountCents(feeInput);
  const depositCents = parseAmountCents(depositInput);

  if (feeCents <= 0) {
    return { ok: false, error: "Fee must be greater than 0" };
  }

  let newBookingId: string | null = null;

  try {
    const booking = await db.booking.create({
      data: {
        clientId,
        eventType,
        eventDate: manilaDateToUtc(eventDate),
        location: location || null,
        feeCents,
        depositCents,
        status,
        deliveryStatus,
        notes: notes || null,
      },
    });
    newBookingId = booking.id;
    revalidatePath("/bookings");
    revalidatePath("/");
  } catch (err) {
    console.error("[createBookingAction]", err);
    return { ok: false, error: "Failed to save booking" };
  }

  if (newBookingId) {
    redirect(`/bookings/${newBookingId}`);
  }

  return { ok: true };
}

export async function updateBookingAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation error";
    return { ok: false, error: firstError };
  }

  const {
    clientId,
    eventType,
    eventDate,
    location,
    feeInput,
    depositInput,
    status,
    deliveryStatus,
    notes,
  } = parsed.data;

  const feeCents = parseAmountCents(feeInput);
  const depositCents = parseAmountCents(depositInput);

  if (feeCents <= 0) {
    return { ok: false, error: "Fee must be greater than 0" };
  }

  let updated = false;

  try {
    await db.booking.update({
      where: { id },
      data: {
        clientId,
        eventType,
        eventDate: manilaDateToUtc(eventDate),
        location: location || null,
        feeCents,
        depositCents,
        status,
        deliveryStatus,
        notes: notes || null,
      },
    });
    updated = true;
    revalidatePath(`/bookings/${id}`);
    revalidatePath("/bookings");
    revalidatePath("/");
  } catch (err) {
    console.error("[updateBookingAction]", err);
    return { ok: false, error: "Failed to update booking" };
  }

  if (updated) {
    redirect(`/bookings/${id}`);
  }

  return { ok: true };
}

export async function deleteBookingAction(id: string): Promise<ActionResult> {
  let deleted = false;
  try {
    await db.transaction.deleteMany({ where: { bookingId: id } });
    await db.booking.delete({ where: { id } });
    deleted = true;
    revalidatePath("/bookings");
    revalidatePath("/");
  } catch (err) {
    console.error("[deleteBookingAction]", err);
    return { ok: false, error: "Failed to delete booking" };
  }

  if (deleted) {
    redirect("/bookings");
  }

  return { ok: true };
}