import { CacheService } from '@/services/cache.service';
import { redisClient } from '@/config/redis';
import logger from '@/config/logger';

jest.mock('@/config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    flushAll: jest.fn(),
    mGet: jest.fn(),
  },
}));

jest.mock('@/config/logger', () => ({
  error: jest.fn(),
}));

describe('CacheService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return parsed value if key exists', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(value));

      const result = await CacheService.get(key);

      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it('should return null if key does not exist', async () => {
      const key = 'test-key';
      (redisClient.get as jest.Mock).mockResolvedValue(null);

      const result = await CacheService.get(key);

      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it('should return null and log error if redis fails', async () => {
      const key = 'test-key';
      const error = new Error('Redis error');
      (redisClient.get as jest.Mock).mockRejectedValue(error);

      const result = await CacheService.get(key);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(`Error getting cache key ${key}:`, error);
    });
  });

  describe('set', () => {
    it('should return true on successful set', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      const ttl = 3600;

      const result = await CacheService.set(key, value, ttl);

      expect(redisClient.setEx).toHaveBeenCalledWith(key, ttl, JSON.stringify(value));
      expect(result).toBe(true);
    });

    it('should return false and log error if redis fails', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      const error = new Error('Redis error');
      (redisClient.setEx as jest.Mock).mockRejectedValue(error);

      const result = await CacheService.set(key, value);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(`Error setting cache key ${key}:`, error);
    });
  });

  describe('del', () => {
    it('should return true on successful deletion', async () => {
      const key = 'test-key';

      const result = await CacheService.del(key);

      expect(redisClient.del).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('should return false and log error if redis fails', async () => {
      const key = 'test-key';
      const error = new Error('Redis error');
      (redisClient.del as jest.Mock).mockRejectedValue(error);

      const result = await CacheService.del(key);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(`Error deleting cache key ${key}:`, error);
    });
  });

  describe('exists', () => {
    it('should return true if key exists', async () => {
      const key = 'test-key';
      (redisClient.exists as jest.Mock).mockResolvedValue(1);

      const result = await CacheService.exists(key);

      expect(redisClient.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      const key = 'test-key';
      (redisClient.exists as jest.Mock).mockResolvedValue(0);

      const result = await CacheService.exists(key);

      expect(redisClient.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(false);
    });

    it('should return false and log error if redis fails', async () => {
      const key = 'test-key';
      const error = new Error('Redis error');
      (redisClient.exists as jest.Mock).mockRejectedValue(error);

      const result = await CacheService.exists(key);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(`Error checking cache key ${key}:`, error);
    });
  });

  describe('flush', () => {
    it('should return true on successful flush', async () => {
      const result = await CacheService.flush();

      expect(redisClient.flushAll).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false and log error if redis fails', async () => {
      const error = new Error('Redis error');
      (redisClient.flushAll as jest.Mock).mockRejectedValue(error);

      const result = await CacheService.flush();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error flushing cache:', error);
    });
  });

  describe('getMany', () => {
    it('should return an array of parsed values for existing keys', async () => {
      const keys = ['key1', 'key2'];
      const values = [{ data: 'data1' }, { data: 'data2' }];
      (redisClient.mGet as jest.Mock).mockResolvedValue(values.map(v => JSON.stringify(v)));

      const result = await CacheService.getMany(keys);

      expect(redisClient.mGet).toHaveBeenCalledWith(keys);
      expect(result).toEqual(values);
    });

    it('should return an array with null for non-existing keys', async () => {
      const keys = ['key1', 'key2'];
      (redisClient.mGet as jest.Mock).mockResolvedValue([JSON.stringify({ data: 'data1' }), null]);

      const result = await CacheService.getMany(keys);

      expect(result).toEqual([{ data: 'data1' }, null]);
    });

    it('should return an array of nulls and log error if redis fails', async () => {
      const keys = ['key1', 'key2'];
      const error = new Error('Redis error');
      (redisClient.mGet as jest.Mock).mockRejectedValue(error);

      const result = await CacheService.getMany(keys);

      expect(result).toEqual([null, null]);
      expect(logger.error).toHaveBeenCalledWith('Error getting multiple cache keys:', error);
    });
  });
});