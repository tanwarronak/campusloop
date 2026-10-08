import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    error = new AppError('Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier: ${err.value}`;
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new AppError(message, 409, 'DUPLICATE_KEY');
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message
    }));
    error = new AppError('Database validation failed', 400, 'VALIDATION_ERROR', messages);
  }

  if (err.name === 'MongooseError' && /buffering timed out|before initial connection/i.test(err.message)) {
    error = new AppError('Database unavailable. Check the MongoDB connection configuration.', 503, 'DATABASE_UNAVAILABLE');
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  // Log error with appropriate severity
  if (statusCode >= 500) {
    logger.error(
      {
        err: error,
        url: req.originalUrl,
        method: req.method,
        body: req.body
      },
      'Unhandled Server Error'
    );
  } else {
    logger.warn(
      {
        statusCode,
        message: error.message,
        url: req.originalUrl,
        method: req.method
      },
      'Operational Error Handled'
    );
  }

  const responsePayload = {
    success: false,
    message
  };

  if (error.errors && error.errors.length > 0) {
    responsePayload.errors = error.errors;
  }

  if (error.errorCode) {
    responsePayload.errorCode = error.errorCode;
  }

  if (env.NODE_ENV === 'development' && !error.isOperational) {
    responsePayload.stack = error.stack;
  }

  res.status(statusCode).json(responsePayload);
};
