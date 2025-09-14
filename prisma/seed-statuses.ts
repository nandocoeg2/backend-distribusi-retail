import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Interface untuk status data
 */
interface StatusData {
  status_code: string;
  status_name: string;
  status_description: string;
  category: string;
}

/**
 * Data semua status yang digunakan dalam sistem
 */
const ALL_STATUSES: StatusData[] = [

  // Bulk File Processing Status
  {
    status_code: 'PENDING BULK FILE',
    status_name: 'Pending Bulk File',
    status_description: 'Bulk file is pending processing',
    category: 'Bulk File Processing'
  },
  {
    status_code: 'PROCESSING BULK FILE',
    status_name: 'Processing Bulk File',
    status_description: 'Bulk file is currently being processed',
    category: 'Bulk File Processing'
  },
  {
    status_code: 'PROCESSED BULK FILE',
    status_name: 'Processed Bulk File',
    status_description: 'Bulk file has been processed successfully',
    category: 'Bulk File Processing'
  },
  {
    status_code: 'FAILED BULK FILE',
    status_name: 'Failed Bulk File',
    status_description: 'Bulk file processing has failed',
    category: 'Bulk File Processing'
  },

  // Purchase Order Status
  {
    status_code: 'PENDING PURCHASE ORDER',
    status_name: 'Pending Purchase Order',
    status_description: 'Purchase order is pending approval',
    category: 'Purchase Order'
  },
  {
    status_code: 'PROCESSED PURCHASE ORDER',
    status_name: 'Processed Purchase Order',
    status_description: 'Purchase order has been processed',
    category: 'Purchase Order'
  },
  {
    status_code: 'PROCESSING PURCHASE ORDER',
    status_name: 'Processing Purchase Order',
    status_description: 'Purchase order is being processed',
    category: 'Purchase Order'
  },
  {
    status_code: 'APPROVED PURCHASE ORDER',
    status_name: 'Approved Purchase Order',
    status_description: 'Purchase order has been approved',
    category: 'Purchase Order'
  },
  {
    status_code: 'FAILED PURCHASE ORDER',
    status_name: 'Failed Purchase Order',
    status_description: 'Purchase order processing failed',
    category: 'Purchase Order'
  },

  // Packing Status
  {
    status_code: 'PENDING PACKING',
    status_name: 'Pending Packing',
    status_description: 'Packing is pending processing',
    category: 'Packing'
  },
  {
    status_code: 'PROCESSING PACKING',
    status_name: 'Processing Packing',
    status_description: 'Packing is currently being processed',
    category: 'Packing'
  },
  {
    status_code: 'COMPLETED PACKING',
    status_name: 'Completed Packing',
    status_description: 'Packing has been completed',
    category: 'Packing'
  },
  {
    status_code: 'FAILED PACKING',
    status_name: 'Failed Packing',
    status_description: 'Packing processing failed',
    category: 'Packing'
  },

  // Invoice Status
  {
    status_code: 'PENDING INVOICE',
    status_name: 'Pending Invoice',
    status_description: 'Invoice is pending processing',
    category: 'Invoice'
  },
  {
    status_code: 'PAID INVOICE',
    status_name: 'Paid Invoice',
    status_description: 'Invoice has been paid',
    category: 'Invoice'
  },
  {
    status_code: 'OVERDUE INVOICE',
    status_name: 'Overdue Invoice',
    status_description: 'Invoice payment is overdue',
    category: 'Invoice'
  },
  {
    status_code: 'CANCELLED INVOICE',
    status_name: 'Cancelled Invoice',
    status_description: 'Invoice has been cancelled',
    category: 'Invoice'
  },

  // Surat Jalan Status
  {
    status_code: 'PENDING SURAT JALAN',
    status_name: 'Pending Surat Jalan',
    status_description: 'Surat jalan is pending processing',
    category: 'Surat Jalan'
  },
  {
    status_code: 'SENT SURAT JALAN',
    status_name: 'Sent Surat Jalan',
    status_description: 'Surat jalan has been sent',
    category: 'Surat Jalan'
  },
  {
    status_code: 'DELIVERED SURAT JALAN',
    status_name: 'Delivered Surat Jalan',
    status_description: 'Surat jalan has been delivered',
    category: 'Surat Jalan'
  },
  {
    status_code: 'RETURNED SURAT JALAN',
    status_name: 'Returned Surat Jalan',
    status_description: 'Surat jalan has been returned',
    category: 'Surat Jalan'
  },
  // Packing Detail Item status
  {
    status_code: 'PENDING ITEM',
    status_name: 'Pending Item',
    status_description: 'Packing detail item is pending processing',
    category: 'Packing Detail Item'
  },
  {
    status_code: 'PROCESSING ITEM',
    status_name: 'Processing Item',
    status_description: 'Packing detail item is currently being processed.',
    category: 'Packing Detail Item'
  },
  {
    status_code: 'PROCESSED ITEM',
    status_name: 'Processed Item',
    status_description: 'Packing detail item has been processed.',
    category: 'Packing Detail Item'
  },
  {
    status_code: 'FAILED ITEM',
    status_name: 'Failed Item',
    status_description: 'Packing detail item has been failed.',
    category: 'Packing Detail Item'
  }
];

