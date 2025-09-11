import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super admin' },
    update: {},
    create: {
      name: 'super admin',
      description: 'Super Administrator',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular User',
    },
  });

  console.log('Seed roles selesai.');
  console.log('Roles created:', {
    superAdmin: superAdminRole.name,
    admin: adminRole.name,
    user: userRole.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
