import { 
  generatePackingNumber, 
  isValidPackingNumberFormat,
  generateRandomString,
  generateFilenameWithPrefix
} from '@/utils/random.utils';

describe('Random Utils', () => {
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

  describe('generateRandomString', () => {
    it('should generate random hex string with default 2 bytes', () => {
      const randomString = generateRandomString();
      
      // 2 bytes should result in 4 hex characters
      expect(randomString).toMatch(/^[a-f0-9]{4}$/);
    });

    it('should generate random hex string with custom byte length', () => {
      const randomString = generateRandomString(3);
      
      // 3 bytes should result in 6 hex characters
      expect(randomString).toMatch(/^[a-f0-9]{6}$/);
    });

    it('should generate different strings on multiple calls', () => {
      const strings = Array.from({ length: 10 }, () => generateRandomString());
      const uniqueStrings = new Set(strings);
      
      // Should have high probability of being unique
      expect(uniqueStrings.size).toBeGreaterThan(8);
    });
  });

  describe('generateFilenameWithPrefix', () => {
    it('should generate filename with correct prefix and random string', () => {
      const filename = generateFilenameWithPrefix('PO', 'document.pdf');
      
      // Should match PREFIX_BASENAME_RANDOM.EXTENSION format
      expect(filename).toMatch(/^PO_document_[a-f0-9]{4}\.pdf$/);
    });

    it('should work with different prefixes', () => {
      const filename = generateFilenameWithPrefix('BULK_PO', 'invoice.xlsx');
      
      expect(filename).toMatch(/^BULK_PO_invoice_[a-f0-9]{4}\.xlsx$/);
    });

    it('should handle files without extension', () => {
      const filename = generateFilenameWithPrefix('TEST', 'readme');
      
      expect(filename).toMatch(/^TEST_readme_[a-f0-9]{4}\.readme$/);
    });

    it('should handle custom random bytes length', () => {
      const filename = generateFilenameWithPrefix('PO', 'test.pdf', 3);
      
      // 3 bytes should result in 6 hex characters
      expect(filename).toMatch(/^PO_test_[a-f0-9]{6}\.pdf$/);
    });

    it('should generate different filenames for same input', () => {
      const filenames = Array.from({ length: 10 }, () => 
        generateFilenameWithPrefix('PO', 'document.pdf')
      );
      const uniqueFilenames = new Set(filenames);
      
      // Should have high probability of being unique
      expect(uniqueFilenames.size).toBeGreaterThan(8);
    });
  });
});