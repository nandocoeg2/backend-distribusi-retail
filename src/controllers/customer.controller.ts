import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomerService } from '@/services/customer.service';
import { CreateCustomerInput, UpdateCustomerInput, SearchCustomerInput, GetAllCustomersInput } from '@/schemas/customer.schema';

export class CustomerController {
  static async createCustomer(request: FastifyRequest<{ Body: CreateCustomerInput }>, reply: FastifyReply) {
    const customer = await CustomerService.createCustomer(request.body);
    return reply.code(201).send(customer);
  }

  static async getCustomers(request: FastifyRequest<{ Querystring: GetAllCustomersInput['query'] }>, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query;
    const result = await CustomerService.getAllCustomers(page, limit);
    return reply.send(result);
  }

  static async getCustomer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const customer = await CustomerService.getCustomerById(request.params.id);
    if (!customer) {
      return reply.code(404).send({ message: 'Customer not found' });
    }
    return reply.send(customer);
  }

  static async updateCustomer(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCustomerInput['body'] }>,
    reply: FastifyReply
  ) {
    const customer = await CustomerService.updateCustomer(request.params.id, request.body);
    if (!customer) {
      return reply.code(404).send({ message: 'Customer not found' });
    }
    return reply.send(customer);
  }

  static async deleteCustomer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const customer = await CustomerService.deleteCustomer(request.params.id);
    if (!customer) {
      return reply.code(404).send({ message: 'Customer not found' });
    }
    return reply.code(204).send();
  }

  static async searchCustomers(request: FastifyRequest<{ Querystring: SearchCustomerInput['query'] }>, reply: FastifyReply) {
    const params = request.params as { q?: string };
    const { page = 1, limit = 10 } = request.query;
    const result = await CustomerService.searchCustomers(params.q, page, limit);
    return reply.send(result);
  }
}
