const path = require("path");
const { PrismaClient } = require(path.join(process.cwd(), "node_modules", "@prisma", "client"));
const prisma = new PrismaClient();

async function main() {
  console.log("Checking current accounts in DB...");
  const accounts = await prisma.igAccount.findMany({
    select: {
      id: true,
      userId: true,
      pageName: true,
      instagramAccountId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" }
  });

  console.log("Accounts in DB:", JSON.stringify(accounts, null, 2));

  // Find placeholder accounts (starting with ig_ or named Instagram Account)
  const placeholders = accounts.filter(
    (a) => a.pageName === "Instagram Account" || a.pageName.startsWith("ig_") || a.pageName.startsWith("IG_")
  );

  if (placeholders.length > 0) {
    console.log(`Found ${placeholders.length} placeholder accounts. Cleaning up...`);
    const placeholderIds = placeholders.map((p) => p.id);
    
    // Check if there are real accounts to migrate to
    const realAccounts = accounts.filter(
      (a) => a.pageName !== "Instagram Account" && !a.pageName.startsWith("ig_") && !a.pageName.startsWith("IG_")
    );

    if (realAccounts.length > 0) {
      const primary = realAccounts[0];
      console.log(`Migrating automations and leads to real account: ${primary.id} (@${primary.pageName})`);
      await prisma.automation.updateMany({
        where: { igAccountId: { in: placeholderIds } },
        data: { igAccountId: primary.id }
      });
      await prisma.lead.updateMany({
        where: { igAccountId: { in: placeholderIds } },
        data: { igAccountId: primary.id }
      });
    }

    const deleted = await prisma.igAccount.deleteMany({
      where: { id: { in: placeholderIds } }
    });
    console.log(`Deleted ${deleted.count} placeholder account(s).`);
  } else {
    console.log("No placeholder accounts found.");
  }

  const remaining = await prisma.igAccount.findMany({
    select: { id: true, userId: true, pageName: true, instagramAccountId: true }
  });
  console.log("Remaining accounts in DB:", JSON.stringify(remaining, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
