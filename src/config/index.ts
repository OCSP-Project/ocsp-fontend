// Application configuration

/**
 * Environment configuration
 */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  debugMode: process.env.NEXT_PUBLIC_API_DEBUG === 'true',
  environment: process.env.NODE_ENV || 'development',

  // Feature flags
  features: {
    chat: true,
    models3D: true,
    inspections: true,
    contracts: true,
    ocr: true,
  },

  // API configuration
  api: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },

  // File upload
  upload: {
    maxSizeMB: 50,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedModelTypes: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
  },

  // Pagination
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },

  // SignalR (WebSocket)
  signalR: {
    hubUrl: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/hubs` : 'http://localhost:8080/api/hubs',
  },
} as const;

/**
 * Check if running in development mode
 */
export const isDevelopment = config.environment === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = config.environment === 'production';

/**
 * Check if running in test mode
 */
export const isTest = config.environment === 'test';
