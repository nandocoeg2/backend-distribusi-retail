import { prisma } from '@/config/database';
import fs from 'fs/promises';
import path from 'path';

export class FileService {
  static async downloadFile(id: string): Promise<{ file: Buffer; filename: string; mimetype: string } | null> {
    const fileMetadata = await prisma.fileUploaded.findUnique({
      where: { id },
    });

    console.log(fileMetadata);

    if (!fileMetadata) {
      return null;
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
      return null;
    }
  }
}
