import dotenv from 'dotenv';
import { createApp } from '@/app';
import logger from '@/config/logger';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { BulkPurchaseOrderService } from '@/services/bulk-purchase-order.service';

// Load environment variables
dotenv.config();

const start = async () => {
  try {
    // Initialize database connection
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize Redis connection
    await connectRedis();
    logger.info('Redis connected successfully');

    // Create Fastify app
    const app = await createApp();

    // Start server
    const port = parseInt(process.env.PORT || '5050', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    logger.info(`Server running on http://${host}:${port}`);
    logger.info(
      `Swagger documentation available at http://${host}:${port}`
    );

    // Start background job for bulk PO processing
    setInterval(() => {
      logger.info('Running bulk PO processing job...');
      BulkPurchaseOrderService.processPendingFiles().catch((error) => {
        logger.error('Error in bulk PO processing job:', error);
      });
    }, 30000); // every 30 seconds

  } catch (error) {    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

start();
