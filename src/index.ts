import dotenv from 'dotenv';
import { createApp } from '@/app';
import logger from '@/config/logger';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
// Background processing is now handled automatically in the upload process

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

    // Background processing is now handled automatically during upload
    // No need for periodic background jobs as processing starts immediately
    logger.info('Background processing is handled automatically during file upload');

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
