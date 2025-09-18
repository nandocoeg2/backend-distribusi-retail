import { FastifyRequest, FastifyReply } from 'fastify';
import { GroupCustomerService } from '../services/group-customer.service';
import { CreateGroupCustomerInput, UpdateGroupCustomerInput, SearchGroupCustomerInput, GetAllGroupCustomersInput } from '../schemas/group-customer.schema';
import { ResponseUtil } from '@/utils/response.util';

export class GroupCustomerController {
  static async createGroupCustomer(request: FastifyRequest<{ Body: CreateGroupCustomerInput }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    const groupCustomer = await GroupCustomerService.createGroupCustomer(request.body, userId);
    return reply.code(201).send(ResponseUtil.success(groupCustomer));
  }

  static async getGroupCustomers(request: FastifyRequest<{ Querystring: GetAllGroupCustomersInput['query'] }>, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query;
    const result = await GroupCustomerService.getAllGroupCustomers(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getGroupCustomer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const groupCustomer = await GroupCustomerService.getGroupCustomerById(request.params.id);
    return reply.send(ResponseUtil.success(groupCustomer));
  }

  static async updateGroupCustomer(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateGroupCustomerInput['body'] }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const groupCustomer = await GroupCustomerService.updateGroupCustomer(request.params.id, request.body, userId);
    return reply.send(ResponseUtil.success(groupCustomer));
  }

  static async deleteGroupCustomer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    await GroupCustomerService.deleteGroupCustomer(request.params.id, userId);
    return reply.code(204).send();
  }

  static async searchGroupCustomers(request: FastifyRequest<{ Querystring: SearchGroupCustomerInput['query'] }>, reply: FastifyReply) {
    const params = request.params as { q?: string };
    const { page = 1, limit = 10 } = request.query;
    const result = await GroupCustomerService.searchGroupCustomers(params.q, page, limit);
    return reply.send(ResponseUtil.success(result));
  }
}
