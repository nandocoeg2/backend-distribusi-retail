import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createCompanySchema = z.object({
  body: z.object({
    kode_company: z.string({ required_error: 'Company code is required' }).describe('Company code'),
    nama_perusahaan: z.string({ required_error: 'Company name is required' }).describe('Company name'),
    alamat: z.string().optional().describe('Company address'),
    no_rekening: z.string().optional().describe('Bank account number'),
    bank: z.string().optional().describe('Bank name'),
    bank_account_name: z.string().optional().describe('Bank account name'),
    bank_cabang: z.string().optional().describe('Bank branch'),
    telp: z.string().optional().describe('Telephone number'),
    fax: z.string().optional().describe('Fax number'),
    email: z.string().email().optional().describe('Email address'),
    direktur_utama: z.string().optional().describe('CEO name'),
    npwp: z.string().optional().describe('Taxpayer identification number'),
    createdBy: z.string().optional().describe('User who created the company'),
    updatedBy: z.string().optional().describe('User who updated the company'),
  }),
});

export const getCompanySchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the company'),
  }),
});

export const updateCompanySchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the company'),
  }),
  body: z.object({
    kode_company: z.string().optional().describe('Company code'),
    nama_perusahaan: z.string().optional().describe('Company name'),
    alamat: z.string().optional().describe('Company address'),
    no_rekening: z.string().optional().describe('Bank account number'),
    bank: z.string().optional().describe('Bank name'),
    bank_account_name: z.string().optional().describe('Bank account name'),
    bank_cabang: z.string().optional().describe('Bank branch'),
    telp: z.string().optional().describe('Telephone number'),
    fax: z.string().optional().describe('Fax number'),
    email: z.string().email().optional().describe('Email address'),
    direktur_utama: z.string().optional().describe('CEO name'),
    npwp: z.string().optional().describe('Taxpayer identification number'),
    updatedBy: z.string().optional().describe('User who updated the company'),
  }),
});

export const deleteCompanySchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the company'),
  }),
});

export const searchCompanySchema = z.object({
  query: z.object({
    ...paginationSchema.shape,
    q: z.string().optional().describe('Search query'),
  }),
});

export const getAllCompaniesSchema = z.object({
  query: paginationSchema,
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type SearchCompanyInput = z.infer<typeof searchCompanySchema>;
export type GetAllCompaniesInput = z.infer<typeof getAllCompaniesSchema>;

