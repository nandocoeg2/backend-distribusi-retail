import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.menu.upsert({
    where: { name: 'Dashboard' },
    update: {},
    create: {
      name: 'Dashboard',
      url: '/dashboard',
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Role Management' },
    update: {},
    create: {
      name: 'Role Management',
      url: '/role-management',
    },
  });

  const masterDataMenu = await prisma.menu.upsert({
    where: { name: 'Master Data' },
    update: {},
    create: {
      name: 'Master Data',
      url: '#',
    },
  });

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

  const purchaseOrderMenu = await prisma.menu.upsert({
    where: { name: 'Purchase Order Management' },
    update: {},
    create: {
      name: 'Purchase Order Management',
      url: '#',
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Purchase Order' },
    update: {},
    create: {
      name: 'Purchase Order',
      url: '/po/purchase-orders',
      parentId: purchaseOrderMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Surat Jalan' },
    update: {},
    create: {
      name: 'Surat Jalan',
      url: '/po/surat-jalan',
      parentId: purchaseOrderMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Invoices' },
    update: {},
    create: {
      name: 'Invoices',
      url: '/po/invoices',
      parentId: purchaseOrderMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'History Purchase Order' },
    update: {},
    create: {
      name: 'History Purchase Order',
      url: '/po/purchase-orders-history',
      parentId: purchaseOrderMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Packing' },
    update: {},
    create: {
      name: 'Packing',
      url: '/po/packings',
      parentId: purchaseOrderMenu.id,
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


