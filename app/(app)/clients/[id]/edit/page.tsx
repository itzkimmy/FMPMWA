export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
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
    <div className="max-w-xl space-y-5 animate-fade-in pb-10">
      <div>
        <Link href={`/clients/${id}`} className="text-xs text-slate-400 hover:text-amber-400 font-medium transition-colors mb-1 inline-block">
          ← Back to client
        </Link>
        <h1 className="font-header text-xl font-bold text-white">Edit Client</h1>
      </div>
      <ClientForm
        mode="edit"
        clientId={id}
        defaultValues={{
          name: client.name,
          contact: client.contact || "",
          source: client.source || "",
          notes: client.notes || "",
        }}
      />
    </div>
  );
}