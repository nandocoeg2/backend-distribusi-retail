import { PrismaClient } from '@prisma/client';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';

const prisma = new PrismaClient();

export const createInventory = async (input: CreateInventoryInput) => {
  return prisma.inventory.create({
    data: input,
  });
};

export const getAllInventories = async () => {
  return prisma.inventory.findMany();
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

