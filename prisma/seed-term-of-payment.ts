import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Interface untuk term of payment data
 */
interface TermOfPaymentData {
  kode_top: string;
  batas_hari: number;
}

/**
 * Data semua term of payment yang akan di-seed
 */
const TERM_OF_PAYMENTS: TermOfPaymentData[] = [
  {
    kode_top: 'E',
    batas_hari: 15
  },
  {
    kode_top: 'F',
    batas_hari: 30
  },
  {
    kode_top: 'G',
    batas_hari: 45
  }
];

/**
 * Fungsi untuk membuat atau mengupdate term of payment
 */
export async function upsertTermOfPayment(termData: TermOfPaymentData) {
  return await prisma.termOfPayment.upsert({
    where: { kode_top: termData.kode_top },
    update: {
      batas_hari: termData.batas_hari,
      updatedBy: 'system',
      updatedAt: new Date()
    },
    create: {
      kode_top: termData.kode_top,
      batas_hari: termData.batas_hari,
      createdBy: 'system',
      updatedBy: 'system'
    },
  });
}

/**
 * Fungsi untuk membuat semua term of payment
 */
export async function seedAllTermOfPayments() {
  console.log('🚀 Starting to seed all term of payments...');
  
  const results: any[] = [];
  
  for (const term of TERM_OF_PAYMENTS) {
    const result = await upsertTermOfPayment(term);
    results.push(result);
    console.log(`✅ Term of Payment ${term.kode_top} (${term.batas_hari} hari) - ${result.id}`);
  }
  
  console.log(`\n✅ Successfully seeded ${results.length} term of payments`);
  return results;
}

/**
 * Fungsi untuk mendapatkan semua term of payment
 */
export async function getAllTermOfPayments() {
  return await prisma.termOfPayment.findMany({
    orderBy: [
      { kode_top: 'asc' }
    ]
  });
}

/**
 * Fungsi untuk mendapatkan term of payment berdasarkan kode
 */
export async function getTermOfPaymentByKode(kode_top: string) {
  return await prisma.termOfPayment.findUnique({
    where: { kode_top }
  });
}

/**
 * Fungsi untuk menghapus term of payment berdasarkan kode
 */
export async function deleteTermOfPaymentByKode(kode_top: string) {
  const term = await prisma.termOfPayment.findUnique({
    where: { kode_top }
  });
  
  if (term) {
    await prisma.termOfPayment.delete({
      where: { id: term.id }
    });
    console.log(`🗑️ Deleted term of payment: ${kode_top}`);
    return true;
  }
  
  return false;
}

/**
 * Fungsi untuk reset semua term of payment
 */
export async function resetAllTermOfPayments() {
  console.log('🔄 Resetting all term of payments...');
  
  const deletedCount = await prisma.termOfPayment.deleteMany({});
  console.log(`🗑️ Deleted ${deletedCount.count} existing term of payments`);
  
  return await seedAllTermOfPayments();
}

/**
 * Fungsi untuk mendapatkan statistik term of payment
 */
export async function getTermOfPaymentStatistics() {
  const allTerms = await getAllTermOfPayments();
  
  return {
    total: allTerms.length,
    terms: allTerms.map(t => ({
      kode_top: t.kode_top,
      batas_hari: t.batas_hari
    }))
  };
}

// Export untuk digunakan dalam script lain
export { TERM_OF_PAYMENTS };

// Jika file ini dijalankan langsung
if (require.main === module) {
  seedAllTermOfPayments()
    .then(() => {
      console.log('🎉 Term of Payment seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding term of payments:', error);
      process.exit(1);
    });
}
