import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create or update Role Management (independent menu)
  await prisma.menu.upsert({
    where: { name: 'Role Management' },
    update: {},
    create: {
      name: 'Role Management',
      url: '/role-management',
    },
  });

  // Create Master Data as parent with '#'
  const masterDataMenu = await prisma.menu.upsert({
    where: { name: 'Master Data' },
    update: {},
    create: {
      name: 'Master Data',
      url: '#',
    },
  });

  // Children under Master Data
  await prisma.menu.upsert({
    where: { name: 'Customers' },
    update: {},
    create: {
      name: 'Customers',
      url: '/master/customers',
      parentId: masterDataMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Suppliers' },
    update: {},
    create: {
      name: 'Suppliers',
      url: '/master/suppliers',
      parentId: masterDataMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Inventories' },
    update: {},
    create: {
      name: 'Inventories',
      url: '/master/inventories',
      parentId: masterDataMenu.id,
    },
  });

  // Ensure any parent with children has url '#'
  const parentsWithChildren = await prisma.menu.findMany({
    where: { children: { some: {} } },
    select: { id: true },
  });

  for (const parent of parentsWithChildren) {
    await prisma.menu.update({
      where: { id: parent.id },
      data: { url: '#' },
    });
  }

  console.log('Seed menus selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


