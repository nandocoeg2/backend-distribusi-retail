import { z } from 'zod';

export const getHistoryPengirimanBySuratJalanIdSchema = z.object({
  params: z.object({
    suratJalanId: z.string(),
  }),
});
export type GetHistoryPengirimanBySuratJalanIdInput = z.infer<typeof getHistoryPengirimanBySuratJalanIdSchema>;

export const getHistoryPengirimanByTanggalKirimSchema = z.object({
  params: z.object({
    tanggalKirim: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
  }),
});
export type GetHistoryPengirimanByTanggalKirimInput = z.infer<typeof getHistoryPengirimanByTanggalKirimSchema>;

export const getHistoryPengirimanByStatusCodeSchema = z.object({
  params: z.object({
    statusCode: z.string(),
  }),
});
export type GetHistoryPengirimanByStatusCodeInput = z.infer<typeof getHistoryPengirimanByStatusCodeSchema>;

