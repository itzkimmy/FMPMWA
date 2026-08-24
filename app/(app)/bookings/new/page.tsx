import { db } from "@/lib/db";
import NewBookingForm from "./NewBookingForm";

interface NewBookingPageProps {
  searchParams: Promise<{
    eventType?: string;
    suggestedDate?: string;
    location?: string;
    clientName?: string;
  }>;
}

export default async function NewBookingPage({ searchParams }: NewBookingPageProps) {
  const params = await searchParams;
  const clients = await db.client.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h1 className="font-header text-xl font-semibold text-studio-text">
          New booking
        </h1>
        <p className="text-sm text-studio-text-muted mt-0.5">
          Add a new shoot to your schedule
        </p>
      </div>
      <NewBookingForm
        clients={clients}
        prefilledData={{
          eventType: params.eventType,
          suggestedDate: params.suggestedDate,
          location: params.location,
          clientName: params.clientName,
        }}
      />
    </div>
  );
}
