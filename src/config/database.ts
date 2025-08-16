import { PrismaClient } from '@prisma/client';
import logger from '@/config/logger';

class Database {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: ['query', 'error', 'info', 'warn'],
      });

      // Log database queries in development
      if (process.env.NODE_ENV === 'development') {
        (Database.instance as any).$on('query', (e: any) => {
          logger.debug('Database Query:', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
          });
        });
      }

      (Database.instance as any).$on('error', (e: any) => {
        logger.error('Database Error:', e);
      });
    }

    return Database.instance;
  }
}

export const prisma = Database.getInstance();

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
};
