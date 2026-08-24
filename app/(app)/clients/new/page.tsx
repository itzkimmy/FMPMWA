import ClientForm from "../ClientForm";

export default async function NewClientPage() {
  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-6">
        <h1 className="font-header text-xl font-semibold text-studio-text">New client</h1>
        <p className="text-sm text-studio-text-muted mt-0.5">Add a new client to your roster</p>
      </div>
      <ClientForm />
    </div>
  );
}
