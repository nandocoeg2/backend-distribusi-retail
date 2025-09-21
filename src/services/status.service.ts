import { Status } from '@prisma/client';
import { prisma } from '@/config/database';

export class StatusService {
  static async getAllStatuses(): Promise<Status[]> {
    return prisma.status.findMany({
      orderBy: [
        { category: 'asc' },
        { status_name: 'asc' }
      ]
    });
  }

  static async getStatusesByCategory(category: string): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        category: category
      },
      orderBy: {
        status_name: 'asc'
      }
    });
  }

  static async getStatusesByPurchaseOrder(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        category: 'Purchase Order'
      },
      orderBy: {
        status_name: 'asc'
      }
    });
  }

  static async getStatusesByBulkFile(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        category: 'Bulk File Processing'
      },
      orderBy: {
        status_name: 'asc'
      }
    });
  }

  static async getStatusesByPacking(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        category: 'Packing'
      },
      orderBy: {
        status_name: 'asc'
      }
    });
  }

  static async getStatusesByPackingItem(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        category: 'Packing Detail Item'
      },
      orderBy: {
        status_name: 'asc'
      }
    });
  }

  static async getStatusesByInvoice(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        category: 'Invoice'
      },
      orderBy: {
        status_name: 'asc'
      }
    });
  }

  static async getStatusesBySuratJalan(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        category: 'Surat Jalan'
      },
      orderBy: {
        status_name: 'asc'
      }
    });
  }

  static async getStatusByCodeAndCategory(statusCode: string, category: string): Promise<Status | null> {
    return prisma.status.findUnique({
      where: {
        status_code_category: {
          status_code: statusCode,
          category: category
        }
      }
    });
  }

  static async getAllCategories(): Promise<string[]> {
    const categories = await prisma.status.findMany({
      select: {
        category: true
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc'
      }
    });
    
    return categories.map(c => c.category);
  }
}

