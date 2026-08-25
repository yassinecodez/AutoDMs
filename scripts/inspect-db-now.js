const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function inspect() {
  const accounts = await prisma.igAccount.findMany({
    include: { user: true }
  });
  console.log("ACCOUNTS IN DB RIGHT NOW:", JSON.stringify(accounts, null, 2));
}

inspect().catch(console.error).finally(() => prisma.$disconnect());
