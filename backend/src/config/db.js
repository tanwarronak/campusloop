import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    if (env.MONGODB_URI.includes('<') || env.MONGODB_URI.includes('>')) {
      throw new Error('MONGODB_URI still contains an unresolved placeholder.');
    }

    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });

    isConnected = true;
    logger.info(`📦 MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Attempting reconnection...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to connect to MongoDB');
    isConnected = false;
    // In development/test mode, allow server to run for health check inspection
    if (env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
};

export const disconnectDB = async () => {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error({ err: error }, 'Error disconnecting from MongoDB');
  }
};

export const getDbStatus = () => {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
};
