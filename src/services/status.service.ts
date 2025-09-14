import { Status } from '@prisma/client';
import { prisma } from '@/config/database';

export class StatusService {
  static async getAllStatuses(): Promise<Status[]> {
    return prisma.status.findMany();
  }

  static async getStatusesByPurchaseOrder(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        status_name: {
          contains: 'Purchase Order'
        }
      }
    });
  }

  static async getStatusesByBulkFile(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        status_name: {
          contains: 'Bulk File'
        }
      }
    });
  }

  static async getStatusesByPacking(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        status_name: {
          contains: 'Packing'
        }
      }
    });
  }

  static async getStatusesByPackingItem(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        status_name: {
          contains: 'Item'
        }
      }
    });
  }

  static async getStatusesByInvoice(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        status_name: {
          contains: 'Invoice'
        }
      }
    });
  }

  static async getStatusesBySuratJalan(): Promise<Status[]> {
    return prisma.status.findMany({
      where: {
        status_name: {
          contains: 'Surat Jalan'
        }
      }
    });
  }
}

