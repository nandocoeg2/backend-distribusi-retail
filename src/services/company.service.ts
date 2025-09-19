import { Company, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateCompanyInput, UpdateCompanyInput } from '../schemas/company.schema';
import { BaseService } from './base.service';
import { PaginatedResult } from '@/types/common.types';

export class CompanyService extends BaseService<
  Company,
  CreateCompanyInput,
  UpdateCompanyInput['body']
> {
  protected modelName = 'Company';
  protected tableName = 'Company';
  protected prismaModel = prisma.company;

  static async createCompany(data: CreateCompanyInput, userId: string): Promise<Company> {
    const service = new CompanyService();
    
    const preprocessData = (data: CreateCompanyInput, userId: string) => {
      const { createdBy, updatedBy, ...companyData } = data;
      return {
        ...companyData,
        createdBy: userId,
        updatedBy: userId,
      };
    };

    return service.createEntity(data, userId, preprocessData);
  }

  static async getAllCompanies(page: number = 1, limit: number = 10): Promise<PaginatedResult<Company>> {
    const service = new CompanyService();
    return service.getAllEntities(page, limit);
  }

  static async getCompanyById(id: string) {
    const service = new CompanyService();
    return service.getEntityById(id);
  }

  static async updateCompany(id: string, data: UpdateCompanyInput['body'], userId: string): Promise<Company> {
    const service = new CompanyService();
    
    const preprocessData = (data: UpdateCompanyInput['body'], userId: string) => {
      const { updatedBy, ...companyData } = data;
      return {
        ...companyData,
        updatedBy: userId,
      };
    };

    return service.updateEntity(id, data, userId, preprocessData);
  }

  static async deleteCompany(id: string, userId: string): Promise<Company> {
    const service = new CompanyService();
    return service.deleteEntity(id, userId);
  }

  static async searchCompanies(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Company>> {
    const service = new CompanyService();
    
    if (!query) {
      return service.getAllEntities(page, limit);
    }

    const filters: Prisma.CompanyWhereInput[] = [
      {
        kode_company: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        nama_perusahaan: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        telp: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    return service.searchEntities(filters, page, limit);
  }
}
