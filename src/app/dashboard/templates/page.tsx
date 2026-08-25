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
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-[#222222]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Automation templates</h1>
        <p className="text-sm text-zinc-400">
          Pre-built workflows to turn Instagram engagement into sales and leads in 1 click
        </p>
      </div>

      {/* Main Templates Library Client */}
      <TemplatesLibraryClient />
    </div>
  );
}
