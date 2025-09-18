import { prisma } from '../config/database';
import { HistoryPengiriman } from '@prisma/client';

export class HistoryPengirimanService {
  static async getAll(): Promise<HistoryPengiriman[]> {
    return prisma.historyPengiriman.findMany({
      include: {
        suratJalan: true,
        status: true,
      },
    });
  }

  static async getBySuratJalanId(suratJalanId: string): Promise<HistoryPengiriman[]> {
    return prisma.historyPengiriman.findMany({
      where: { surat_jalan_id: suratJalanId },
      include: {
        suratJalan: true,
        status: true,
      },
    });
  }

  static async getByTanggalKirim(tanggalKirim: Date): Promise<HistoryPengiriman[]> {
    return prisma.historyPengiriman.findMany({
      where: { tanggal_kirim: tanggalKirim },
      include: {
        suratJalan: true,
        status: true,
      },
    });
  }

  static async getByStatusCode(statusCode: string): Promise<HistoryPengiriman[]> {
    return prisma.historyPengiriman.findMany({
      where: { status: { status_code: statusCode } },
      include: {
        suratJalan: true,
        status: true,
      },
    });
  }
}
