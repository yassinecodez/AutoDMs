const path = require("path");
const { PrismaClient } = require(path.join(process.cwd(), "node_modules", "@prisma", "client"));
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      accounts: {
        select: {
          id: true,
          pageName: true,
          instagramAccountId: true,
          userId: true,
          createdAt: true
        }
      }
    }
  });

  console.log("All Users & Accounts in DB:", JSON.stringify(users, null, 2));

  const allAccounts = await prisma.igAccount.findMany({});
  console.log("All raw IgAccounts in DB:", JSON.stringify(allAccounts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
