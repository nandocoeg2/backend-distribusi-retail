import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { CompanyController } from '../controllers/company.controller';
import { validateRequest } from '../middleware/validate-request';
import {
  createCompanySchema,
  CreateCompanyInput,
  deleteCompanySchema,
  getCompanySchema,
  searchCompanySchema,
  updateCompanySchema,
  UpdateCompanyInput,
  GetAllCompaniesInput,
  getAllCompaniesSchema,
} from '../schemas/company.schema';

export const companyRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get<{ Querystring: GetAllCompaniesInput['query'] & { q?: string } }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(searchCompanySchema)],
    },
    CompanyController.searchCompanies
  );

  fastify.post<{ Body: CreateCompanyInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createCompanySchema)],
    },
    CompanyController.createCompany
  );

  fastify.get<{ Querystring: GetAllCompaniesInput['query'] }>('/', { 
    preHandler: [fastify.authenticate, validateRequest(getAllCompaniesSchema)] 
  }, CompanyController.getCompanies);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getCompanySchema)],
    },
    CompanyController.getCompany
  );

  fastify.put<{ Params: { id: string }; Body: UpdateCompanyInput['body'] }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(updateCompanySchema)],
    },
    CompanyController.updateCompany
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(deleteCompanySchema)],
    },
    CompanyController.deleteCompany
  );

  done();
};

