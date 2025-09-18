import { FastifyRequest, FastifyReply } from 'fastify';
import { CompanyService } from '../services/company.service';
import { CreateCompanyInput, UpdateCompanyInput, SearchCompanyInput, GetAllCompaniesInput } from '@/schemas/company.schema';
import { ResponseUtil } from '@/utils/response.util';

export class CompanyController {
  static async createCompany(request: FastifyRequest<{ Body: CreateCompanyInput }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    const company = await CompanyService.createCompany(request.body, userId);
    return reply.code(201).send(ResponseUtil.success(company));
  }

  static async getCompanies(request: FastifyRequest<{ Querystring: GetAllCompaniesInput['query'] }>, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query;
    const result = await CompanyService.getAllCompanies(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getCompany(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const company = await CompanyService.getCompanyById(request.params.id);
    return reply.send(ResponseUtil.success(company));
  }

  static async updateCompany(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCompanyInput['body'] }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const company = await CompanyService.updateCompany(request.params.id, request.body, userId);
    return reply.send(ResponseUtil.success(company));
  }

  static async deleteCompany(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    await CompanyService.deleteCompany(request.params.id, userId);
    return reply.code(204).send();
  }

  static async searchCompanies(request: FastifyRequest<{ Querystring: SearchCompanyInput['query'] }>, reply: FastifyReply) {
    const { q, page = 1, limit = 10 } = request.query;
    const result = await CompanyService.searchCompanies(q, page, limit);
    return reply.send(ResponseUtil.success(result));
  }
}
