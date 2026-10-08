import { getDbStatus } from '../config/db.js';
import { env } from '../config/env.js';

export const getHealth = (req, res) => {
  const dbStatus = getDbStatus();

  res.status(200).json({
    success: true,
    message: 'CampusLoop API is running',
    data: {
      database: dbStatus,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
};
