import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createCompanySchema = z.object({
  body: z.object({
    kode_company: z.string({ required_error: 'Company code is required' }),
    nama_perusahaan: z.string({ required_error: 'Company name is required' }),
    alamat: z.string().optional(),
    no_rekening: z.string().optional(),
    bank: z.string().optional(),
    bank_account_name: z.string().optional(),
    bank_cabang: z.string().optional(),
    telp: z.string().optional(),
    fax: z.string().optional(),
    email: z.string().email().optional(),
    direktur_utama: z.string().optional(),
    npwp: z.string().optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const getCompanySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const updateCompanySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    kode_company: z.string().optional(),
    nama_perusahaan: z.string().optional(),
    alamat: z.string().optional(),
    no_rekening: z.string().optional(),
    bank: z.string().optional(),
    bank_account_name: z.string().optional(),
    bank_cabang: z.string().optional(),
    telp: z.string().optional(),
    fax: z.string().optional(),
    email: z.string().email().optional(),
    direktur_utama: z.string().optional(),
    npwp: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const deleteCompanySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const searchCompanySchema = z.object({
  query: z.object({
    ...paginationSchema.shape,
    q: z.string().optional(),
  }),
});

export const getAllCompaniesSchema = z.object({
  query: paginationSchema,
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type SearchCompanyInput = z.infer<typeof searchCompanySchema>;
export type GetAllCompaniesInput = z.infer<typeof getAllCompaniesSchema>;

