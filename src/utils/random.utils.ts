import { randomBytes } from 'crypto';

/**
 * Utility functions for random string generation and standardized unique ID generation
 */

/**
 * Document type configurations for unique ID generation
 */
export interface DocumentConfig {
  prefix: string;
  includeDate: boolean;
  dateFormat: 'YYYYMMDD' | 'YYYY-MM';
  includePONumber?: boolean;
  randomBytesLength: number;
}

/**
 * Predefined document configurations
 */
export const DOCUMENT_CONFIGS = {
  INVOICE: {
    prefix: 'INV',
    includeDate: true,
    dateFormat: 'YYYY-MM' as const,
    includePONumber: true,
    randomBytesLength: 2
  },
  SURAT_JALAN: {
    prefix: 'SJ',
    includeDate: true,
    dateFormat: 'YYYYMMDD' as const,
    includePONumber: true,
    randomBytesLength: 2
  },
  PACKING: {
    prefix: 'PN',
    includeDate: true,
    dateFormat: 'YYYYMMDD' as const,
    includePONumber: true,
    randomBytesLength: 2
  }
} as const;

/**
 * Formats date according to specified format
 * @param {Date} date - Date to format
 * @param {'YYYYMMDD' | 'YYYY-MM'} format - Format type
 * @returns {string} Formatted date string
 */
