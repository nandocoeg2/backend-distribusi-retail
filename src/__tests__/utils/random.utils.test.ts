import { 
  generatePackingNumber, 
  generateRandomString, 
  generateFilenameWithPrefix,
  generateSuratJalanNumber,
  generateUniqueInvoiceNumber,
  generateUniqueSuratJalanWithCreate,
  generateUniquePackingNumber,
  generateUniqueDocumentNumber,
  generateUniqueDocumentWithCreate,
  DOCUMENT_CONFIGS,
  isValidPackingNumberFormat 
} from '@/utils/random.utils';

describe('random.utils', () => {
  describe('generatePackingNumber', () => {
    it('should generate a valid packing number format', () => {
      const packingNumber = generatePackingNumber('PO-2024-001');
      expect(packingNumber).toMatch(/^PN-\d{8}-PO-2024-001-[A-Z0-9]{4}$/);
    });

    it('should generate unique packing numbers', () => {
      const packingNumber1 = generatePackingNumber('PO-2024-001');
      const packingNumber2 = generatePackingNumber('PO-2024-001');
      expect(packingNumber1).not.toBe(packingNumber2);
    });

    it('should generate packing number without PO number when not provided', () => {
      const packingNumber = generatePackingNumber();
      expect(packingNumber).toMatch(/^PN-\d{8}-[A-Z0-9]{4}$/);
    });
  });

  describe('isValidPackingNumberFormat', () => {
    it('should validate correct packing number formats', () => {
      // Old format
      expect(isValidPackingNumberFormat('PN-20240101-AB12')).toBe(true);
      expect(isValidPackingNumberFormat('PN-20241225-XY9Z')).toBe(true);
      
      // New format with PO number and suffix
      expect(isValidPackingNumberFormat('PN-20240101-PO-2024-001-AB12')).toBe(true);
      expect(isValidPackingNumberFormat('PN-20241225-PO-2024-002-XY9Z')).toBe(true);
      
      // New format with PO number (base format)
      expect(isValidPackingNumberFormat('PN-20240101-PO-2024-001')).toBe(true);
      expect(isValidPackingNumberFormat('PN-20241225-PO-BULK-001')).toBe(true);
    });

    it('should reject invalid packing number formats', () => {
      expect(isValidPackingNumberFormat('P-20240101-AB12')).toBe(false);
      expect(isValidPackingNumberFormat('PN-2024101-AB12')).toBe(false);
      expect(isValidPackingNumberFormat('PN-20240101-AB1')).toBe(false);
      expect(isValidPackingNumberFormat('PN-20240101-ab12')).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('should generate random hex string of specified length', () => {
      const randomString1 = generateRandomString(2);
      const randomString2 = generateRandomString(4);
      
      expect(randomString1).toHaveLength(4); // 2 bytes = 4 hex characters
      expect(randomString2).toHaveLength(8); // 4 bytes = 8 hex characters
      expect(randomString1).toMatch(/^[0-9a-f]{4}$/);
      expect(randomString2).toMatch(/^[0-9a-f]{8}$/);
    });

    it('should generate different strings', () => {
      const str1 = generateRandomString(2);
      const str2 = generateRandomString(2);
      expect(str1).not.toBe(str2);
    });
  });

  describe('generateFilenameWithPrefix', () => {
    it('should generate filename with prefix and random string', () => {
      const filename = generateFilenameWithPrefix('PO', 'document.pdf');
      expect(filename).toMatch(/^PO_document_[0-9a-f]{4}\.pdf$/);
    });

    it('should handle filename without extension', () => {
      const filename = generateFilenameWithPrefix('BULK', 'document');
      expect(filename).toMatch(/^BULK_document_[0-9a-f]{4}$/);
    });

    it('should handle filename with multiple dots', () => {
      const filename = generateFilenameWithPrefix('TEST', 'file.backup.csv');
      expect(filename).toMatch(/^TEST_file\.backup_[0-9a-f]{4}\.csv$/);
    });
  });

  describe('generateSuratJalanNumber', () => {
    it('should generate surat jalan number with correct format', () => {
      const poNumber = 'PO-2024-001';
      const sjNumber = generateSuratJalanNumber(poNumber);
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format
      
      expect(sjNumber).toMatch(new RegExp(`^SJ-${dateStr}-${poNumber}-[0-9A-F]{4}$`));
    });

    it('should generate different surat jalan numbers for same PO', () => {
      const poNumber = 'PO-2024-001';
      const sjNumber1 = generateSuratJalanNumber(poNumber);
      const sjNumber2 = generateSuratJalanNumber(poNumber);
      
      expect(sjNumber1).not.toBe(sjNumber2);
    });

    it('should use specified random bytes length', () => {
      const poNumber = 'PO-2024-001';
      const sjNumber = generateSuratJalanNumber(poNumber, 3);
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format
      
      expect(sjNumber).toMatch(new RegExp(`^SJ-${dateStr}-${poNumber}-[0-9A-F]{6}$`)); // 3 bytes = 6 hex chars
    });
  });

  describe('generateUniqueInvoiceNumber', () => {
    it('should generate unique invoice number using base format when first attempt is unique', async () => {
      const poNumber = 'PO-2024-001';
      const mockCheckUnique = jest.fn().mockResolvedValue(true); // First attempt is unique
      
      const invoiceNumber = await generateUniqueInvoiceNumber(poNumber, mockCheckUnique);
      const currentDate = new Date();
      const expectedBase = `INV-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${poNumber}`;
      
      expect(invoiceNumber).toBe(expectedBase);
      expect(mockCheckUnique).toHaveBeenCalledTimes(1);
      expect(mockCheckUnique).toHaveBeenCalledWith(expectedBase);
    });

    it('should generate invoice number with random suffix when base is not unique', async () => {
      const poNumber = 'PO-2024-001';
      const mockCheckUnique = jest.fn()
        .mockResolvedValueOnce(false) // Base format is not unique
        .mockResolvedValueOnce(true);  // Second attempt with suffix is unique
      
      const invoiceNumber = await generateUniqueInvoiceNumber(poNumber, mockCheckUnique);
      const currentDate = new Date();
      const expectedBase = `INV-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${poNumber}`;
      
      expect(invoiceNumber).toMatch(new RegExp(`^${expectedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-[0-9A-F]{4}$`));
      expect(mockCheckUnique).toHaveBeenCalledTimes(2);
    });

    it('should keep trying until unique number is found', async () => {
      const poNumber = 'PO-2024-001';
      const mockCheckUnique = jest.fn()
        .mockResolvedValueOnce(false) // First attempt fails
        .mockResolvedValueOnce(false) // Second attempt fails
        .mockResolvedValueOnce(true);  // Third attempt succeeds
      
      const invoiceNumber = await generateUniqueInvoiceNumber(poNumber, mockCheckUnique);
      
      expect(invoiceNumber).toBeTruthy();
      expect(mockCheckUnique).toHaveBeenCalledTimes(3);
    });
  });

  describe('generateUniqueSuratJalanWithCreate', () => {
    it('should successfully create surat jalan on first attempt', async () => {
      const poNumber = 'PO-2024-001';
      const mockResult = { id: '123', no_surat_jalan: 'SJ-20240914-PO-2024-001' };
      const mockCreateCallback = jest.fn().mockResolvedValue(mockResult);
      
      const result = await generateUniqueSuratJalanWithCreate(poNumber, mockCreateCallback);
      
      expect(result).toBe(mockResult);
      expect(mockCreateCallback).toHaveBeenCalledTimes(1);
      // First attempt should be base format without random suffix
      expect(mockCreateCallback).toHaveBeenCalledWith(expect.stringMatching(/^SJ-\d{8}-PO-2024-001$/));
    });

    it('should retry with increased randomness on constraint violation', async () => {
      const poNumber = 'PO-2024-001';
      const mockResult = { id: '123', no_surat_jalan: 'SJ-20240914-PO-2024-001-ABCDEF' };
      
      // First attempt fails with constraint violation, second succeeds
      const constraintError = new Error('Unique constraint violation');
      (constraintError as any).code = 'P2002';
      (constraintError as any).meta = { target: ['no_surat_jalan'] };
      
      const mockCreateCallback = jest.fn()
        .mockRejectedValueOnce(constraintError)
        .mockResolvedValueOnce(mockResult);
      
      const result = await generateUniqueSuratJalanWithCreate(poNumber, mockCreateCallback);
      
      expect(result).toBe(mockResult);
      expect(mockCreateCallback).toHaveBeenCalledTimes(2);
      // Second call should have more random characters (3 bytes = 6 hex chars)
      expect(mockCreateCallback).toHaveBeenNthCalledWith(2, expect.stringMatching(/^SJ-\d{8}-PO-2024-001-[0-9A-F]{6}$/));
    });

    it('should throw non-constraint errors immediately', async () => {
      const poNumber = 'PO-2024-001';
      const otherError = new Error('Database connection error');
      const mockCreateCallback = jest.fn().mockRejectedValue(otherError);
      
      await expect(generateUniqueSuratJalanWithCreate(poNumber, mockCreateCallback))
        .rejects.toThrow('Database connection error');
      
      expect(mockCreateCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateUniquePackingNumber', () => {
    it('should generate unique packing number using standardized approach', async () => {
      const mockCheckUnique = jest.fn().mockResolvedValue(true); // First attempt is unique
      const poNumber = 'PO-2024-001';
      
      const packingNumber = await generateUniquePackingNumber(mockCheckUnique, poNumber);
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
      
      // First attempt should be base format without random suffix
      expect(packingNumber).toBe(`PN-${dateStr}-${poNumber}`);
      expect(mockCheckUnique).toHaveBeenCalledTimes(1);
    });

    it('should retry until unique packing number is found', async () => {
      const poNumber = 'PO-2024-001';
      const mockCheckUnique = jest.fn()
        .mockResolvedValueOnce(false) // First attempt fails
        .mockResolvedValueOnce(true);  // Second attempt succeeds
      
      const packingNumber = await generateUniquePackingNumber(mockCheckUnique, poNumber);
      
      expect(packingNumber).toBeTruthy();
      expect(mockCheckUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateUniqueDocumentNumber', () => {
    it('should generate unique document number with custom config', async () => {
      const customConfig = {
        prefix: 'TEST',
        includeDate: true,
        dateFormat: 'YYYYMMDD' as const,
        includePONumber: true,
        randomBytesLength: 3
      };
      const poNumber = 'PO-2024-001';
      const mockCheckUnique = jest.fn().mockResolvedValue(true);
      
      const documentNumber = await generateUniqueDocumentNumber(customConfig, mockCheckUnique, poNumber);
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
      
      expect(documentNumber).toBe(`TEST-${dateStr}-${poNumber}`);
      expect(mockCheckUnique).toHaveBeenCalledTimes(1);
    });

    it('should add random suffix when base number is not unique', async () => {
      const config = DOCUMENT_CONFIGS.INVOICE;
      const poNumber = 'PO-2024-001';
      const mockCheckUnique = jest.fn()
        .mockResolvedValueOnce(false) // Base format is not unique
        .mockResolvedValueOnce(true);  // Second attempt with suffix is unique
      
      const documentNumber = await generateUniqueDocumentNumber(config, mockCheckUnique, poNumber);
      const currentDate = new Date();
      const expectedBase = `INV-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${poNumber}`;
      
      expect(documentNumber).toMatch(new RegExp(`^${expectedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-[0-9A-F]{4}$`));
      expect(mockCheckUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateUniqueDocumentWithCreate', () => {
    it('should successfully create document on first attempt', async () => {
      const config = DOCUMENT_CONFIGS.SURAT_JALAN;
      const poNumber = 'PO-2024-001';
      const mockResult = { id: '123', no_document: 'SJ-20250914-PO-2024-001' };
      const mockCreateCallback = jest.fn().mockResolvedValue(mockResult);
      
      const result = await generateUniqueDocumentWithCreate(config, mockCreateCallback, poNumber);
      
      expect(result).toBe(mockResult);
      expect(mockCreateCallback).toHaveBeenCalledTimes(1);
    });

    it('should retry with increased randomness on constraint violation', async () => {
      const config = DOCUMENT_CONFIGS.PACKING;
      const mockResult = { id: '123', packing_number: 'PN-20250914-ABCDEF' };
      
      // First attempt fails with constraint violation, second succeeds
      const constraintError = new Error('Unique constraint violation');
      (constraintError as any).code = 'P2002';
      
      const mockCreateCallback = jest.fn()
        .mockRejectedValueOnce(constraintError)
        .mockResolvedValueOnce(mockResult);
      
      const result = await generateUniqueDocumentWithCreate(config, mockCreateCallback);
      
      expect(result).toBe(mockResult);
      expect(mockCreateCallback).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      const config = DOCUMENT_CONFIGS.INVOICE;
      const poNumber = 'PO-2024-001';
      const constraintError = new Error('Unique constraint violation');
      (constraintError as any).code = 'P2002';
      const mockCreateCallback = jest.fn().mockRejectedValue(constraintError);
      
      await expect(generateUniqueDocumentWithCreate(config, mockCreateCallback, poNumber, 2))
        .rejects.toThrow('Failed to generate unique document number after 2 attempts');
      
      expect(mockCreateCallback).toHaveBeenCalledTimes(2);
    });
  });
});