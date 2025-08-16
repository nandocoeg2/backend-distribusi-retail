import bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from '@/utils/password.utils';

jest.mock('bcrypt');

describe('password.utils', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      const password = 'password';
      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'password';
      const hash = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'password';
      const hash = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });
  });
});