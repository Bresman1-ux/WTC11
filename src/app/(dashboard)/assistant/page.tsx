import { redirect } from "next/navigation";
import { listTransactions } from "@/lib/transactions/queries";
import { AssistantChat } from "@/components/assistant/assistant-chat";

export default async function AssistantPage() {
  const result = await listTransactions();
  if (!result.ok && result.error === "not_authenticated") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">AI Assistant</h1>
        <p className="text-sm text-zinc-500">Ask questions about your financial activity.</p>
      </div>

      <AssistantChat />
    </div>
  );
}
