import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TemplatesLibraryClient from "@/components/TemplatesLibraryClient";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-[#222222]">
        <h1 className="text-2xl font-bold tracking-tight text-white">Automation Templates</h1>
        <p className="text-sm text-zinc-400">
          Pre-built workflows to turn Instagram engagement into sales and leads in 1 click
        </p>
      </div>

      {/* Main Templates Library Client */}
      <TemplatesLibraryClient />
    </div>
  );
}
