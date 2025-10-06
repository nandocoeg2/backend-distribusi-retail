import { z } from 'zod';

const checklistSuratJalanSchema = z.object({
  tanggal: z.string().or(z.date()).transform((val) => new Date(val)),
  checker: z.string().min(1, 'Checker is required'),
  driver: z.string().min(1, 'Driver is required'),
  mobil: z.string().min(1, 'Mobil is required'),
  kota: z.string().min(1, 'Kota is required'),
});

export const createSuratJalanSchema = z.object({
  body: z.object({
    no_surat_jalan: z.string().min(1, 'Nomor surat jalan is required'),
    deliver_to: z.string().min(1, 'Deliver to is required'),
    PIC: z.string().min(1, 'PIC is required'),
    alamat_tujuan: z.string().min(1, 'Alamat tujuan is required'),
    invoiceId: z.string().optional().nullable(),
    purchaseOrderId: z.string().optional().nullable(),
    statusId: z.string().optional().nullable(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
    checklistSuratJalan: checklistSuratJalanSchema.optional(),
    suratJalanDetails: z
      .array(
        z.object({
          no_box: z.string().min(1, 'Nomor box is required'),
          total_quantity_in_box: z
            .number()
            .int()
            .positive('Total quantity must be positive'),
          isi_box: z.number().int().positive('Isi box must be positive'),
          sisa: z.number().int().min(0, 'Sisa cannot be negative'),
          total_box: z.number().int().positive('Total box must be positive'),
          items: z
            .array(
              z.object({
                nama_barang: z.string().min(1, 'Nama barang is required'),
                PLU: z.string().min(1, 'PLU is required'),
                quantity: z
                  .number()
                  .int()
                  .positive('Quantity must be positive'),
                satuan: z.string().min(1, 'Satuan is required'),
                total_box: z
                  .number()
                  .int()
                  .positive('Total box must be positive'),
                keterangan: z.string().optional(),
              })
            )
            .min(1, 'At least one item is required'),
        })
      )
      .min(1, 'At least one detail is required'),
  }),
});

export const updateSuratJalanSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid ID format'),
  }),
  body: z.object({
    no_surat_jalan: z
      .string()
      .min(1, 'Nomor surat jalan is required')
      .optional(),
    deliver_to: z.string().min(1, 'Deliver to is required').optional(),
    PIC: z.string().min(1, 'PIC is required').optional(),
    alamat_tujuan: z.string().min(1, 'Alamat tujuan is required').optional(),
    invoiceId: z.string().optional().nullable(),
    purchaseOrderId: z.string().optional().nullable(),
    statusId: z.string().optional().nullable(),
    updatedBy: z.string().optional(),
    is_printed: z.boolean().optional(),
    print_counter: z.number().int().min(0).optional(),
    checklistSuratJalan: checklistSuratJalanSchema.optional(),
    suratJalanDetails: z
      .array(
        z.object({
          no_box: z.string().min(1, 'Nomor box is required'),
          total_quantity_in_box: z
            .number()
            .int()
            .positive('Total quantity must be positive'),
          isi_box: z.number().int().positive('Isi box must be positive'),
          sisa: z.number().int().min(0, 'Sisa cannot be negative'),
          total_box: z.number().int().positive('Total box must be positive'),
          items: z
            .array(
              z.object({
                nama_barang: z.string().min(1, 'Nama barang is required'),
                PLU: z.string().min(1, 'PLU is required'),
                quantity: z
                  .number()
                  .int()
                  .positive('Quantity must be positive'),
                satuan: z.string().min(1, 'Satuan is required'),
                total_box: z
                  .number()
                  .int()
                  .positive('Total box must be positive'),
                keterangan: z.string().optional(),
              })
            )
            .min(1, 'At least one item is required'),
        })
      )
      .optional(),
  }),
});

export const getSuratJalanByIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid ID format'),
  }),
});

export const deleteSuratJalanSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid ID format'),
  }),
});

export const searchSuratJalanSchema = z.object({
  query: z.object({
    no_surat_jalan: z.string().optional(),
    deliver_to: z.string().optional(),
    PIC: z.string().optional(),
    invoiceId: z.string().optional(),
    purchaseOrderId: z.string().optional(),
    status_code: z.string().optional(),
    is_printed: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    page: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .default(1),
    limit: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .default(10),
  }),
});

export const processSuratJalanSchema = z.object({
  body: z.object({
    ids: z
      .array(z.string().cuid('Invalid ID format'))
      .min(1, 'Minimal satu surat jalan harus dipilih'),
  }),
});

export type CreateSuratJalanInput = z.infer<
  typeof createSuratJalanSchema
>['body'];
export type UpdateSuratJalanInput = z.infer<typeof updateSuratJalanSchema>;
export type ProcessSuratJalanInput = z.infer<
  typeof processSuratJalanSchema
>['body'];
export type SearchSuratJalanInput = z.infer<typeof searchSuratJalanSchema>;
export type GetSuratJalanByIdInput = z.infer<
  typeof getSuratJalanByIdSchema
>['params'];
export type DeleteSuratJalanInput = z.infer<
  typeof deleteSuratJalanSchema
>['params'];
