import { FastifyRequest, FastifyReply } from 'fastify';
import { ItemPriceService } from '../services/item-price.service';
import { CreateItemPriceInput, UpdateItemPriceInput, SearchItemPriceInput, GetAllItemPricesInput } from '../schemas/item-price.schema';
import { ResponseUtil } from '@/utils/response.util';

export class ItemPriceController {
  static async createItemPrice(request: FastifyRequest<{ Body: CreateItemPriceInput }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    const itemPrice = await ItemPriceService.createItemPrice(request.body, userId);
    return reply.code(201).send(ResponseUtil.success(itemPrice));
  }

  static async getItemPrices(request: FastifyRequest<{ Querystring: GetAllItemPricesInput['query'] }>, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query;
    const result = await ItemPriceService.getAllItemPrices(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getItemPrice(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const itemPrice = await ItemPriceService.getItemPriceById(request.params.id);
    return reply.send(ResponseUtil.success(itemPrice));
  }

  static async updateItemPrice(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateItemPriceInput['body'] }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const itemPrice = await ItemPriceService.updateItemPrice(request.params.id, request.body, userId);
    return reply.send(ResponseUtil.success(itemPrice));
  }

  static async deleteItemPrice(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    await ItemPriceService.deleteItemPrice(request.params.id, userId);
    return reply.code(204).send();
  }

  static async searchItemPrices(request: FastifyRequest<{ Querystring: SearchItemPriceInput['query'] }>, reply: FastifyReply) {
    const { q, page = 1, limit = 10 } = request.query;
    const result = await ItemPriceService.searchItemPrices(q, page, limit);
    return reply.send(ResponseUtil.success(result));
  }
}
