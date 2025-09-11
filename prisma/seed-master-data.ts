import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  // Clean up existing data in the correct order to avoid foreign key violations
  await prisma.purchaseOrder.deleteMany({});
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

  console.log('Seed master data selesai.');
  console.log(`Created ${inventories.length} inventory items`);
  console.log('Customer created:', customer1.name);
  console.log('Supplier created:', supplier1.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
