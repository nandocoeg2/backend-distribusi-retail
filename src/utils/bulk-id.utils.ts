import { randomBytes } from 'crypto';

/**
 * Generate bulk ID dengan prefix berdasarkan category
 * @param category - Category untuk bulk ID (e.g., 'po', 'lpb')
 * @returns Bulk ID dengan format: bulk_{category}_{random_cuid}
 */
export function generateBulkId(category: string): string {
  // Generate random string menggunakan crypto
  const randomString = randomBytes(8).toString('hex');
  
  // Format: bulk_{category}_{random_string}
  return `bulk_${category}_${randomString}`;
}

/**
 * Generate bulk ID untuk Purchase Order
 * @returns Bulk ID dengan format: bulk_po_{random_string}
 */
export function generateBulkPoId(): string {
  return generateBulkId('po');
}

/**
 * Generate bulk ID untuk Laporan Penerimaan Barang
 * @returns Bulk ID dengan format: bulk_lpb_{random_string}
 */
export function generateBulkLpbId(): string {
  return generateBulkId('lpb');
}

/**
 * Extract category dari bulk ID
 * @param bulkId - Bulk ID yang akan di-parse
 * @returns Category string atau null jika tidak valid
 */
export function extractCategoryFromBulkId(bulkId: string): string | null {
  const match = bulkId.match(/^bulk_([^_]+)_/);
  return match ? match[1]! : null;
}

/**
 * Validate bulk ID format
 * @param bulkId - Bulk ID yang akan divalidasi
 * @returns true jika format valid, false jika tidak
 */
export function isValidBulkId(bulkId: string): boolean {
  return /^bulk_[^_]+_[a-f0-9]+$/.test(bulkId);
}
