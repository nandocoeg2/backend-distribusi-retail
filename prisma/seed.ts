import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'super admin',
      description: 'Super Administrator',
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Administrator',
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      description: 'Regular User',
    },
  });

  // Create menus
  const profileMenu = await prisma.menu.create({
    data: {
      name: 'Profile',
      url: '/profile',
    },
  });

  const settingProfileMenu = await prisma.menu.create({
    data: {
      name: 'Setting Profile',
      url: '/profile/setting',
      parentId: profileMenu.id,
    },
  });

  const invoiceMenu = await prisma.menu.create({
    data: {
      name: 'Invoice',
      url: '/invoice',
    },
  });

  const invoicePengirimanMenu = await prisma.menu.create({
    data: {
      name: 'Invoice Pengiriman',
      url: '/invoice/pengiriman',
      parentId: invoiceMenu.id,
    },
  });

  const invoicePenagihanMenu = await prisma.menu.create({
    data: {
      name: 'Invoice Penagihan',
      url: '/invoice/penagihan',
      parentId: invoiceMenu.id,
    },
  });

  const tagihanKwitansiMenu = await prisma.menu.create({
    data: {
      name: 'Tagihan & Kwitansi',
      url: '/tagihan-kwitansi',
    },
  });

  const laporanOperasionalMenu = await prisma.menu.create({
    data: {
      name: 'Laporan Operasional',
      url: '/laporan-operasional',
    },
  });

  const laporanHarianMenu = await prisma.menu.create({
    data: {
      name: 'Laporan Harian',
      url: '/laporan-operasional/harian',
      parentId: laporanOperasionalMenu.id,
    },
  });

  const laporanMingguanMenu = await prisma.menu.create({
    data: {
      name: 'Laporan Mingguan',
      url: '/laporan-operasional/mingguan',
      parentId: laporanOperasionalMenu.id,
    },
  });

  const laporanBulananMenu = await prisma.menu.create({
    data: {
      name: 'Laporan Bulanan',
      url: '/laporan-operasional/bulanan',
      parentId: laporanOperasionalMenu.id,
    },
  });

  // Assign menus to roles
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

      // Admin gets some menus
      { roleId: adminRole.id, menuId: profileMenu.id },
      { roleId: adminRole.id, menuId: settingProfileMenu.id },
      { roleId: adminRole.id, menuId: invoiceMenu.id },
      { roleId: adminRole.id, menuId: invoicePengirimanMenu.id },
      { roleId: adminRole.id, menuId: invoicePenagihanMenu.id },

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