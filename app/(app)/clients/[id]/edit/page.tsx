import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ClientForm from "../../ClientForm";

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await db.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-6">
        <h1 className="font-header text-xl font-semibold text-studio-text">Edit client</h1>
        <p className="text-sm text-studio-text-muted mt-0.5">{client.name}</p>
      </div>
      <ClientForm client={client} />
    </div>
  );
}