/**
 * Fungsi untuk membuat atau mengupdate status
 */
export async function upsertStatus(statusData: StatusData) {
  return await prisma.status.upsert({
    where: { status_code: statusData.status_code },
    update: {
      status_name: statusData.status_name,
      status_description: statusData.status_description,
    },
    create: {
      status_code: statusData.status_code,
      status_name: statusData.status_name,
      status_description: statusData.status_description,
    },
  });
}

/**
 * Fungsi untuk membuat semua status berdasarkan kategori
 */
export async function seedStatusesByCategory(category: string) {
  const statuses = ALL_STATUSES.filter(status => status.category === category);
  const results: any[] = [];
  
  for (const status of statuses) {
    const result = await upsertStatus(status);
    results.push(result);
    console.log(`✅ Status ${status.status_code} (${category}) - ${result.id}`);
  }
  
  return results;
}

/**
 * Fungsi untuk membuat semua status
 */
export async function seedAllStatuses() {
  console.log('🚀 Starting to seed all statuses...');
  
  const results: any[] = [];
  const categories = [...new Set(ALL_STATUSES.map(s => s.category))];
  
  for (const category of categories) {
    console.log(`\n📂 Processing category: ${category}`);
    const categoryResults = await seedStatusesByCategory(category);
    results.push(...categoryResults);
  }
  
  console.log(`\n✅ Successfully seeded ${results.length} statuses across ${categories.length} categories`);
  return results;
}

/**
 * Fungsi untuk mendapatkan status berdasarkan kategori
 */
export async function getStatusesByCategory(category: string) {
  return await prisma.status.findMany({
    where: {
      status_name: {
        contains: category
      }
    }
  });
}

/**
 * Fungsi untuk mendapatkan semua status
 */
export async function getAllStatuses() {
  return await prisma.status.findMany({
    orderBy: [
      { status_name: 'asc' }
    ]
  });
}

/**
 * Fungsi untuk menghapus status berdasarkan kategori
 */
export async function deleteStatusesByCategory(category: string) {
  const statuses = await getStatusesByCategory(category);
  
  for (const status of statuses) {
    await prisma.status.delete({
      where: { id: status.id }
    });
    console.log(`🗑️ Deleted status: ${status.status_code}`);
  }
  
  return statuses.length;
}

/**
 * Fungsi untuk reset semua status
 */
export async function resetAllStatuses() {
  console.log('🔄 Resetting all statuses...');
  
  const deletedCount = await prisma.status.deleteMany({});
  console.log(`🗑️ Deleted ${deletedCount.count} existing statuses`);
  
  return await seedAllStatuses();
}

/**
 * Fungsi untuk mendapatkan statistik status
 */
export async function getStatusStatistics() {
  const allStatuses = await getAllStatuses();
  const categories = [...new Set(ALL_STATUSES.map(s => s.category))];
  
  const stats = categories.map(category => {
    const categoryStatuses = allStatuses.filter(status => 
      ALL_STATUSES.find(s => s.status_code === status.status_code)?.category === category
    );
    
    return {
      category,
      count: categoryStatuses.length,
      statuses: categoryStatuses.map(s => s.status_code)
    };
  });
  
  return {
    total: allStatuses.length,
    categories: stats
  };
}

// Export untuk digunakan dalam script lain
export { ALL_STATUSES };

// Jika file ini dijalankan langsung
if (require.main === module) {
  seedAllStatuses()
    .then(() => {
      console.log('🎉 Status seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding statuses:', error);
      process.exit(1);
    });
}
