import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import LeadsTable from "@/components/LeadsTable";
import { getActiveAccount } from "@/lib/activeAccount";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;
  const activeAccount = await getActiveAccount(userId);

  const leads = await db.lead.findMany({
    where: {
      ...(activeAccount
        ? { igAccountId: activeAccount.id }
        : { igAccount: { userId } }),
    },
    include: {
      automation: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Leads Table & Controls Manager */}
      <LeadsTable initialLeads={leads} />
    </div>
  );
}
