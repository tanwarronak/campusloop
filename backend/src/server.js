import app from './app.js';
import { createServer } from 'node:http';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { sessionMiddleware } from './app.js';
import { setupSocketServer } from './sockets/index.js';

let server;

const startServer = async () => {
  // Connect to Database
  const database = await connectDB();
  if (!database) {
    logger.error('Server startup aborted because MongoDB is unavailable. Check MONGODB_URI.');
    return;
  }

  // Start HTTP Listener
  server = createServer(app);
  const io = setupSocketServer(server, sessionMiddleware, env.CLIENT_URL);
  app.set('io', io);
  server.listen(env.PORT, () => {
    logger.info(
      `🚀 CampusLoop API Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`
    );
    logger.info(`🔗 Health endpoint: http://localhost:${env.PORT}/api/health`);
  });
};

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDB();
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });

    // Force close after 10 seconds timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled Promise Rejection detected! Initiating shutdown...');
  if (env.NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  }
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception detected! Initiating shutdown...');
  process.exit(1);
});

startServer();
