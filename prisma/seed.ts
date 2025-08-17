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

  // Create menus
  const profileMenu = await prisma.menu.upsert({
    where: { name: 'Profile' },
    update: {},
    create: {
      name: 'Profile',
      url: '/profile',
    },
  });

  const settingProfileMenu = await prisma.menu.upsert({
    where: { name: 'Setting Profile' },
    update: {},
    create: {
      name: 'Setting Profile',
      url: '/profile/setting',
      parentId: profileMenu.id,
    },
  });

  const invoiceMenu = await prisma.menu.upsert({
    where: { name: 'Invoice' },
    update: {},
    create: {
      name: 'Invoice',
      url: '/invoice',
    },
  });

  const invoicePengirimanMenu = await prisma.menu.upsert({
    where: { name: 'Invoice Pengiriman' },
    update: {},
    create: {
      name: 'Invoice Pengiriman',
      url: '/invoice/pengiriman',
      parentId: invoiceMenu.id,
    },
  });

  const invoicePenagihanMenu = await prisma.menu.upsert({
    where: { name: 'Invoice Penagihan' },
    update: {},
    create: {
      name: 'Invoice Penagihan',
      url: '/invoice/penagihan',
      parentId: invoiceMenu.id,
    },
  });

  const tagihanKwitansiMenu = await prisma.menu.upsert({
    where: { name: 'Tagihan & Kwitansi' },
    update: {},
    create: {
      name: 'Tagihan & Kwitansi',
      url: '/tagihan-kwitansi',
    },
  });

  const laporanOperasionalMenu = await prisma.menu.upsert({
    where: { name: 'Laporan Operasional' },
    update: {},
    create: {
      name: 'Laporan Operasional',
      url: '/laporan-operasional',
    },
  });

  const laporanHarianMenu = await prisma.menu.upsert({
    where: { name: 'Laporan Harian' },
    update: {},
    create: {
      name: 'Laporan Harian',
      url: '/laporan-operasional/harian',
      parentId: laporanOperasionalMenu.id,
    },
  });

  const laporanMingguanMenu = await prisma.menu.upsert({
    where: { name: 'Laporan Mingguan' },
    update: {},
    create: {
      name: 'Laporan Mingguan',
      url: '/laporan-operasional/mingguan',
      parentId: laporanOperasionalMenu.id,
    },
  });

  const laporanBulananMenu = await prisma.menu.upsert({
    where: { name: 'Laporan Bulanan' },
    update: {},
    create: {
      name: 'Laporan Bulanan',
      url: '/laporan-operasional/bulanan',
      parentId: laporanOperasionalMenu.id,
    },
  });

  const purchaseOrderMenu = await prisma.menu.upsert({
    where: { name: 'Purchase Order Management' },
    update: {},
    create: {
      name: 'Purchase Order Management',
      url: '/purchase-order',
    },
  });

  const customersMenu = await prisma.menu.upsert({
    where: { name: 'Customers' },
    update: {},
    create: {
      name: 'Customers',
      url: '/purchase-order/customers',
      parentId: purchaseOrderMenu.id,
    },
  });

  const purchaseOrdersMenu = await prisma.menu.upsert({
    where: { name: 'Purchase Orders' },
    update: {},
    create: {
      name: 'Purchase Orders',
      url: '/purchase-order/purchase-orders',
      parentId: purchaseOrderMenu.id,
    },
  });

  const suppliersMenu = await prisma.menu.upsert({
    where: { name: 'Suppliers' },
    update: {},
    create: {
      name: 'Suppliers',
      url: '/purchase-order/suppliers',
      parentId: purchaseOrderMenu.id,
    },
  });

  // Assign menus to roles
  await prisma.roleMenu.deleteMany({});

  await prisma.roleMenu.createMany({
    data: [
      // Super Admin gets all menus
      { roleId: superAdminRole.id, menuId: profileMenu.id },
      { roleId: superAdminRole.id, menuId: settingProfileMenu.id },
      { roleId: superAdminRole.id, menuId: invoiceMenu.id },
      { roleId: superAdminRole.id, menuId: invoicePengirimanMenu.id },
      { roleId: superAdminRole.id, menuId: invoicePenagihanMenu.id },
      { roleId: superAdminRole.id, menuId: tagihanKwitansiMenu.id },
      { roleId: superAdminRole.id, menuId: laporanOperasionalMenu.id },
      { roleId: superAdminRole.id, menuId: laporanHarianMenu.id },
      { roleId: superAdminRole.id, menuId: laporanMingguanMenu.id },
      { roleId: superAdminRole.id, menuId: laporanBulananMenu.id },
      { roleId: superAdminRole.id, menuId: purchaseOrderMenu.id },
      { roleId: superAdminRole.id, menuId: customersMenu.id },
      { roleId: superAdminRole.id, menuId: suppliersMenu.id },
      { roleId: superAdminRole.id, menuId: purchaseOrdersMenu.id },

      // Admin gets some menus
      { roleId: adminRole.id, menuId: profileMenu.id },
      { roleId: adminRole.id, menuId: settingProfileMenu.id },
      { roleId: adminRole.id, menuId: invoiceMenu.id },
      { roleId: adminRole.id, menuId: invoicePengirimanMenu.id },
      { roleId: adminRole.id, menuId: invoicePenagihanMenu.id },
      { roleId: adminRole.id, menuId: purchaseOrderMenu.id },
      { roleId: adminRole.id, menuId: customersMenu.id },
      { roleId: adminRole.id, menuId: suppliersMenu.id },
      { roleId: adminRole.id, menuId: purchaseOrdersMenu.id },

      // User gets limited menus
      { roleId: userRole.id, menuId: profileMenu.id },
      { roleId: userRole.id, menuId: settingProfileMenu.id },
    ],
  });

  console.log('Database has been seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
