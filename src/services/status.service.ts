import { Status } from '@prisma/client';
import { prisma } from '@/config/database';

export class StatusService {
  static async getAllStatuses(): Promise<Status[]> {
    return prisma.status.findMany();
  }
}

