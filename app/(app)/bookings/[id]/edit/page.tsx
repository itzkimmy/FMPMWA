export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EditBookingForm from "./EditBookingForm";

interface EditBookingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookingPage({ params }: EditBookingPageProps) {
  const { id } = await params;

  const [booking, clients] = await Promise.all([
    db.booking.findUnique({ where: { id }, include: { client: true } }),
    db.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!booking) notFound();

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h1 className="font-header text-xl font-semibold text-studio-text">
          Edit booking
        </h1>
        <p className="text-sm text-studio-text-muted mt-0.5">
          {booking.client.name} · {booking.eventType}
        </p>
      </div>
      <EditBookingForm booking={booking} clients={clients} />
    </div>
  );
}
