import { randomBytes } from 'crypto';

/**
 * Utility functions for random string generation and file naming
 */

/**
 * Generates a unique packing number with format PN-YYYYMMDD-XXXX
 * @returns {string} Generated packing number
 */
export function generatePackingNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
  return `PN-${dateStr}-${randomChars}`;
}

/**
 * Validates if a string matches the packing number format
 * @param {string} packingNumber - The packing number to validate
 * @returns {boolean} True if format is valid
 */
export function isValidPackingNumberFormat(packingNumber: string): boolean {
  const formatRegex = /^PN-\d{8}-[A-Z0-9]{4}$/;
  return formatRegex.test(packingNumber);
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