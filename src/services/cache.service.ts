import { redisClient } from '@/config/redis';
import logger from '@/config/logger';

export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = CacheService.DEFAULT_TTL): Promise<boolean> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking cache key ${key}:`, error);
      return false;
    }
  }

  static async flush(): Promise<boolean> {
    try {
      await redisClient.flushAll();
      return true;
    } catch (error) {
      logger.error('Error flushing cache:', error);
      return false;
    }
  }

  static async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redisClient.mGet(keys);
      return values.map(val => (val ? (JSON.parse(val) as T) : null));
    } catch (error) {
      logger.error('Error getting multiple cache keys:', error);
      return keys.map(() => null);
    }
  }
}