import { PrismaClient } from '@prisma/client';
import logger from './logger';

class Database {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ],
      });

      // Log database queries in development
      if (process.env.NODE_ENV === 'development') {
        Database.instance.$on('query', (e) => {
          logger.debug('Database Query:', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
          });
        });
      }

      Database.instance.$on('error', (e) => {
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