const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'd.robbani18@gmail.com' },
    data: { email_verified: true },
  });
  console.log('User verified successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
