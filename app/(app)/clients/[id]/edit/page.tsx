export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ClientForm from "../../ClientForm";

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
  });

  if (!client) notFound();

  return (
    <div className="max-w-xl animate-fade-in pb-10">
      <div className="mb-6">
        <h1 className="font-header text-xl font-bold text-white tracking-tight">
          Edit Client
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Update contact details and notes</p>
      </div>
      <ClientForm client={client} />
    </div>
  );
}