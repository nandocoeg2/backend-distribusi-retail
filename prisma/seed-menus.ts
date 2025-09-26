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

  await prisma.menu.upsert({
    where: { name: 'Users' },
    update: {},
    create: {
      name: 'Users',
      url: '/users',
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

  await prisma.menu.upsert({
    where: { name: 'Dimensi Kardus' },
    update: {},
    create: {
      name: 'Dimensi Kardus',
      url: '/master/dimensi-kardus',
      parentId: masterDataMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Term Of Payment' },
    update: {},
    create: {
      name: 'Term Of Payment',
      url: '/master/term-of-payment',
      parentId: masterDataMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Group Customer' },
    update: {},
    create: {
      name: 'Group Customer',
      url: '/master/group-customer',
      parentId: masterDataMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Regions' },
    update: {},
    create: {
      name: 'Regions',
      url: '/master/regions',
      parentId: masterDataMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Company' },
    update: {},
    create: {
      name: 'Company',
      url: '/master/company',
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
    where: { name: 'Invoice Pengiriman' },
    update: {},
    create: {
      name: 'Invoice Pengiriman',
      url: '/po/invoice-pengiriman',
      parentId: purchaseOrderMenu.id,
    },
  });

  await prisma.menu.upsert({
    where: { name: 'Invoice Penagihan' },
    update: {},
    create: {
      name: 'Invoice Penagihan',
      url: '/po/invoice-penagihan',
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

  await prisma.menu.upsert({
    where: { name: 'Laporan Penerimaan Barang' },
    update: {},
    create: {
      name: 'Laporan Penerimaan Barang',
      url: '/laporan-penerimaan-barang',
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

