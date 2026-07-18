// ============================================================
// src/server.ts
// HTTP server entry point.
// Starts the server, handles graceful shutdown.
// ============================================================

import app from './app';
import { env } from './config/env';
import { disconnectPrisma } from './prisma/client';
import { logger } from './utils/logger';

const PORT = env.PORT;

// ---- Start Server ----
const server = app.listen(PORT, () => {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('   🏥  HMS Backend Server');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info(`  Environment : ${env.NODE_ENV}`);
  logger.info(`  Port        : ${PORT}`);
  logger.info(`  API Prefix  : ${env.API_PREFIX}`);
  logger.info(`  Health      : http://localhost:${PORT}${env.API_PREFIX}/health`);
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// ---- Graceful Shutdown ----
const shutdown = async (signal: string): Promise<void> => {
  logger.warn(`\n⚠️  Received ${signal}. Shutting down gracefully…`);

  server.close(async (err) => {
    if (err) {
      logger.error('Error while closing HTTP server:', err);
      process.exit(1);
    }

    try {
      await disconnectPrisma();
      logger.info('✅ Prisma disconnected.');
    } catch (e) {
      logger.error('Error disconnecting Prisma:', e);
    }

    logger.info('✅ Server shut down cleanly. Goodbye.');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('⏱️  Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10_000);
};

// ---- Process Signal Handlers ----
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ---- Unhandled Errors ----
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('💥 Unhandled Promise Rejection:', reason);
  // Don't crash in development — crash in production to let the process manager restart
  if (env.NODE_ENV === 'production') {
    shutdown('unhandledRejection');
  }
});

process.on('uncaughtException', (err: Error) => {
  logger.error('💥 Uncaught Exception:', err);
  shutdown('uncaughtException');
});

export default server;
