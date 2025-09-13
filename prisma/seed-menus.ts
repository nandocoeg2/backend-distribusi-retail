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

  // Create Purchase Order Management as parent with '#'
  const purchaseOrderMenu = await prisma.menu.upsert({
    where: { name: 'Purchase Order Management' },
    update: {},
    create: {
      name: 'Purchase Order Management',
      url: '#',
    },
  });

  // Children under Purchase Order Management
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


