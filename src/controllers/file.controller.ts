import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../services/file.service';

export class FileController {
  static async downloadFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const fileData = await FileService.downloadFile(request.params.id);

    reply.header('Content-Disposition', `attachment; filename="${fileData.filename}"`);
    reply.type(fileData.mimetype);
    return reply.send(fileData.file);
  }
}
