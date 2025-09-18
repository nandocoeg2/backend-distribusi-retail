import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomerService } from '@/services/customer.service';
import { CreateCustomerInput, UpdateCustomerInput, SearchCustomerInput, GetAllCustomersInput } from '@/schemas/customer.schema';
import { ResponseUtil } from '@/utils/response.util';

export class CustomerController {
  static async createCustomer(request: FastifyRequest<{ Body: CreateCustomerInput }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    
    const customerData = {
      ...request.body,
      createdBy: userId,
      updatedBy: userId,
    };
    
    const customer = await CustomerService.createCustomer(customerData);
    return reply.code(201).send(ResponseUtil.success(customer));
  }

  static async getCustomers(request: FastifyRequest<{ Querystring: GetAllCustomersInput['query'] }>, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query;
    const result = await CustomerService.getAllCustomers(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getCustomer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const customer = await CustomerService.getCustomerById(request.params.id);
    return reply.send(ResponseUtil.success(customer));
  }

  static async updateCustomer(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCustomerInput['body'] }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    
    const updateData = {
      ...request.body,
      updatedBy: userId,
    };
    
    const customer = await CustomerService.updateCustomer(request.params.id, updateData);
    return reply.send(ResponseUtil.success(customer));
  }

  static async deleteCustomer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await CustomerService.deleteCustomer(request.params.id);
    return reply.code(204).send();
  }

  static async searchCustomers(request: FastifyRequest<{ Querystring: SearchCustomerInput['query'] }>, reply: FastifyReply) {
    const params = request.params as { q?: string };
    const { page = 1, limit = 10 } = request.query;
    const result = await CustomerService.searchCustomers(params.q, page, limit);
    return reply.send(ResponseUtil.success(result));
  }
}
