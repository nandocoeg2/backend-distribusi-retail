jest.mock('@/config/database', () => ({
  prisma: {
    fileUploaded: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

import { FileService } from '@/services/file.service';
import { AppError } from '@/utils/app-error';

const { prisma } = require('@/config/database');
const fs = require('fs/promises');

describe('FileService', () => {
  const metadata = {
    id: 'file-1',
    filename: 'test.txt',
    mimetype: 'text/plain',
    path: '/tmp/test.txt',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns file buffer and metadata when found', async () => {
    (prisma.fileUploaded.findUnique as jest.Mock).mockResolvedValue(metadata);
    (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('hello'));

    const result = await FileService.downloadFile('file-1');

    expect(prisma.fileUploaded.findUnique).toHaveBeenCalledWith({ where: { id: 'file-1' } });
    expect(fs.readFile).toHaveBeenCalledWith('/tmp/test.txt');
    expect(result).toEqual({ file: Buffer.from('hello'), filename: 'test.txt', mimetype: 'text/plain' });
  });

  it('throws AppError when metadata is missing', async () => {
    (prisma.fileUploaded.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(FileService.downloadFile('missing')).rejects.toThrow(new AppError('File not found in database', 404));
  });

  it('throws AppError when file missing on disk', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    (prisma.fileUploaded.findUnique as jest.Mock).mockResolvedValue(metadata);
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

    await expect(FileService.downloadFile('file-1')).rejects.toThrow(new AppError('File not found on disk', 404));
    expect(console.error).toHaveBeenCalledWith(
      'File not found on disk for id: file-1 at path: /tmp/test.txt'
    );
  });
});
