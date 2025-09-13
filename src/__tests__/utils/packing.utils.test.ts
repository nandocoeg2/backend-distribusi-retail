import { generatePackingNumber, isValidPackingNumberFormat } from '@/utils/packing.utils';

describe('Packing Utils', () => {
  describe('generatePackingNumber', () => {
    it('should generate packing number with correct format', () => {
      const packingNumber = generatePackingNumber();
      
      // Should match PN-YYYYMMDD-XXXX format
      expect(packingNumber).toMatch(/^PN-\d{8}-[A-Z0-9]{4}$/);
    });

    it('should generate different packing numbers on multiple calls', () => {
      const numbers = Array.from({ length: 10 }, () => generatePackingNumber());
      const uniqueNumbers = new Set(numbers);
      
      // Should have high probability of being unique (allowing for rare collisions)
      expect(uniqueNumbers.size).toBeGreaterThan(8);
    });

    it('should include current date in the packing number', () => {
      const packingNumber = generatePackingNumber();
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      expect(packingNumber).toContain(`PN-${today}-`);
    });
  });

  describe('isValidPackingNumberFormat', () => {
    it('should return true for valid packing number format', () => {
      const validNumbers = [
        'PN-20250113-ABCD',
        'PN-20250113-1234',
        'PN-20250113-A1B2',
        'PN-20250113-X9Y8',
      ];

      validNumbers.forEach(number => {
        expect(isValidPackingNumberFormat(number)).toBe(true);
      });
    });

    it('should return false for invalid packing number format', () => {
      const invalidNumbers = [
        'PN-20250113-abc', // lowercase
        'PN-20250113-ABCDE', // too long
        'PN-20250113-ABC', // too short
        'PN-2025-01-13-ABCD', // wrong date format
        'PKG-20250113-ABCD', // wrong prefix
        'PN-20250113-AB@D', // invalid character
        'PN-20250113', // missing random part
        '20250113-ABCD', // missing prefix
        '', // empty string
      ];

      invalidNumbers.forEach(number => {
        expect(isValidPackingNumberFormat(number)).toBe(false);
      });
    });
  });
});
