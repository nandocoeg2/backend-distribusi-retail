import { FastifyRequest, FastifyReply } from 'fastify';
import {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
} from '@/services/inventory.service';
import { 
  CreateInventoryInput, 
  UpdateInventoryInput, 
  GetAllInventoriesInput 
} from '@/schemas/inventory.schema';
import { AppError } from '@/utils/app-error';

export const createInventoryHandler = async (
  request: FastifyRequest<{ Body: CreateInventoryInput }>,
  reply: FastifyReply
) => {
  try {
    const inventory = await createInventory(request.body);
    return reply.status(201).send(inventory);
  } catch (e) {
    throw new AppError('Error creating inventory', 500);
  }
};

export const getAllInventoriesHandler = async (
  request: FastifyRequest<{ Querystring: GetAllInventoriesInput['query'] }>,
  reply: FastifyReply
) => {
  try {
    const { page = 1, limit = 10 } = request.query;
    const inventories = await getAllInventories(page, limit);
    return reply.status(200).send(inventories);
  } catch (e) {
    throw new AppError('Error fetching inventories', 500);
  }
};

export const getInventoryByIdHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const inventory = await getInventoryById(request.params.id);
    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }
    return reply.status(200).send(inventory);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError('Error fetching inventory', 500);
  }
};

export const updateInventoryHandler = async (
  request: FastifyRequest<{ Body: UpdateInventoryInput['body']; Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const inventory = await updateInventory(request.params.id, request.body);
    return reply.status(200).send(inventory);
  } catch (e) {
    throw new AppError('Error updating inventory', 500);
  }
};

export const deleteInventoryHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    await deleteInventory(request.params.id);
    return reply.status(204).send();
  } catch (e) {
    throw new AppError('Error deleting inventory', 500);
  }
};

