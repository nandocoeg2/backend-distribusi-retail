import { prisma } from '../config/database';

export const getAllHistoryPengiriman = async () => {
  return prisma.historyPengiriman.findMany();
};

export const getHistoryPengirimanBySuratJalanId = async (suratJalanId: string) => {
  return prisma.historyPengiriman.findMany({
    where: { surat_jalan_id: suratJalanId },
  });
};

export const getHistoryPengirimanByTanggalKirim = async (tanggalKirim: Date) => {
  return prisma.historyPengiriman.findMany({
    where: { tanggal_kirim: tanggalKirim },
  });
};

export const getHistoryPengirimanByStatusCode = async (statusCode: string) => {
  return prisma.historyPengiriman.findMany({
    where: { status_id: statusCode },
  });
};

