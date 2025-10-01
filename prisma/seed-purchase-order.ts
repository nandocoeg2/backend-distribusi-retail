import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a new purchase order
  // Note: Customer must exist first - run seed:master-data before this
  const existingCustomer = await prisma.customer.findFirst();
  
  if (existingCustomer) {
    await prisma.purchaseOrder.create({
      data: {
        po_number: `PO-${new Date().getFullYear()}-${new Date().getDate()}-001AB`,
        customer: {
          connect: { id: existingCustomer.id },
        },
        total_items: 10,
        tanggal_order: new Date(),
        po_type: 'MANUAL',
      },
    });
    console.log('Purchase order created');
  } else {
    console.log('No customer found. Please run seed:master-data first.');
  }
  console.log('Seed purchase order selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
