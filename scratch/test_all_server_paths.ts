import { db } from "../src/lib/db";

async function testAll() {
  console.log("--- Starting Server Path Tests ---");

  const users = await db.user.findMany();
  console.log("Found users in DB:", users.length);
  for (const u of users) {
    console.log("Testing user:", u.email);

    const accounts = await db.igAccount.findMany({
      where: {
        userId: u.id,
        NOT: { pageName: "Instagram Account" },
      },
      select: {
        id: true,
        instagramAccountId: true,
        pageName: true,
        profilePictureUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("User accounts:", accounts.length);

    const activeAcc = accounts[0] || null;

    const automationsCount = await db.automation.count({
      where: {
        userId: u.id,
        ...(activeAcc ? { OR: [{ igAccountId: activeAcc.id }, { igAccountId: null }] } : {}),
      },
    });
    console.log("Automations count:", automationsCount);

    const capturedLeadsCount = await db.lead.count({
      where: {
        ...(activeAcc ? { igAccountId: activeAcc.id } : { igAccount: { userId: u.id } }),
      },
    });
    console.log("Leads count:", capturedLeadsCount);

    const totalLogsCount = await db.executionLog.count({
      where: {
        automation: {
          userId: u.id,
          ...(activeAcc ? { OR: [{ igAccountId: activeAcc.id }, { igAccountId: null }] } : {}),
        },
      },
    });
    console.log("Total logs count:", totalLogsCount);

    const deliveredLogsCount = await db.executionLog.count({
      where: {
        dmStatus: "SUCCESS",
        automation: {
          userId: u.id,
          ...(activeAcc ? { OR: [{ igAccountId: activeAcc.id }, { igAccountId: null }] } : {}),
        },
      },
    });
    console.log("Delivered logs count:", deliveredLogsCount);
  }

  console.log("--- ALL SERVER QUERIES PASSED WITH 0 ERRORS ---");
}

testAll().catch(e => {
  console.error("TEST FAILED WITH ERROR:", e);
});
