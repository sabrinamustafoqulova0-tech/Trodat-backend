const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = ['5274', '54110', '54140'];
  for (const art of articles) {
    const stamp = await prisma.stamp.findUnique({
      where: { article: art }
    });
    console.log(`Article: ${art} | DB Data:`, stamp ? { name: stamp.name, imageMain: stamp.imageMain } : 'NOT FOUND');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
