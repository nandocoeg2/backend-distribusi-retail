import { createClient, RedisClientType } from 'redis';
import logger from '@/config/logger';

class RedisClient {
  private static instance: RedisClientType;

  public static getInstance(): RedisClientType {
    if (!RedisClient.instance) {
      RedisClient.instance = createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD || undefined,
      });

      RedisClient.instance.on('error', (error) => {
        logger.error('Redis Client Error:', error);
      });

      RedisClient.instance.on('connect', () => {
        logger.info('Redis client connected');
      });

      RedisClient.instance.on('ready', () => {
        logger.info('Redis client ready');
      });

      RedisClient.instance.on('end', () => {
        logger.info('Redis client disconnected');
      });
    }

    return RedisClient.instance;
  }
}

export const redisClient = RedisClient.getInstance();

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  await redisClient.disconnect();
  logger.info('Redis connection closed');
};