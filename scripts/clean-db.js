const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clean() {
  const res = await prisma.igAccount.deleteMany();
  console.log("Deleted accounts:", res.count);
}

clean().catch(console.error).finally(() => prisma.$disconnect());
