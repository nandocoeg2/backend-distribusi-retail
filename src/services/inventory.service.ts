import { prisma } from '@/config/database';
import { Inventory } from '@prisma/client';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const createInventory = async (input: CreateInventoryInput) => {
  return prisma.inventory.create({
    data: input,
  });
};

export const getAllInventories = async (page: number = 1, limit: number = 10): Promise<PaginatedResult<Inventory>> => {
  const skip = (page - 1) * limit;
  
  const [data, totalItems] = await Promise.all([
    prisma.inventory.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.inventory.count(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    },
  };
};

export const getInventoryById = async (id: string) => {
  return prisma.inventory.findUnique({
    where: { id },
  });
};

export const updateInventory = async (id: string, data: UpdateInventoryInput['body']) => {
  return prisma.inventory.update({
    where: { id },
    data,
  });
};

export const deleteInventory = async (id: string) => {
  return prisma.inventory.delete({
    where: { id },
  });
};

