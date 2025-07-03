/**
 * Production Configuration
 * 
 * Production-specific settings and optimizations including:
 * - Performance optimizations
 * - Security hardening
 * - Cache configuration
 * - Rate limiting
 * - Certificate pinning
 * 
 * @module @core/config/production
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { getEnv } from './environment';

// ========================================
// PERFORMANCE CONFIGURATION
// ========================================

export const PRODUCTION_PERFORMANCE = {
  // API Configuration
  API_TIMEOUT: 30000, // 30 seconds
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000,
  
  // Cache Configuration
  CACHE_TTL: 3600000, // 1 hour
  CACHE_MAX_SIZE: 100, // Maximum cached items
  CACHE_CLEANUP_INTERVAL: 1800000, // 30 minutes
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_ENDPOINTS: {
    '/auth/login': { window: 300000, max: 5 }, // 5 attempts per 5 minutes
    '/auth/register': { window: 3600000, max: 3 }, // 3 per hour
    '/properties': { window: 60000, max: 30 }, // 30 per minute
    '/search': { window: 60000, max: 20 }, // 20 per minute
  },
  
  // Memory Management
  MEMORY_WARNING_THRESHOLD: 0.8, // 80% memory usage
  MEMORY_CRITICAL_THRESHOLD: 0.9, // 90% memory usage
  MEMORY_CHECK_INTERVAL: 60000, // 1 minute
};

// ========================================
// SECURITY CONFIGURATION
// ========================================

export const PRODUCTION_SECURITY = {
  // Certificate Pinning
  CERTIFICATE_PINS: [
    {
      domain: 'api.hoy.com',
      pins: [
        'sha256/PRODUCTION_PIN_1_HERE',
        'sha256/PRODUCTION_PIN_2_HERE',
      ],
      includeSubdomains: true,
      expiresAt: new Date('2025-12-31').getTime(),
    },
  ],
  
  // Token Configuration
  TOKEN_ROTATION_INTERVAL: 86400000, // 24 hours
  TOKEN_ENCRYPTION_ENABLED: true,
  TOKEN_DEVICE_BINDING: true,
  
  // Session Configuration
  SESSION_TIMEOUT: 43200000, // 12 hours
  SESSION_IDLE_TIMEOUT: 1800000, // 30 minutes
  SESSION_ROTATION_ENABLED: true,
  
  // API Key Configuration
  API_KEY_ROTATION_INTERVAL: 2592000000, // 30 days
  API_KEY_VALIDATION_INTERVAL: 3600000, // 1 hour
};

// ========================================
// MONITORING CONFIGURATION
// ========================================

export const PRODUCTION_MONITORING = {
  // Error Reporting
  ERROR_REPORTING_ENABLED: true,
  ERROR_SAMPLING_RATE: 1.0, // 100% in production
  ERROR_BATCH_SIZE: 10,
  ERROR_BATCH_INTERVAL: 30000, // 30 seconds
  
  // Performance Monitoring
  PERFORMANCE_MONITORING_ENABLED: true,
  PERFORMANCE_SAMPLING_RATE: 0.1, // 10% sampling
  PERFORMANCE_METRICS: [
    'api_response_time',
    'screen_load_time',
    'memory_usage',
    'cache_hit_rate',
  ],
  
  // Analytics
  ANALYTICS_ENABLED: true,
  ANALYTICS_BATCH_SIZE: 50,
  ANALYTICS_BATCH_INTERVAL: 60000, // 1 minute
};

// ========================================
// FEATURE FLAGS
// ========================================

export const PRODUCTION_FEATURES = {
  // Debug Features (all disabled in production)
  ENABLE_DEBUG_COMPONENTS: false,
  ENABLE_MEMORY_MONITOR: false,
  ENABLE_NETWORK_LOGGER: false,
  ENABLE_PERFORMANCE_OVERLAY: false,
  
  // Security Features (all enabled in production)
  ENABLE_CERTIFICATE_PINNING: true,
  ENABLE_CSRF_PROTECTION: true,
  ENABLE_SESSION_MANAGEMENT: true,
  ENABLE_TOKEN_ENCRYPTION: true,
  ENABLE_API_KEY_ROTATION: true,
  ENABLE_INPUT_SANITIZATION: true,
  ENABLE_RATE_LIMITING: true,
  
  // Performance Features
  ENABLE_CACHING: true,
  ENABLE_LAZY_LOADING: true,
  ENABLE_IMAGE_OPTIMIZATION: true,
  ENABLE_REQUEST_BATCHING: true,
};

// ========================================
// PRODUCTION VALIDATION
// ========================================

/**
 * Validate production configuration
 */
export function validateProductionConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check API URL
  const apiUrl = getEnv('API_URL');
  if (!apiUrl || apiUrl.includes('localhost') || apiUrl.includes('ngrok')) {
    errors.push('Invalid production API URL');
  }
  
  // Check API Keys
  if (!getEnv('EXCHANGE_RATE_API_KEY')) {
    errors.push('Missing EXCHANGE_RATE_API_KEY');
  }
  
  if (!getEnv('CURRENCY_API_KEY')) {
    errors.push('Missing CURRENCY_API_KEY');
  }
  
  if (!getEnv('MAPBOX_API_KEY')) {
    errors.push('Missing MAPBOX_API_KEY');
  }
  
  // Check security settings
  if (!getEnv('ENABLE_CERTIFICATE_PINNING')) {
    errors.push('Certificate pinning must be enabled in production');
  }
  
  if (!getEnv('ENABLE_TOKEN_ENCRYPTION')) {
    errors.push('Token encryption must be enabled in production');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ========================================
// PRODUCTION INITIALIZATION
// ========================================

/**
 * Initialize production configuration
 */
export function initializeProduction(): void {
  // Validate configuration
  const validation = validateProductionConfig();
  if (!validation.valid) {
    throw new Error(`Production configuration invalid: ${validation.errors.join(', ')}`);
  }
  
  // Disable console in production
  if (getEnv('IS_PRODUCTION')) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    
    // Keep warn and error for critical issues
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args: any[]) => {
      if (getEnv('ENABLE_VERBOSE_LOGGING')) {
        originalWarn.apply(console, args);
      }
    };
    
    console.error = (...args: any[]) => {
      originalError.apply(console, args);
    };
  }
  
  // Set global error handler
  if (getEnv('IS_PRODUCTION')) {
    const globalHandler = (error: Error, isFatal?: boolean) => {
      // Log to analytics
      // analytics.logError(error, { fatal: isFatal });
      
      // Prevent app crash for non-fatal errors
      if (!isFatal) {
        console.error('Global error caught:', error);
      }
    };
    
    // React Native global error handler
    if (typeof global !== 'undefined' && (global as any).ErrorUtils) {
      (global as any).ErrorUtils.setGlobalHandler(globalHandler);
    }
  }
}

// ========================================
// PRODUCTION EXPORTS
// ========================================

export const ProductionConfig = {
  performance: PRODUCTION_PERFORMANCE,
  security: PRODUCTION_SECURITY,
  monitoring: PRODUCTION_MONITORING,
  features: PRODUCTION_FEATURES,
  validate: validateProductionConfig,
  initialize: initializeProduction,
}; 