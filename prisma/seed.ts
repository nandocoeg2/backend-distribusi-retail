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

  // Update parent menus url to '#'
  const parentMenus = await prisma.menu.findMany({
    where: {
      children: {
        some: {},
      },
    },
  });

  for (const parentMenu of parentMenus) {
    await prisma.menu.update({
      where: {
        id: parentMenu.id,
      },
      data: {
        url: '#',
      },
    });
  }

  // Create statuses
  const statusPending = await prisma.status.upsert({
    where: { status_code: 'PENDING' },
    update: {},
    create: {
      status_code: 'PENDING',
      status_name: 'Pending',
      status_description: 'Order is pending approval',
    },
  });

  const statusApproved = await prisma.status.upsert({
    where: { status_code: 'APPROVED' },
    update: {},
    create: {
      status_code: 'APPROVED',
      status_name: 'Approved',
      status_description: 'Order has been approved',
    },
  });

  const statusProcessed = await prisma.status.upsert({
    where: { status_code: 'PROCESSED' },
    update: {},
    create: {
      status_code: 'PROCESSED',
      status_name: 'Processed',
      status_description: 'File has been processed successfully',
    },
  });

  const statusFailed = await prisma.status.upsert({
    where: { status_code: 'FAILED' },
    update: {},
    create: {
      status_code: 'FAILED',
      status_name: 'Failed',
      status_description: 'File processing has failed',
    },
  });

  // Create customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      name: 'Customer One',
      email: 'customer1@example.com',
      phoneNumber: '1234567890',
    },
  });

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { email: 'supplier1@example.com' },
    update: {},
    create: {
      name: 'Supplier One',
      email: 'supplier1@example.com',
      phoneNumber: '0987654321',
    },
  });

  // Create inventory data
  await prisma.inventory.deleteMany({});

  const inventories = await Promise.all([
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-001',
        nama_barang: 'Laptop Dell Inspiron 15',
        stok_barang: 25,
        harga_barang: 8500000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-002',
        nama_barang: 'Keyboard Logitech K380',
        stok_barang: 50,
        harga_barang: 350000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-003',
        nama_barang: 'Mouse Wireless Logitech M720',
        stok_barang: 30,
        harga_barang: 450000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-004',
        nama_barang: 'Monitor Samsung 24 inch',
        stok_barang: 15,
        harga_barang: 3200000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-005',
        nama_barang: 'Printer Epson L3150',
        stok_barang: 8,
        harga_barang: 4200000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-006',
        nama_barang: 'Harddisk External 1TB WD',
        stok_barang: 20,
        harga_barang: 950000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-007',
        nama_barang: 'Flashdisk 64GB SanDisk',
        stok_barang: 100,
        harga_barang: 120000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-008',
        nama_barang: 'Kabel HDMI 2m UGREEN',
        stok_barang: 45,
        harga_barang: 85000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-009',
        nama_barang: 'Webcam Logitech C920',
        stok_barang: 12,
        harga_barang: 1800000,
      },
    }),
    prisma.inventory.create({
      data: {
        kode_barang: 'BRG-010',
        nama_barang: 'Router TP-Link Archer C6',
        stok_barang: 18,
        harga_barang: 750000,
      },
    }),
  ]);

  console.log(`Created ${inventories.length} inventory items`);

  // Create purchase orders
  await prisma.purchaseOrder.deleteMany({});

  await prisma.purchaseOrder.create({
    data: {
      po_number: `PO-${new Date().getFullYear()}-${new Date().getDate()}-001AB`,
      customer: {
        connect: { id: customer1.id },
      },
      status: {
        connect: { id: statusPending.id },
      },
      total_items: 10,
      tanggal_order: new Date(),
      po_type: 'SINGLE',
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
