import { prisma } from '@/config/database';
import { Inventory, Prisma } from '@prisma/client';
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
  // Extract audit fields if present
  const { createdBy, updatedBy, ...inventoryData } = input;
  
  return prisma.inventory.create({
    data: {
      ...inventoryData,
      createdBy: createdBy || 'system',
      updatedBy: updatedBy || 'system',
    },
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

export const searchInventories = async (query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Inventory>> => {
  const skip = (page - 1) * limit;
  
  if (!query) {
    return getAllInventories(page, limit);
  }

  const filters: Prisma.InventoryWhereInput[] = [
    {
      nama_barang: {
        contains: query,
        mode: 'insensitive',
      },
    },
    {
      kode_barang: {
        contains: query,
        mode: 'insensitive',
      },
    },
  ];

  const [data, totalItems] = await Promise.all([
    prisma.inventory.findMany({
      where: {
        OR: filters,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.inventory.count({
      where: {
        OR: filters,
      },
    }),
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
  // First check if the inventory exists
  const existingInventory = await prisma.inventory.findUnique({
    where: { id },
  });
  
  if (!existingInventory) {
    return null; // Return null to indicate record not found
  }
  
  // Extract audit fields if present
  const { updatedBy, ...inventoryData } = data;
  
  return prisma.inventory.update({
    where: { id },
    data: {
      ...inventoryData,
      updatedBy: updatedBy || 'system',
    },
  });
};

export const deleteInventory = async (id: string) => {
  // First check if the inventory exists
  const existingInventory = await prisma.inventory.findUnique({
    where: { id },
  });
  
  if (!existingInventory) {
    return null; // Return null to indicate record not found
  }
  
  return prisma.inventory.delete({
    where: { id },
  });
};
