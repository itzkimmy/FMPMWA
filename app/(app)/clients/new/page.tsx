export const dynamic = "force-dynamic";

import ClientForm from "../ClientForm";

export default async function NewClientPage() {
  return (
    <div className="max-w-xl animate-fade-in pb-10">
      <div className="mb-6">
        <h1 className="font-header text-xl font-bold text-white tracking-tight">New Client</h1>
        <p className="text-xs text-slate-400 mt-0.5">Add a new client to your roster</p>
      </div>
      <ClientForm />
    </div>
  );
}