import { prisma } from '@/config/database';
import fs from 'fs/promises';
import { AppError } from '@/utils/app-error';

export class FileService {
  static async downloadFile(id: string): Promise<{ file: Buffer; filename: string; mimetype: string }> {
    const fileMetadata = await prisma.fileUploaded.findUnique({
      where: { id },
    });

    if (!fileMetadata) {
      throw new AppError('File not found in database', 404);
    }

    const filePath = fileMetadata.path;

    try {
      const file = await fs.readFile(filePath);
      return {
        file,
        filename: fileMetadata.filename,
        mimetype: fileMetadata.mimetype,
      };
    } catch (error) {
      console.error(`File not found on disk for id: ${id} at path: ${filePath}`);
      throw new AppError('File not found on disk', 404);
    }
  }
}
