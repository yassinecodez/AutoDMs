import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getActiveAccount } from "@/lib/activeAccount";
import SettingsHubClient from "@/components/SettingsHubClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;

  const [user, accounts, activeAccount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        planType: true,
        dmsLimit: true,
        dmsCountThisMonth: true,
        usageResetAt: true,
      },
    }),
    db.igAccount.findMany({
      where: {
        userId,
        NOT: { pageName: "Instagram Account" },
      },
      select: {
        id: true,
        instagramAccountId: true,
        pageName: true,
        profilePictureUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getActiveAccount(userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <SettingsHubClient
        user={user}
        accounts={accounts}
        activeAccountId={activeAccount?.id}
      />
    </div>
  );
}

