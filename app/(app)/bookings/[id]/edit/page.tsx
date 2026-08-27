export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { toManilaDateString } from "@/lib/dates";
import EditBookingForm from "./EditBookingForm";

interface EditBookingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookingPage({ params }: EditBookingPageProps) {
  const { id } = await params;

  const [booking, clients] = await Promise.all([
    db.booking.findUnique({ where: { id }, include: { client: true } }),
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!booking) notFound();

  const bookingData = {
    id: booking.id,
    clientName: booking.client.name,
    eventType: booking.eventType,
    eventDate: toManilaDateString(booking.eventDate),
    location: booking.location || "",
    feeDisplay: (booking.feeCents / 100).toString(),
    depositDisplay: (booking.depositCents / 100).toString(),
    status: booking.status,
    deliveryStatus: booking.deliveryStatus,
    notes: booking.notes || "",
  };

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in pb-10">
      <div>
        <Link href={`/bookings/${id}`} className="text-xs text-slate-400 hover:text-amber-400 font-medium transition-colors mb-1 inline-block">
          ← Back to booking
        </Link>
        <h1 className="font-header text-xl font-bold text-white">
          Edit Booking
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {booking.client.name} · {booking.eventType}
        </p>
      </div>
      <EditBookingForm booking={bookingData} clients={clients} />
    </div>
  );
}