function formatDate(date: Date, format: 'YYYYMMDD' | 'YYYY-MM'): string {
  if (format === 'YYYYMMDD') {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}

/**
 * Generates base document number according to configuration
 * @param {DocumentConfig} config - Document configuration
 * @param {string} poNumber - Purchase order number (optional)
 * @returns {string} Base document number
 */
function generateBaseDocumentNumber(config: DocumentConfig, poNumber?: string): string {
  const parts = [config.prefix];
  
  if (config.includeDate) {
    const dateStr = formatDate(new Date(), config.dateFormat);
    parts.push(dateStr);
  }
  
  if (config.includePONumber && poNumber) {
    parts.push(poNumber);
  }
  
  return parts.join('-');
}

/**
 * Generates random suffix for document number
 * @param {number} bytesLength - Number of bytes for random string
 * @returns {string} Random suffix in uppercase
 */
function generateRandomSuffix(bytesLength: number): string {
  return generateRandomString(bytesLength).toUpperCase();
}

/**
 * Generic function for generating unique document numbers with callback approach
 * @param {DocumentConfig} config - Document configuration
 * @param {function} checkUniqueCallback - Async function that checks if the number is unique
 * @param {string} poNumber - Purchase order number (optional)
 * @returns {Promise<string>} Generated unique document number
 */
export async function generateUniqueDocumentNumber(
  config: DocumentConfig,
  checkUniqueCallback: (documentNumber: string) => Promise<boolean>,
  poNumber?: string
): Promise<string> {
  const baseNumber = generateBaseDocumentNumber(config, poNumber);
  let attempts = 0;
  let documentNumber: string = baseNumber;
  let isUnique = false;

  while (!isUnique) {
    if (attempts === 0) {
      documentNumber = baseNumber;
    } else {
      const randomSuffix = generateRandomSuffix(config.randomBytesLength);
      documentNumber = `${baseNumber}-${randomSuffix}`;
    }
    
    isUnique = await checkUniqueCallback(documentNumber);
    attempts++;
  }

  return documentNumber;
}

/**
 * Generic function for generating unique document numbers with create callback approach
 * @param {DocumentConfig} config - Document configuration
 * @param {function} createCallback - Async function that attempts to create the record
 * @param {string} poNumber - Purchase order number (optional)
 * @param {number} maxRetries - Maximum number of retries (default: 10)
 * @returns {Promise<any>} Created record result
 */
export async function generateUniqueDocumentWithCreate(
  config: DocumentConfig,
  createCallback: (documentNumber: string) => Promise<any>,
  poNumber?: string,
  maxRetries: number = 10
): Promise<any> {
  let isUnique = false;
  let randomBytesLength = config.randomBytesLength;
  let result: any;
  let retries = 0;

  while (!isUnique && retries < maxRetries) {
    const baseNumber = generateBaseDocumentNumber(config, poNumber);
    let documentNumber: string;
    
    if (retries === 0) {
      documentNumber = baseNumber;
    } else {
      const randomSuffix = generateRandomSuffix(randomBytesLength);
      documentNumber = `${baseNumber}-${randomSuffix}`;
    }
    
    try {
      result = await createCallback(documentNumber);
      isUnique = true; // Success, exit loop
    } catch (error: any) {
      if (error.code === 'P2002') {
        retries++;
        // Increase randomness for next attempt
        randomBytesLength = Math.min(randomBytesLength + 1, 8);
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  if (!isUnique) {
    throw new Error(`Failed to generate unique document number after ${maxRetries} attempts`);
  }

  return result;
}

/**
 * Generates a unique packing number using standardized approach
 * @param {function} checkUniqueCallback - Async function that checks if the number is unique
 * @param {string} poNumber - Purchase order number (optional)
 * @returns {Promise<string>} Generated unique packing number
 */
export async function generateUniquePackingNumber(
  checkUniqueCallback: (packingNumber: string) => Promise<boolean>,
  poNumber?: string
): Promise<string> {
  const config = DOCUMENT_CONFIGS.PACKING;
  return generateUniqueDocumentNumber(config, checkUniqueCallback, poNumber);
}

/**
 * Legacy function for backward compatibility - generates packing number with format PN-YYYYMMDD-{PO_NUMBER}-XXXX
 * @deprecated Use generateUniquePackingNumber with callback instead
 * @param {string} poNumber - Purchase order number (optional)
 * @returns {string} Generated packing number
 */
export function generatePackingNumber(poNumber?: string): string {
  const config = DOCUMENT_CONFIGS.PACKING;
  const baseNumber = generateBaseDocumentNumber(config, poNumber);
  const randomSuffix = generateRandomSuffix(config.randomBytesLength);
  return `${baseNumber}-${randomSuffix}`;
}

/**
 * Validates if a string matches the packing number format
 * @param {string} packingNumber - The packing number to validate
 * @returns {boolean} True if format is valid
 */
export function isValidPackingNumberFormat(packingNumber: string): boolean {
  // Support both old format (PN-YYYYMMDD-XXXX) and new format (PN-YYYYMMDD-PO-NUMBER-XXXX)
  const oldFormatRegex = /^PN-\d{8}-[A-Z0-9]{4}$/;
  const newFormatWithSuffixRegex = /^PN-\d{8}-PO-.+[^-]-[A-F0-9]{4}$/;
  const baseFormatRegex = /^PN-\d{8}-PO-.+[^-]$/; // Base format without suffix
  
  return oldFormatRegex.test(packingNumber) || newFormatWithSuffixRegex.test(packingNumber) || baseFormatRegex.test(packingNumber);
}

/**
 * Generates a random string using crypto.randomBytes
 * @param {number} bytes - Number of bytes to generate (default: 2)
 * @returns {string} Random hex string
 */
export function generateRandomString(bytes: number = 2): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Generates a filename with prefix and random string
 * @param {string} prefix - Prefix for the filename (e.g., 'PO', 'BULK_PO')
 * @param {string} originalFilename - Original filename
 * @param {number} randomBytes - Number of random bytes to generate (default: 2)
 * @returns {string} Generated filename with format: PREFIX_BASENAME_RANDOM.EXTENSION
 */
export function generateFilenameWithPrefix(
  prefix: string,
  originalFilename: string,
  randomBytesLength: number = 2
): string {
  const randomString = generateRandomString(randomBytesLength);
  const filenameParts = originalFilename.split('.');
  
  if (filenameParts.length === 1) {
    // File without extension
    return `${prefix}_${originalFilename}_${randomString}.${originalFilename}`;
  }
  
  const extension = filenameParts.pop();
  const basename = filenameParts.join('.');
  
  return `${prefix}_${basename}_${randomString}.${extension}`;
}

/**
 * Generates a unique invoice number using standardized approach
 * @param {string} poNumber - Purchase order number
 * @param {function} checkUniqueCallback - Async function that checks if the number is unique
 * @returns {Promise<string>} Generated unique invoice number
 */
export async function generateUniqueInvoiceNumber(
  poNumber: string,
  checkUniqueCallback: (invoiceNumber: string) => Promise<boolean>
): Promise<string> {
  const config = DOCUMENT_CONFIGS.INVOICE;
  return generateUniqueDocumentNumber(config, checkUniqueCallback, poNumber);
}

/**
 * Generates a unique surat jalan number using standardized approach
 * @param {string} poNumber - Purchase order number
 * @param {number} randomBytesLength - Number of random bytes to generate (default: 2)
 * @returns {string} Generated surat jalan number
 */
export function generateSuratJalanNumber(
  poNumber: string,
  randomBytesLength: number = 2
): string {
  const config = { ...DOCUMENT_CONFIGS.SURAT_JALAN, randomBytesLength };
  const baseNumber = generateBaseDocumentNumber(config, poNumber);
  const randomSuffix = generateRandomSuffix(randomBytesLength);
  return `${baseNumber}-${randomSuffix}`;
}

/**
 * Generates a unique surat jalan using standardized approach with create callback
 * @param {string} poNumber - Purchase order number
 * @param {function} createCallback - Async function that attempts to create the record
 * @param {number} initialRandomBytesLength - Initial random bytes length (default: 2)
 * @returns {Promise<any>} Created record result
 */
export async function generateUniqueSuratJalanWithCreate(
  poNumber: string,
  createCallback: (suratJalanNumber: string) => Promise<any>,
  initialRandomBytesLength: number = 2
): Promise<any> {
  const config = { ...DOCUMENT_CONFIGS.SURAT_JALAN, randomBytesLength: initialRandomBytesLength };
  return generateUniqueDocumentWithCreate(config, createCallback, poNumber);
}